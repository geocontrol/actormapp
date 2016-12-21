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

Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
		console.log(this);
		console.log(obj);
        if (this[i] === String(obj)) {
			console.log('match');
            return true;
        }
    }
	console.log('no match');
    return false;
}

/* GET /actors listing */
router.get('/', function(req, res, next) {
	if(req.user) {
		// Set our internal DB variable
	    var db = req.db;
	    // Set our collection
	    var collection = db.get('actors');

	    collection.find({}, function (err, docs){
			res.render('actorshome', {title: 'Actor Mapping - Actors', actors: docs, user: req.user});
		});	
	} else {
		// No user details rediect to login
		res.redirect('/login');
	}
	
});

router.post('/deleteActors', function(req, res, next) {
	if(req.user) {
		console.log('Delete Actors:');
		console.log(req.body);
	actors = req.body.row;
	workshop_id = req.body.workshop_id;
	
	console.log("Actors : " + actors);
	console.log("Workshop ID : " + workshop_id);
	
	// Set our internal DB variable
    var db = req.db;
    // Set our collection
    var actorcollection = db.get('actors');
	var workshopcollection = db.get('workshops');
	actors.forEach(function(actor){
		// Remove the actor from the workshop list
		console.log("Actor to delete : " + JSON.stringify(actor));
	    actorcollection.remove({ "_id": actor }, function (err, result){
	    	if(err){
	    		console.log(err);
	    	} else {
				console.log('Deleted Actor : ' + actor._id + ' Record');
	    	};
		});
	});
	
	newNodes={'nodes':[]};	
	newLinks={'links':[]};	
	workshopcollection.findOne(workshop_id, function (err, workshop) {
		if (err) return next(err);
	 	console.log('Workshop : ' + JSON.stringify(workshop));
			
		workshop.nodes.forEach(function(node){
			console.log("Check Node ID in workshop record : " + node._id);
			if(actors.contains(node._id)){
				console.log('A Match so dont re-add');
			} else {
				newNodes.nodes.push(node);
				console.log('Current State of newNodes : ' + JSON.stringify(newNodes));
			};
		});
		
		// Removed the nodes
		console.log('New Nodes: ' + JSON.stringify(newNodes));
		
		// Now need to edit the links
		workshop.links.forEach(function(link){
			console.log("Check Node ID in links record : " + link.source + " & " + link.target);
			if(actors.contains(link.source) || actors.contains(link.target)){
				console.log('A Match so dont re-add');
			} else {
				newLinks.links.push(link);
				console.log('Current State of newLinks : ' + JSON.stringify(newLinks));
			};	
		});
		
		// Removed the links
		console.log('New Links: ' + JSON.stringify(newLinks));
		
		workshopcollection.update({'_id': workshop_id},{$set: newNodes}, {w: 1}, function(err, result){
			if(err) console.log('Database error : ' + err);
			workshopcollection.update({'_id': workshop_id},{$set: newLinks}, {w: 1}, function(err, result){
				if(err) console.log('Database error : ' + err);
					console.log('Update Workshop record: ' + JSON.stringify(result));
					res.status(200);
				});
		});
	});
} else {
	// No user details rediect to login
	res.redirect('/login');
}
});

/* POST /actors/sheetupdate - Update an actor record from the Spreadsheet view */
router.post('/sheetupdate', function(req, res, next) {
	if(req.user) {
	console.log('Update the Actor : ' + req.body._id);
	console.log('Set Name: ' + req.body.name + ' to Value: ' + req.body.value + ' for Workshop ID: ' + req.body.workshop_id);
	var workshop_id = req.body.workshop_id;
	var actor_id = req.body._id;
	var editName = req.body.name;
	var editValue = req.body.value;
	var newSet = {};
	newSet[editName] = editValue;
	console.log(JSON.stringify(newSet));
	
    // Set our internal DB variable
    var db = req.db;

    // Set our collection
    var actorscollection = db.get('actors');
	var workshopcollection = db.get('workshops');


	actorscollection.findOne(actor_id, function (err, post) {
		if (err) return next(err);
		console.log('Returned Actor Details for ID: ' + actor_id + "/NActor: " + JSON.stringify(post));
		// Workshop ID
		var workshop_id = post.workshop_id;
		
		actorscollection.update({_id: actor_id},{$set: newSet}, {w: 1}, function(err, status){
			console.log('DOne the database connection for the update' + JSON.stringify(status) );
			if(err){
				console.log('Error: ' + JSON.Stringify(err));
			} else {
				// Update the entry in the workshop record
				workshopcollection.findOne(req.body.workshop_id, function (err, post) {
					if (err) console.log(JSON.stringify('Cant find workshop record: ' + err + ' : The Workshop ID is: ' + req.body.workshop_id));
					workshopcollection.update({_id: req.body.workshop_id, 'nodes._id': req.body._id}, {$set:{'nodes.$.[editName]': editValue}}, {w: 1}, function(err, status){
						if (err) console.log(JSON.stringify('Error updating workshop record: ' + JSON.Stringify(err)));
						console.log('DOne the database update to the workshop record ' + JSON.stringify(status) );
						console.log('Status ' + JSON.stringify(status));
						return res.status( 200 );
						//res.redirect('/workshops/' + req.body.actor_id);
					});
					
				});
			};
		});
	});
	} else {
		// No user details rediect to login
		res.redirect('/login');
	}
});

