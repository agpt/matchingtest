var express = require('express');
var router = express.Router();
var controller = require('../controller');

/* GET home page. */
router.get('/', controller.home);
router.post('/init', controller.init);
router.post('/initmatch', controller.initMatch);

module.exports = router;
