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

server.listen(8080, function () {
  console.log('%s listening at %s', server.name, server.url);
});

server.get('/subscription/:subscriptionId', function (req, res, next) {
  let subscriptionId = req.params.subscriptionId;
  return db.query('SELECT * FROM subscriptions where id=' + subscriptionId + ';')
    .then((response) => {
      console.log(response)
      console.log(req.params.subscriptionId);
      res.send(response);

      return next();
    })
    .catch((err) => {
      res.send(err);
      console.log(err)
      return next();
    });
});

server.post('/subscription/create', function (req, res, next) {
  if (req.body) {
    //userId, bussinessId, type_id, date-created
    let type_id = req.body.type_id;
    let business_id = req.body.business_id;
    let subscriptionObj = null;
    let userObj = null;
    let first_name = req.body.first_name;
    let last_name =  req.body.first_name;
    let email =  req.body.email;
    let cc_number =  req.body.cc_number;
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

//GET A LIST OF SUBSCRIBERS
server.get('/subscription/:businessId', function (req, res, next) {
  let businessId = req.params.businessId;
  return db.query('SELECT * FROM subscriptions where business_id='+businessId+';')
  .then((response)=>{
    console.log(response)
    res.send(response);
    return next();
  })
  .catch((err) => {
    res.send(err);
    console.log(err)
    return next();
  });
});

server.get('/subscription/:businessId/:subscriptionTypeId', function (req, res, next) {
  let businessId = req.params.businessId;
  let subscriptionTypeId = req.params.subscriptionTypeId;
  return db.query('SELECT * FROM subscriptions where business_id='+businessId+' and subscription_type_id ='+ subscriptionTypeId +';')
  .then((response)=>{
    console.log(response)
    res.send(response);
    return next();
  })
  .catch((err) => {
    res.send(err);
    console.log(err)
    return next();
  });
});

server.get('/subscriptionType/:bussinessId/:subscriptionTypeId', function (req, res, next) {
  console.log(req.params.subscriptionTypeId, req.params.bussinessId);
  res.send(req.params);
  return next();
});

server.post('/subscriptionType/create', function (req, res, next) {
  if (req.body) {
    //body: name, cost, business_id, billing_type, create_date
     let name = req.params.name;
     let cost = req.params.cost;
     let businessId = req.params.bussinessId;
     let billingType = req.params.billingType;
     let createDate = moment().format('YYYY-MM-DD');

    //let name = 'bitch';
    //let cost = '100';
    //let businessId = '101';
    //let billingType = 'years';
    //let createDate = "2017-02-09";

    return db.query('select * from bank.businesses where id = ' + businessId + ';')
      .then((response) => {
        console.log(response);
        return db.query('insert into bank.subscriptions_type (business_id,name,cost,create_date,billing_type) values (' + businessId + ',\'' + name + '\',' + cost + ',\'' + createDate + '\',\'' + billingType + '\');')
      })
      .then((response) => {
        console.log(response, "here");
        return db.query('SELECT * FROM bank.subscriptions_type where business_id= ' + businessId + ' and name = \'' + name + '\' and cost = ' + cost + ' and billing_type = \'' + billingType + '\';')
      })
      .then((response) => {
        console.log(response)
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
