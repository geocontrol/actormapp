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
    var collection = db.get('workshops');

    collection.find({}, function (err, docs){
		res.render('workshopshome', {title: 'Actor Mapping - Workshops', workshops: docs});
	});		
});

/* GET /workshops/add */
router.get('/add', function(req, res, next) {
	// Set our internal DB variable
    var db = req.db;
    // Set our collection
    var collection = db.get('workshops');

    collection.find({}, function (err, docs){
		res.render('workshopshome', {title: 'Actor Mapping - Workshops', workshops: docs});
	});	
});

/* POST /workshops/add */
router.post('/add', function(req, res, next) {
	console.log('Add a Workshop:');
	console.log(req.body);

    // Set our internal DB variable
    var db = req.db;

    // Take the parameters into a JSON object
	var Workshop = {'name' : req.body.name};

	console.log('JSON - Workshop : ' + JSON.stringify(Workshop));

    // Set our collection
    var collection = db.get('workshops');

    // Submit to the DB
    collection.insert(Workshop, function (err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
        }
        else {
            // And forward to success page
            res.redirect("/workshops");
        }
    });
});

/* GET /workshops/id */
router.get('/:id', function(req, res, next) {
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
});

module.exports = router;