/* POST /actors/sheetupdate - Update an actor record from the Spreadsheet view */
router.post('/sheetadd', function(req, res, next) {
	if(req.user) {
		// Show what has been sent
		console.log('Add a row to the spreadsheet');
		console.log('Sent Row Data: ' + JSON.stringify(req.body));
		return res.status( 200 );
	} else {
		// No user details rediect to login
		res.redirect('/login');
	}
});


/* GET /actors/add */
router.get('/add', function(req, res, next) {
	if(req.user) {
		res.render('actors', {title: 'Actor Mapping - Add an Actor', user: req.user});
	} else {
		// No user details rediect to login
		res.redirect('/login');
	}
});

/* POST /actors/add */
router.post('/add', function(req, res, next) {
	if(req.user) {
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
	} else {
		// No user details rediect to login
		res.redirect('/login');
	}

});

/* POST /actors/add2 */
router.post('/add2', function(req, res, next) {
	if(req.user) {
		console.log('Add Actors:');
		console.log(req.body);

		// If the name is blank then ignore it
		if(req.body.name != "" && req.body.name != null) {
	    // Set our internal DB variable
	    var db = req.db;
	
	    // Set our collection
	    var collection = db.get('workshops');
		var actorscollection = db.get('actors');

		collection.findOne(req.body._id, function (err, post) {
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
					// Double check it isnt a blank name
					if(name != "") {
						console.log(name);
						var JSONname = {'Name': name, 'Scale': 1, 'Class': 'Actor'};
						console.log(JSON.stringify(JSONname));
				
						actorscollection.insert(JSONname, {w: 1}, function(err, doc){
							JSONname = {'Name': name, '_id': doc._id, 'Scale': 1, 'Class': 'Actor'};
						});
						JSONnodes.nodes.push(JSONname);
						console.log(JSON.stringify(JSONnodes));
					};
				});
			} else {
				var JSONname = {'Name': req.body.name, 'Scale': 1, 'Class': 'Actor'};
			
				actorscollection.insert(JSONname, {w: 1}, function(err, doc){
					if(err){
						console.log(err);
					} else {
						
					JSONname = {'Name': req.body.name, '_id': doc._id, 'Scale': 1, 'Class': 'Actor'};
				}
				});
				JSONnodes.nodes.push(JSONname);
				console.log(JSON.stringify(JSONnodes));
			};
		
			console.log('Adding An Actor: ' + JSON.stringify(JSONnodes));
			collection.update({_id: req.body._id},{$set: JSONnodes}, {w: 1}, function(err, count, status){
				console.log(status);
			});
		});
		
		// All the above if name isnt blank on the form
		};
		res.redirect('/workshops/' + req.body._id);
	} else {
		// No user details rediect to login
		res.redirect('/login');
	}
});


/* POST /actors/addrel2 */
router.post('/addrel2', function(req, res, next) {
	if(req.user) {
		console.log('Add Relationships:');
		console.log(req.body);

		if(req.body.source != null && req.body.target != null){
	    // Set our internal DB variable
	    var db = req.db;
	
	    // Set our collection
	    var collection = db.get('workshops');
	
		collection.findOne(req.body._id, function (err, post) {
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
					JSONrel = {'source': req.body.source[index], 'target': req.body.target[index], 'value': Number(req.body.value[index]), 'label': req.body.label[index]};
					console.log('Relationship: ' + JSON.stringify(JSONrel));
				
					JSONlinks.links.push(JSONrel);
					console.log('All Links: ' + JSON.stringify(JSONlinks));
				};
			} else {
				JSONrel = {'source': req.body.source, 'target': req.body.target, 'value': Number(req.body.value), 'label': req.body.label};
				JSONlinks.links.push(JSONrel);
				console.log('All Links: ' + JSON.stringify(JSONlinks));
			};
			
			collection.update({_id: req.body._id},{$set: JSONlinks}, {w: 1}, function(err, count, status){
				console.log(status);
			});
		});
	};
		res.redirect('/workshops/' + req.body._id);
	} else {
		// No user details rediect to login
		res.redirect('/login');
	}
});	
	
	
router.get('/map/mapdata/:id', function(req, res, next){
	if(req.user) {
		console.log('Get data for a d3 actor map');
		console.log('Workshop ID: ' + req.params.id);
	    // Set our internal DB variable
	    var db = req.db;
	
	    // Set our collection
	    var collection = db.get('workshops');
	
		collection.findOne(req.params.id, function (err, post) {
			console.log(JSON.stringify(post));
			res.send(JSON.stringify(post));
		});
	} else {
		// No user details rediect to login
		res.redirect('/login');
	}
});

