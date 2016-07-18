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

/* GET /workshops listing */
router.get('/', function(req, res, next) {
	if(req.user) {
		// Set our internal DB variable
	    var db = req.db;
	    // Set our collection
	    var collection = db.get('workshops');

	    collection.find({}, function (err, docs){
			res.render('workshopshome', {title: 'Actor Mapping - Workshops', workshops: docs});
		});	
	} else {
		// No user details rediect to login
		res.redirect('/login');
	}	
});

/* GET /workshops/add */
router.get('/add', function(req, res, next) {
	if(req.user) {
		// Set our internal DB variable
	    var db = req.db;
	
	    // Set our collection
	    var collection = db.get('workshops');

	    collection.find({}, function (err, docs){
			res.render('workshopshome', {title: 'Actor Mapping - Workshops', workshops: docs});
		});	
	} else {
		// No user details rediect to login
		res.redirect('/login');
	}
});

/* POST /workshops/add */
router.post('/add', function(req, res, next) {
	if(req.user) {
		console.log('Add a Workshop:');
		console.log(req.body);

	    // Set our internal DB variable
	    var db = req.db;

	    // Take the parameters into a JSON object
		var Workshop = {'name' : req.body.name, 'user_id' : req.user._id, 'project_id' : req.body.project_id};

		console.log('JSON - Workshop : ' + JSON.stringify(Workshop));

	    // Set our collection
	    var projectscollection = db.get('projects');
		var workshopscollection = db.get('workshops');

	    // Submit to the DB
	    workshopscollection.insert(Workshop, function (err, doc) {
	        if (err) {
	            // If it failed, return error
	            res.send("There was a problem adding the information to the database.");
	        } else {
				projectscollection.findById(req.body.project_id, function (err, post) {
					if (post.workshops) {
						var JSONworkshops = {'workshops':post.workshops};
						console.log(JSON.stringify(JSONworkshops));
					} else {
						var JSONworkshops = {'workshops':[]};
						console.log(JSON.stringify(JSONworkshops));
					}
				
					JSONname = {'name': req.body.name, 'id': doc._id};
					JSONworkshops.workshops.push(JSONname);
            
					projectscollection.update({_id: req.body.project_id},{$set: JSONworkshops}, {w: 1}, function(err, count, status){
						console.log(status);
					});
					// And forward to success page
	            	res.redirect("/workshops/" + doc._id);
				});
	        }
	    });
	} else {
		// No user details rediect to login
		res.redirect('/login');
	}
});

/* GET /workshops/id */
router.get('/:id', function(req, res, next) {
	if(req.user) {
		console.log('Get the details of an Workshop:' + req.params.id);
		console.log(req.body);

	    // Set our internal DB variable
	    var db = req.db;

	    // Set our collection
	    var collection = db.get('workshops');

		collection.findById(req.params.id, function (err, post) {
			if (err) return next(err);
		 	console.log('Workshop : ' + post);
			res.render('workshopdetails', {title: 'Actor Mapping - Workshops', workshop: post});
		});	
	} else {
		// No user details rediect to login
		res.redirect('/login');
	}
});

router.post('/relupdate', function(req, res, next) {
	if(req.user) {
		console.log('Update the relationships');
		console.log(req.body);
	
		workshopJSON = req.body;
	
		console.log('Workshop ID: ' + workshopJSON._id);
	    // Set our internal DB variable
	    var db = req.db;

	    // Set our collection
	    var collection = db.get('workshops');
	
		collection.update({'_id': workshopJSON._id}, workshopJSON, function(err, results) {
			if (err) console.log(err);
	        console.log('DB UPDATE: ' + results);
       
		   	res.send('200');
	   });
	} else {
		// No user details rediect to login
		res.redirect('/login');
	}

});

module.exports = router;
