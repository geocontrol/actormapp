var express = require('express');
var router = express.Router();
var ObjectId = require('mongodb').ObjectID;
var database = require('../database');
// custom library
//var config = require('../support/config');

/* POST /relationships/add */
router.post('/add', function(req, res, next) {
	console.log('Add an Realationships for an Actor:');
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