/* GET /actors/map */
router.get('/map', function(req, res, next) {
	if(req.user) {
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
	} else {
		// No user details rediect to login
		res.redirect('/login');
	}		
});


router.get('/map2', function(req, res, next) {
	if(req.user) {
		res.render('actormap2');
	} else {
		// No user details rediect to login
		res.redirect('/login');
	}
});

router.get('/map/map3/:id', function(req, res, next) {
	if(req.user) {
		console.log('Get the details of Workshop ID:' + req.params.id);
		res.render('actormap', {workshop_id: req.params.id});
	} else {
		// No user details rediect to login
		res.redirect('/login');
	}
});

router.get('/map/map4/:id', function(req, res, next) {
	if(req.user) {
		console.log('Get the details of Workshop ID:' + req.params.id);
		res.render('actormap3', {workshop_id: req.params.id});
	} else {
		// No user details rediect to login
		res.redirect('/login');
	}
});

router.get('/map/map5/:id', function(req, res, next) {
	if(req.user) {
		console.log('Get the details of Workshop ID:' + req.params.id);
		
		res.render('actormap5', {workshop_id: req.params.id, title: 'Actor Network Map', user: req.user});
	} else {
		// No user details rediect to login
		res.redirect('/login');
	}
});

router.get('/map/map6/:id', function(req, res, next) {
	if(req.user) {
		console.log('Get the details of Workshop ID:' + req.params.id);
		res.render('actormap6', {workshop_id: req.params.id});
	} else {
		// No user details rediect to login
		res.redirect('/login');
	}
});

router.get('/map/map7/:id', function(req, res, next) {
	if(req.user) {
		console.log('Get the details of Workshop ID:' + req.params.id);
		res.render('actormap7', {workshop_id: req.params.id, title: 'Actor Network Map', user: req.user});
	} else {
		// No user details rediect to login
		res.redirect('/login');
	}
});

router.get('/map/map8/:id', function(req, res, next) {
	if(req.user) {
		console.log('Get the details of Workshop ID:' + req.params.id);
		res.render('actormap8', {workshop_id: req.params.id, title: 'Actor Network Map', user: req.user});
	} else {
		// No user details rediect to login
		res.redirect('/login');
	}
});

router.get('/map/map9/:id', function(req, res, next) {
	if(req.user) {
		console.log('Get the details of Workshop ID:' + req.params.id);
		res.render('actormap9', {workshop_id: req.params.id, title: 'Actor Network Map', user: req.user});
	} else {
		// No user details rediect to login
		res.redirect('/login');
	}
});

router.get('/map/map9embed/:id', function(req, res, next) {
	if(req.user) {
		console.log('Get the details of Workshop ID:' + req.params.id);
		res.render('actorNewEmbed', {workshop_id: req.params.id, title: 'Actor Network Map', user: req.user});
	} else {
		// No user details rediect to login
		res.redirect('/login');
	}
});

router.get('/map/map10/:id', function(req, res, next) {
	if(req.user) {
		console.log('Get the details of Workshop ID:' + req.params.id);
		res.render('actormap1o', {workshop_id: req.params.id, title: 'Actor Network Map', user: req.user});
	} else {
		// No user details rediect to login
		res.redirect('/login');
	}
});

router.get('/map/sankey/:id', function(req, res, next) {
	if(req.user) {
		console.log('Get the details of Workshop ID:' + req.params.id);
		res.render('sankeytest', {workshop_id: req.params.id});
	} else {
		// No user details rediect to login
		res.redirect('/login');
	}
});

