var NRP = require('node-redis-pubsub');
var nrp = new NRP({ host: 'localhost', port: 6379 });

module.exports.nrp = nrp;
