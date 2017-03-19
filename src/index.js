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
  console.log(req.params.subscriptionId);
  res.send(req.params);
  return next();
});


server.get('/subscriptionType/:subscriptionTypeId', function (req, res, next) {
  console.log(req.params.subscriptionTypeId);
  res.send(req.params);
  return next();
});

server.post('/subscriptionType/create', function (req, res, next) {
  if (req.body) {
    console.log(req.body);
    res.send(req.params);
    return next();
  }
});