router.get('/map/mapdata5/:id', function(req, res, next){
	if(req.user) {
		console.log('Get data for a d3 actor map');
		console.log('Workshop ID: ' + req.params.id);
	    // Set our internal DB variable
	    var db = req.db;
	
	    // Set our collection
	    var collection = db.get('workshops');
	
		collection.findOne(req.params.id, function (err, post) {
			if(post.nodes){
				
			} else {
				post['nodes']=[];
			};
			if(post.links){
				
			} else {
				post['links']=[];
			};
			console.log(JSON.stringify(post));
			res.send(JSON.stringify(post));
		});
	} else {
		// No user details rediect to login
		res.redirect('/login');
	}
});


/* GET /actors/map */
router.get('/map2data', function(req, res, next) {
	if(req.user) {
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
	} else {
		// No user details rediect to login
		res.redirect('/login');
	}
});

/* GET /actors/id */
router.get('/:id', function(req, res, next) {
	if(req.user) {
		console.log('Get the details of an Actor:' + req.params.id);
		console.log(req.body);

	    // Set our internal DB variable
	    var db = req.db;

	    // Set our collection
	    var collection = db.get('actors');

		collection.findOne(req.params.id, function (err, post) {
			if (err) return next(err);
			collection.find({}, function (err, actors){
				if (err) return next(err);
				var actorDropDown = "<select name='actorTarget[]'>";
				actors.forEach(function(actordetail) {
			 		actorDropDown = actorDropDown + "<option value='" + actordetail._id + "'>" + actordetail.name + "</option>"  
			 	});
			 	actorDropDown = actorDropDown + "</select>";
			 	console.log('THE Actor : ' + JSON.stringify(post));
				res.render('actordetails', {title: 'Actor Mapping - Actors', actor: post, actordropdown: actorDropDown, user: req.user});
			});
		});
	} else {
		// No user details rediect to login
		res.redirect('/login');
	}
});

/* POST /upload Handle uploading images for an actor */
router.post('/upload', upload.single( 'file' ), function(req, res, next) {
	if(req.user) {
		if(req.file) {
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
		// Add details to the actor record
	    // Set our internal DB variable
	    var db = req.db;
	
	    // Set our collection
		var actorscollection = db.get('actors');
		
		// Need to check if there are already images, so get the actor record
		actorscollection.findOne(req.body.actor_id, function (err, actor) {
			if (err) return next(err);
			if (actor.images) {
				actor.images.push(req.file);
				console.log(JSON.stringify(actor.images));
				actorscollection.update({_id: req.body.actor_id},{$set: {images: actor.images}}, {w: 1}, function(err, count, status){
					console.log(status);
					console.log('Image Details: ' + JSON.stringify(req.file) );
					return res.status( 200 ).send( req.file );
					//res.redirect('/workshops/' + req.body.actor_id);
				});
			} else {
				var JSONimages = {'images':[]};
				JSONimages.images.push(req.file);
				console.log(JSON.stringify(JSONimages));
				actorscollection.update({_id: req.body.actor_id},{$set: JSONimages}, {w: 1}, function(err, count, status){
					console.log(status);
					console.log('Image Details: ' + JSON.stringify(req.file) );
					return res.status( 200 ).send( req.file );
					//res.redirect('/workshops/' + req.body.actor_id);
				});
			}			
		});
	};
	} else {
		// No user details rediect to login
		res.redirect('/login');
	}
});

/* PUT /actors/id */
router.post('/:id', function(req, res, next) {
	if(req.user) {
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

		console.log(JSON.stringify(Actor));
	    // Set our internal DB variable
	    var db = req.db;

	    // Set our collection
	    var collection = db.get('actors');

	    collection.update({_id: req.params.id},Actor);

	    res.redirect('/actors/' + req.params.id);
	} else {
		// No user details rediect to login
		res.redirect('/login');
	}
});

/* GET /actors/delete/id */
//router.get('/delete/:id', function(req, res, next) {
//	if(req.user) {
//		console.log('Delete the Actor : ' + req.params.id);

//		var id = req.params.id;
//		console.log('ID: ' + id);
		// Set our internal DB variable
//	    var db = req.db;
	    // Set our collection
//	    var collection = db.get('actors');
		//var workshopcollection = db.get('workshops');

	    //console.log(collection);

		// Remove the actor from the workshop list
//	    collection.remove({ "_id": req.params.id }, function (err, result){
//	    	if(err){
//	    		console.log(err);
//	    	} else {
//	    		 res.redirect('/actors');
//	    	}
//		});
//	} else {
		// No user details rediect to login
//		res.redirect('/login');
//	}
//});

/* GET /actors/remove/id?key=value */
router.get('/remove/:id/:key', function(req, res, next) {
	if(req.user) {
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
	} else {
		// No user details rediect to login
		res.redirect('/login');
	}
});





module.exports = router;