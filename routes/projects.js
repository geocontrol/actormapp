var express = require('express');
var router = express.Router();
var ObjectId = require('mongodb').ObjectID;
var database = require('../database');
// custom library
//var config = require('../support/config');
var multer = require('multer');
var upload = multer({ dest: 'uploads/' });
var sizeOf = require('image-size');
require('string.prototype.startswith');
var passport = require('passport');
var Account = require('../models/account');

/* GET /projects listing */
router.get('/', function(req, res, next) {
	if(req.user) {
		// Set our internal DB variable
	    var db = req.db;
	    // Set our collection
	    var collection = db.get('projects');

	    collection.find({user_id: req.user._id}, function (err, docs){
			console.log('Returned Projects : ' + JSON.stringify(docs));
			res.render('projectshome', {title: 'Actor Mapping - Projects', projects: docs, user: req.user });
		});
	} else {
		// No user details rediect to login
		res.redirect('/login');
	}	
});


/* POST /projects/add */
router.post('/add', function(req, res, next) {
	if(req.user) {
		console.log('Add a Project:');
		console.log(req.body);

	    // Set our internal DB variable
	    var db = req.db;

	    // Take the parameters into a JSON object
		var Project = {'name' : req.body.name, 'user_id' : req.user._id, 'problemtext' : req.body.problemtext};

		console.log('JSON - Project : ' + JSON.stringify(Project));

	    // Set our collection
	    var collection = db.get('projects');

	    // Submit to the DB
	    collection.insert(Project, function (err, doc) {
	        if (err) {
	            // If it failed, return error
				console.log(err);
	            res.send("There was a problem adding the information to the database.");
	        }
	        else {
	            // And forward to success page
	            res.redirect("/projects/" + doc._id);
	        }
	    });
	} else {
		// No user details rediect to login
		res.redirect('/login');
	}
});

/* GET /projects/id */
router.get('/:id', function(req, res, next) {
	console.log('Get the details of an Project:' + req.params.id);
	console.log(req.body);

	if(req.user) {
	    // Set our internal DB variable
	    var db = req.db;

	    // Set our collection
	    var collection = db.get('projects');

		collection.findOne(req.params.id, function (err, post) {
			if (err) return next(err);
		 	console.log('Project : ' + JSON.stringify(post));
			res.render('projectdetails', {title: 'Actor Mapping - Projects', project: post, user: req.user});
		});
	} else {
		// No user details rediect to login
		res.redirect('/login');
	}
    
});

/* GET /projects/delete/id */
router.get('/delete/:id', function(req, res, next) {
	if(req.user) {
		console.log('Delete the Project : ' + req.params.id);

		var id = req.params.id;
		console.log('ID: ' + id);
		// Set our internal DB variable
	    var db = req.db;
	    // Set our collection
	    var collection = db.get('projects');

	    console.log(collection);

	    collection.remove({ "_id": req.params.id }, function (err, result){
	    	if(err){
	    		console.log(err);
	    	} else {
	    		 res.redirect('/projects');
	    	}
		});
	} else {
		// No user details rediect to login
		res.redirect('/login');
	}
});


module.exports = router;