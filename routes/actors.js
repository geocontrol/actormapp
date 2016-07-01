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

/* POST /actors/add2 */
router.post('/add2', function(req, res, next) {
	console.log('Add Actors:');
	console.log(req.body);

    // Set our internal DB variable
    var db = req.db;
	
    // Set our collection
    var collection = db.get('workshops');
	var actorscollection = db.get('actors');

	collection.findById(req.body._id, function (err, post) {
		if (err) return next(err);
	 	console.log('Workshop : ' + post);
		if (post.nodes) {
			var JSONnodes = {'nodes':post.nodes};
			console.log(JSON.stringify(JSONnodes));
		} else {
			var JSONnodes = {'nodes':[]};
			console.log(JSON.stringify(JSONnodes));
		}

		if (Array.isArray(req.body.name)) {
			//
			req.body.name.forEach(function(name) {
				console.log(name);
				var JSONname = {'name': name};
				console.log(JSON.stringify(JSONname));
				
				actorscollection.insert(JSONname, {w: 1}, function(err, doc){
					JSONname = {'name': name, 'id': doc._id};
					
				});
				JSONnodes.nodes.push(JSONname);
				console.log(JSON.stringify(JSONnodes));
			});
		} else {
			var JSONname = {'name': req.body.name};
			
			actorscollection.insert(JSONname, {w: 1}, function(err, doc){
				JSONname = {'name': name, 'id': doc[0]._id};
				
			});
			JSONnodes.nodes.push(JSONname);
			console.log(JSON.stringify(JSONnodes));
		};
		
		console.log(JSON.stringify(JSONnodes));
		collection.update({_id: req.body._id},{$set: JSONnodes}, {w: 1}, function(err, count, status){
			console.log(status);
		});
	});
	
	res.redirect('/workshops/' + req.body._id);
	
});


/* POST /actors/addrel2 */
router.post('/addrel2', function(req, res, next) {
	console.log('Add Relationships:');
	console.log(req.body);

    // Set our internal DB variable
    var db = req.db;
	
    // Set our collection
    var collection = db.get('workshops');
	
	collection.findById(req.body._id, function (err, post) {
		if (err) return next(err);
	 	console.log('Workshop : ' + post);
		if (post.links) {
			var JSONlinks = {'links':post.links};
			console.log('All Links: ' + JSON.stringify(JSONlinks));
		} else {
			var JSONlinks = {'links':[]};
			console.log('All Links: ' + JSON.stringify(JSONlinks));
		}

		if (Array.isArray(req.body.source)) {
			for(var index in req.body.source) {
				JSONrel = {'source': Number(req.body.source[index]), 'target': Number(req.body.target[index]), 'value': Number(req.body.value[index])};
				console.log('Relationship: ' + JSON.stringify(JSONrel));
				
				JSONlinks.links.push(JSONrel);
				console.log('All Links: ' + JSON.stringify(JSONlinks));
			};
		} else {
			JSONrel = {'source': req.body.source, 'target': req.body.target, 'value': req.body.value};
			JSONlinks.links.push(JSONrel);
			console.log('All Links: ' + JSON.stringify(JSONlinks));
		};
			
		collection.update({_id: req.body._id},{$set: JSONlinks}, {w: 1}, function(err, count, status){
			console.log(status);
		});
	});
	
	res.redirect('/workshops/' + req.body._id);
});	
	
	
router.get('/map/mapdata/:id', function(req, res, next){
	console.log('Get data for a d3 actor map');
	console.log('Workshop ID: ' + req.params.id);
    // Set our internal DB variable
    var db = req.db;
	
    // Set our collection
    var collection = db.get('workshops');
	
	collection.findById(req.params.id, function (err, post) {
		console.log(JSON.stringify(post));
		res.send(JSON.stringify(post));
	});
});

/* GET /actors/map */
router.get('/map', function(req, res, next) {
	console.log('Get data for a d3 actor map');
	var JSONActorsTxt = '"nodes":[';
	var JSONLinksTxt = '"links":[';
	// Set our internal DB variable
    var db = req.db;
    // Set our collection
    var collection = db.get('actors');

    collection.find({}, function (err, actors){
    	if(err){
    		console.log(err);
    	} else {
		//res.render('actorshome', {title: 'Actor Mapping - Actors', actors: docs});
		// Create a new JSON formatted blob of data
		actors.forEach(function(actordetail) {
			// Add the actor details to the Actor array
	 		JSONActorsTxt = JSONActorsTxt + '{"id":"' + actordetail._id + '","name":"' + actordetail.name + '"},';  
			console.log(JSONActorsTxt);
			// Add the link/relationship details ro the Links array
			actordetail.actorTarget.forEach(function(target){
				JSONLinksTxt = JSONLinksTxt + '{"source":"' + actordetail._id + '","target":"' + target + '"},';
				console.log(JSONLinksTxt);
			});			
	 	});
		
		// close the array strings
		JSONActorsTxt = JSONActorsTxt + ']';
		JSONLinksTxt = JSONLinksTxt + ']';
		console.log('ACTOR JSON : ' + JSONActorsTxt);
		console.log('LINK JSON : ' + JSONLinksTxt);
		JSONText = '{ ' + JSONActorsTxt + ', ' + JSONLinksTxt + '}';
		console.log(JSONText);
		
		res.render('actormap', {json: JSONText});
		}
	});		
});


