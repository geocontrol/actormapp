var express = require('express');
var router = express.Router();
var passport = require('passport');
var Account = require('../models/account');

/* GET home page. */
router.get('/', function(req, res, next) {
	if(req.user) {
		res.render('feedback', { title: 'Feedback', user: req.user });
	} else {
		// No user details rediect to login
		res.redirect('/login');
	}
});


module.exports = router;