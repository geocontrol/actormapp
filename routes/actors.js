var express = require('express');
var router = express.Router();

var database = require('../database');
// custom library
//var config = require('../support/config');

/* GET /actors listing */
router.get('/', function(req, res, next) {
	// Set our internal DB variable
    var db = req.db;
    // Set our collection
    var collection = db.get('actors');

    collection.find({}, function (err, docs){
		res.render('actorshome', {title: 'Actor Mapping - Actors', actors: docs});
	});		
});

/* GET /actors/add */
router.get('/add', function(req, res, next) {
 res.render('actors', {title: 'Actor Mapping - Add an Actor'});
});

/* POST /actors/add */
router.post('/addold', function(req, res, next) {
	console.log('Add an Actor:');
	console.log(req.body);

	// Take the parameters into a JSON object
	var Actor = {'name' : req.body.name};
	for(var index in req.body.label) {
		Actor[req.body.label[index]] = req.body.value[index];
	}
	console.log('JSON - Actor : ' + JSON.stringify(Actor));
	database.insertActor(db, Actor, function() {
		// 
	});
	res.send('JSON - Actor : ' + JSON.stringify(Actor));
});

/* POST to Add User Service */
router.post('/add', function(req, res, next) {
	console.log('Add an Actor:');
	console.log(req.body);

    // Set our internal DB variable
    var db = req.db;

    // Take the parameters into a JSON object
	var Actor = {'name' : req.body.name};

	if (Array.isArray(req.body.label)) {
		//
		for(var index in req.body.label) {
			Actor[req.body.label[index]] = req.body.value[index];
		};
	} else {
		Actor[req.body.label] = req.body.value;
	};

	//for(var index in req.body.label) {
	//	Actor[req.body.label[index]] = req.body.value[index];
	//};

	console.log('JSON - Actor : ' + JSON.stringify(Actor));

    // Set our collection
    var collection = db.get('actors');

    // Submit to the DB
    collection.insert(Actor, function (err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
        }
        else {
            // And forward to success page
            res.redirect("/");
        }
    });
});

/* GET /actors/id */
router.get('/:id', function(req, res, next) {
	console.log('Get the details of an Actor:');
	console.log(req.body);

    // Set our internal DB variable
    var db = req.db;

    // Set our collection
    var collection = db.get('actors');

	collection.findById(req.params.id, function (err, post) {
		if (err) return next(err);
		res.render('actordetails', {title: 'Actor Mapping - Actors', actor: post});
	});
});



module.exports = router;