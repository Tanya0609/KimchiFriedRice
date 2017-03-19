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

console.log('hello world')


//var columns = ['id'];
