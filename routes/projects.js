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

/* GET /workshops listing */
router.get('/', function(req, res, next) {
	// Set our internal DB variable
    var db = req.db;
    // Set our collection
    var collection = db.get('projects');

    collection.find({}, function (err, docs){
		res.render('projectshome', {title: 'Actor Mapping - Projects', projects: docs});
	});		
});

/* GET /projects/add */
router.get('/add', function(req, res, next) {
	// Set our internal DB variable
    var db = req.db;
    // Set our collection
    var collection = db.get('projects');

    collection.find({}, function (err, docs){
		res.render('projectshome', {title: 'Actor Mapping - Projects', projects: docs});
	});	
});

/* POST /projects/add */
router.post('/add', function(req, res, next) {
	console.log('Add a Project:');
	console.log(req.body);

    // Set our internal DB variable
    var db = req.db;

    // Take the parameters into a JSON object
	var Project = {'name' : req.body.name};

	console.log('JSON - Project : ' + JSON.stringify(Project));

    // Set our collection
    var collection = db.get('projects');

    // Submit to the DB
    collection.insert(Project, function (err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
        }
        else {
            // And forward to success page
            res.redirect("/projects");
        }
    });
});

/* GET /projects/id */
router.get('/:id', function(req, res, next) {
	console.log('Get the details of an Project:' + req.params.id);
	console.log(req.body);

    // Set our internal DB variable
    var db = req.db;

    // Set our collection
    var collection = db.get('projects');

	collection.findById(req.params.id, function (err, post) {
		if (err) return next(err);
	 	console.log('Project : ' + post);
		res.render('projectdetails', {title: 'Actor Mapping - Projects', project: post});
	});
});


module.exports = router;