var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  var scripts = [{ script: '/socket.io/socket.io.js' }];
  res.render('home', { title: 'Express', scripts: scripts });
});

module.exports = router;