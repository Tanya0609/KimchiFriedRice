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
  return db.query('SELECT * FROM subscriptions where id='+subscriptionId+';')
  .then((response)=>{
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

server.get('/subscriptionType/:subscriptionTypeId', function (req, res, next) {
  console.log(req.params.subscriptionTypeId);
  res.send(req.params);
  return next();
});

server.post('/subscriptionType/create', function (req, res, next) {
  if (req.body) {
    //body: name, cost, business_id, billing_type, create_date
    // let name = req.params.name;
    // let cost = req.params.cost;
    // let businessId = req.params.bussinessId;
    // let billingType = req.params.billingType;
    // let createDate = moment().format('YYYY-MM-DD');

    let name = 'bitch';
    let cost = '100';
    let businessId = '101';
    let billingType = 'years';
    let createDate = "2017-02-09";

    return db.query('select * from bank.businesses where id = '+businessId+';')
    .then((response)=>{
      console.log(response);
      return db.query('insert into bank.subscriptions_type (business_id,name,cost,create_date,billing_type) values (' + businessId+',\''+ name+'\','+cost+',\''+ createDate +'\',\''+ billingType + '\');')
    })
  .then((response)=>{
    console.log(response,"here");
  return db.query('SELECT * FROM bank.subscriptions_type where business_id= '+ businessId +' and name = \''+ name +'\' and cost = '+cost+' and billing_type = \''+billingType+'\';')
})
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
}
});
