var pgp = require('pg-promise')();
var cn = {
  host: 'kfr-78d8gx42.cloudapp.net',
  port: 26257,
  database: 'bank',
  user: 'root'
};
var db = pgp(cn);

var restify = require('restify');
var plugins = require('restify-plugins');
var moment = require('moment');
const server = restify.createServer({
  name: 'myapp',
  version: '1.0.0'
});
server.use(plugins.acceptParser(server.acceptable));
server.use(plugins.queryParser());
server.use(plugins.bodyParser());
server.use(restify.CORS());

server.listen(8080, function () {
  console.log('%s listening at %s', server.name, server.url);
});

// doing nothing
server.get('/subscription/:subscriptionId', function (req, res, next) {
  let subscriptionId = req.params.subscriptionId;
  const queryString = `SELECT * FROM subscriptions where id=${subscriptionId};`
  return db.query(queryString)
    .then((response) => {
      res.send(response);
      return next();
    })
    .catch((err) => {
      res.send(err);
      console.log(err)
      return next();
    });
});

//create a subscription record for user
server.post('/subscription/create', function (req, res, next) {
  if (req.body) {
    const body = req.body
    //userId, bussinessId, type_id, date-created
    let type_id = body.type_id;
    let business_id = body.business_id;
    let subscriptionObj = null;
    let userObj = null;
    let first_name = body.first_name;
    let last_name = body.last_name;
    let email = body.email;
    let cc_number = body.cc_number;
    return db.query('SELECT * FROM subscriptions_type where id=2  and business_id=' + business_id + ";")
      .then((response) => {
        if (response.length == 1) {
          console.log(Object.keys(response[0]), response[0].id);
          subscriptionObj = response[0];
          return true;
        }
        else {
          res.send(400, "RECORD NOT FOUND");
          return next();
        }
      })
      .then(() => db.query("INSERT INTO USERS (first_name, last_name, email, cc_number) VALUES ('"
        + first_name + "','" + last_name + "','" + email + "','" + cc_number + "');"))
      .then(() => db.query("SELECT * FROM USERS where email='" + email + "';"))
      .then((response) => {
        userObj = response[0];
        console.log(subscriptionObj);
        let user_id = userObj.id;
        let startDate = moment().format('YYYY-MM-DD');
        let endDate = moment().add(1, subscriptionObj.billing_type).format('YYYY-MM-DD');
        let business_id = subscriptionObj.business_id;
        let subscriptions_type = subscriptionObj.id;
        return db.query('INSERT INTO SUBSCRIPTIONS (user_id, business_id, subscription_type_id, start_date, end_date) VALUES ('
          + user_id + "," + business_id + "," + subscriptions_type + ",'" + startDate + "','" + endDate + "');");
      })
      .then(() => db.query('SELECT * FROM SUBSCRIPTIONS where user_id='
        + userObj.id + "AND subscription_type_id=" + subscriptionObj.id + ";"))
      .then(response => {
        console.log(response);
        res.send(response[0]);
        return next();
      })
      .catch((err) => {
        res.send(err);
        console.log(err)
        return next();
      });
  }
});

//GET A LIST OF SUBSCRIBERS for selected company
server.get('/company/:businessId', function (req, res, next) {
  let businessId = req.params.businessId;
  return db.query('SELECT * FROM subscriptions s where s.business_id=' + businessId + ' left join users u on u.id = s.user_id left join subscription_type_id s on s.subscription_type_id = st.id;')
    .then((response) => {
      res.send(response);
      return next();
    })
    .catch((err) => {
      res.send(err);
      console.log(err)
      return next();
    });
});

//GET A LIST OF SUBSCRIBERS for specific subscriptions_type of selected company
server.get('/company/:businessId/:subscriptionTypeId', function (req, res, next) {
  let businessId = req.params.businessId;
  let subscriptionTypeId = req.params.subscriptionTypeId;

  return db.query('SELECT * FROM subscriptions s, users u, subscriptions_type st where s.business_id='
    + businessId + ' and subscription_type_id='+subscriptionTypeId+' and u.id = s.user_id and s.subscription_type_id = st.id;')
    .then((response) => {
      res.send(response);
      return next();
    })
    .catch((err) => {
      res.send(err);
      console.log(err)
      return next();
    });
});

//create a new bussiness record
server.post('/company/create', function (req, res, next) {
  if (req.body) {
    const {name, email, password} = req.body;
    const queryString = `SELECT * FROM bank.businesses WHERE name <> '${name}' AND email <> '${email}';`
    return db.query(queryString)
      .then((response) => {
        const queryString = `INSERT INTO bank.businesses (name,email,password) VALUES ('${name}', '${email}', '${password}');`
    return db.query(queryString)
})
    .then(() => db.query(`SELECT * FROM bank.businesses where name ='${name}' AND email = '${email}';`))
    .then((response) => {
        res.send(response);
        return next();
      })
      .catch((err) => {
        res.send(err);
        console.log(err)
        return next();
      });
  }
});

//when business creates a new subscriptionType
server.post('/subscriptionType/create', function (req, res, next) {
  if (req.body) {
    const {name, cost, businessId, billingType} = req.body;
    let createDate = moment().format('YYYY-MM-DD');
    const queryString = `SELECT * FROM bank.businesses WHERE id = ${businessId};`
    return db.query(queryString)
      .then((response) => {
        const queryString = `INSERT INTO bank.subscriptions_type (business_id,name,cost,create_date,billing_type) values (${businessId},'${name}',${cost},'${createDate}','${billingType}');`
        return db.query(queryString)
      })
      .then((response) => {
        const queryString = `SELECT * FROM bank.subscriptions_type where business_id= ${businessId} and name = '${name}' and cost = ${cost} and billing_type = '${billingType}';`
        return db.query(queryString);
      })
      .then((response) => {
        res.send(response);
        return next();
      })
      .catch((err) => {
        res.send(err);
        console.log(err)
        return next();
      });
  }
});

// get a list of subscriptions of a business
server.get('/subscriptions/:businessId', function (req, res, next) {
  let businessId = req.params.businessId;
  const queryString = `SELECT * FROM subscriptions_type WHERE business_id=${businessId};`
  return db.query(queryString)
    .then((response) => {
      res.send(response);
      return next();
    })
    .catch((err) => {
      res.send(err);
      console.log(err)
      return next();
    });
});

//check if login information correct 
server.get('/login/:email/:password', function (req, res, next) {
  const {email, password} = req.params;
  const queryString = `SELECT id FROM businesses WHERE email='${email}' AND password='${password}';`
  return db.query(queryString)
    .then((response) => {
      res.send(response);
      return next();
    })
    .catch((err) => {
      res.send(err);
      console.log(err)
      return next();
    });
});
