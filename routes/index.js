var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.json({ title: 'OdinBook', message: 'Welcome to OdinBook!' });
});

module.exports = router;
