var PubSub = require('../service/pubsub');
var Service = require('../service');

module.exports.home = function (req, res) {
  res.status(200);
  res.json({ name: 'hello world !' });
};

module.exports.init = function (req, res) {
  Service.createJSON();
  res.status(200);
  res.end();
};

module.exports.initMatch = function (req, res) {
  Service.initMatch();
  res.status(200);
  res.end();
};
