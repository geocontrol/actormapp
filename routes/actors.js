var express = require('express');
var router = express.Router();
var ObjectId = require('mongodb').ObjectID;
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
            res.redirect("/actors");
        }
    });
});

/* GET /actors/id */
router.get('/:id', function(req, res, next) {
	console.log('Get the details of an Actor:' + req.params.id);
	console.log(req.body);

    // Set our internal DB variable
    var db = req.db;

    // Set our collection
    var collection = db.get('actors');

	collection.findById(req.params.id, function (err, post) {
		if (err) return next(err);
		collection.find({}, function (err, actors){
			if (err) return next(err);
			var actorDropDown = "<select name='actorTarget[]'>";
			actors.forEach(function(actordetail) {
		 		actorDropDown = actorDropDown + "<option value='" + actordetail._id + "'>" + actordetail.name + "</option>"  
		 	});
		 	actorDropDown = actorDropDown + "</select>";
		 	console.log('THE Actor : ' + post);
			res.render('actordetails', {title: 'Actor Mapping - Actors', actor: post, actordropdown: actorDropDown});
		});
	});
});

/* PUT /actors/id */
router.post('/:id', function(req, res, next) {
	console.log('Update the Actor : ' + req.params.id);
	console.log(req.body);

	var Actor = {};
	// Rebuild the Actor object
	for(var parameterName in req.body) {
		if(parameterName != 'label' && parameterName != 'value' && parameterName != 'relTarget' && parameterName != 'actorTarget') {
			console.log('NAME: ' + parameterName + ' : ' + req.body[parameterName]);
			if(parameterName != '_method' && parameterName != 'submit'){
				Actor[parameterName] = req.body[parameterName];
			}
		} else {
			if(parameterName != 'relTarget' && parameterName != 'actorTarget') {
			if (Array.isArray(req.body.label)) {
				for(var index in req.body.label) {
					Actor[req.body.label[index]] = req.body.value[index];
				};
			} else {
				Actor[req.body.label] = req.body.value;
			};
			} else {
				// Write in the relTarget & actorTarget values
				Actor['relTarget'] = req.body.relTarget;
				Actor['actorTarget'] = req.body.actorTarget;
			};
		};

	};

	console.log(Actor);
    // Set our internal DB variable
    var db = req.db;

    // Set our collection
    var collection = db.get('actors');

    collection.update({_id: req.params.id},Actor);

    res.redirect('/actors/' + req.params.id);
});

/* GET /actors/delete/id */
router.get('/delete/:id', function(req, res, next) {
	console.log('Delete the Actor : ' + req.params.id);

	var id = req.params.id;
	console.log('ID: ' + id);
	// Set our internal DB variable
    var db = req.db;
    // Set our collection
    var collection = db.get('actors');

    console.log(collection);

    collection.remove({ "_id": req.params.id }, function (err, result){
    	if(err){
    		console.log(err);
    	} else {
    		 res.redirect('/actors');
    	}
	});
   
});

module.exports = router;