router.get('/map2', function(req, res, next) {
	res.render('actormap2');
});

router.get('/map/map3/:id', function(req, res, next) {
	console.log('Get the details of Workshop ID:' + req.params.id);
	res.render('actormap', {workshop_id: req.params.id});
});

/* GET /actors/map */
router.get('/map2data', function(req, res, next) {
	console.log('Get data for a d3 actor map');
	var JSONActorsTxt = '"nodes":[';
	// var JSONLinksTxt = '"links":[';
	var JSONLinksTxt = 'source,target,value\r';
	// Set our internal DB variable
    var db = req.db;
    // Set our collection
    var collection = db.get('actors');

    collection.find({}, function (err, actors){
    	if(err){
    		console.log(err);
    	} else {
		//res.render('actorshome', {title: 'Actor Mapping - Actors', actors: docs});
		// Create a new JSON formatted blob of data
		actors.forEach(function(actordetail) {
			// Add the actor details to the Actor array
	 		JSONActorsTxt = JSONActorsTxt + '{"id":"' + actordetail._id + '","name":"' + actordetail.name + '"}';  
			//console.log(JSONActorsTxt);
			// Add the link/relationship details ro the Links array
			if(actordetail.actorTarget){
			actordetail.actorTarget.forEach(function(target){
				valueNumber = Math.random();
				//JSONLinksTxt = JSONLinksTxt + '{"source":"' + actordetail._id + '","target":"' + target + '"},';
				JSONLinksTxt = JSONLinksTxt + '"' + actordetail._id + '","' + target + '",' + valueNumber + '\r';
				console.log(JSONLinksTxt);
			});			
			} else {
				valueNumber = Math.random();
				JSONLinksTxt = JSONLinksTxt + '"' + actordetail._id + '","' + actordetail._id + '",' + valueNumber + '\r';
			};
	 	});
		
		// close the array strings
		//JSONActorsTxt = JSONActorsTxt + ']';
		//JSONLinksTxt = JSONLinksTxt + ']';
		//console.log('ACTOR JSON : ' + JSONActorsTxt);
		//console.log('LINK JSON : ' + JSONLinksTxt);
		//JSONText = '{ ' + JSONActorsTxt + ', ' + JSONLinksTxt + '}';
		//console.log(JSONText);
		
		res.send(JSONLinksTxt);
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

/* POST /upload Handle uploading images for an actor */
router.post('/upload', upload.single( 'file' ), function(req, res, next) {
	console.log('Upload an image');
	console.log('Actor ID: ' + req.body.actor_id);
	if ( !req.file.mimetype.startsWith( 'image/' ) ) {
	    return res.status( 422 ).json( {
	      error : 'The uploaded file must be an image'
	    } );
	}

	var dimensions = sizeOf( req.file.path );

	if ( ( dimensions.width < 640 ) || ( dimensions.height < 480 ) ) {
	    return res.status( 422 ).json( {
	      error : 'The image must be at least 640 x 480px'
	    } );
	}

	console.log('Image Details: ' + JSON.stringify(req.file) );
	return res.status( 200 ).send( req.file );
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
				if(req.body.relTarget.slice(-1).pop() != '') {
					// Then write 
					// Write in the relTarget & actorTarget values
					Actor['relTarget'] = req.body.relTarget;
					Actor['actorTarget'] = req.body.actorTarget;
				} else {
					lastTarget = req.body.relTarget.pop();
					lastActor = req.body.actorTarget.pop();
					Actor['relTarget'] = req.body.relTarget;
					Actor['actorTarget'] = req.body.actorTarget;
				}
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

/* GET /actors/remove/id?key=value */
router.get('/remove/:id/:key', function(req, res, next) {
	console.log('Remove Parameter from Actor: ' + req.params.id);
	console.log(req.params);
	console.log(req.body);
	var key1 = req.params.key
	var key = {};
	key[key1] = 1
	// Set our internal DB variable
    var db = req.db;
    // Set our collection
    var collection = db.get('actors');
    console.log("Key: " + key);
    collection.update({"_id": req.params.id}, { $unset: key }, {w:1}, function (err, result){
    	if(err){
    		console.log(err);
    	} else {
    		console.log("Result: " + result);
    		res.redirect('/actors/' + req.params.id);
    	}
    });	
	
});





module.exports = router;