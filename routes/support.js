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


//Converter Class 
var Converter = require("csvtojson").Converter;


/* GET */
router.post('/testdata', function(req, res, next) {
	if(req.user) {
		if(req.body.name) {
	    // Set our internal DB variable
	    var db = req.db;
	
	    // Set our collection
		var projectscollection = db.get('projects');
	    var workshopcollection = db.get('workshops');
		var actorscollection = db.get('actors');
	
		var converter = new Converter({});
	
		converter.fromFile("./legodata.csv",function(err,result){
			if(err) {
				console.log('Error: ' + err);
				next();
			} else {
				//var object = JSON.parse(result)
				var workshopJSON = {'name' : req.body.name, 'user_id' : req.user._id, 'project_id' : req.body.project_id, 'nodes' : [], 'links' : []};
			
				//console.dir(workshopJSON, {depth: null, colors: true})
			
				result.forEach(function(actor){
				
					// Create a record / document for each actor
					// Add all the actors to the Workshop document (nodes)
					// Create a link where necessary
					// Create an Actor stub
					actorscollection.insert(actor, {w: 1}, function(err, doc){
						actor._id = doc._id;
					});
					console.log(JSON.stringify(actor));
					console.log('++++++++++++++++++++++++++++++++++++++++');
					workshopJSON.nodes.push(actor);
					//console.dir(workshopJSON, {depth: null, colors: true});
						
					// Create a link where necessary
					if(actor.Relationship != ''){
						// Need to create a link 'record'
						var link;
						link = actor.Relationship.split(",");
						console.log('SOURCE: ' + link[0]);
						console.log('TARGET: ' + link[1]);
						JSONrel = {'source': Number(link[0]), 'target': Number(link[1]), 'value': 1, 'label': 'link'};
						workshopJSON.links.push(JSONrel);
					}
				});
				console.log("THE COMPLETE JSON OBJECT FOR THE WORKSHOP: ");
				console.dir(workshopJSON, {depth: null, colors: true});
			
			    workshopcollection.insert(workshopJSON, function (err, doc) {
			        if (err) {
			            // If it failed, return error
			            res.send("There was a problem adding the information to the database.");
			        }
			        else {
						projectscollection.findOne(req.body.project_id, function (err, post) {
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
				            res.redirect("/projects/" + req.body.project_id);
						});
			            
			        }
			    });
			}
		});	
	} else {
		// No name for the project details so dont do anything
		res.redirect("/projects/" + req.body.project_id);
	};
	} else {
		// No user details rediect to login
		res.redirect('/login');
	}
});

/* GET */
router.post('/testdata2', function(req, res, next) {
	if(req.user) {
		
		if(req.body.name) {
	    // Set our internal DB variable
	    var db = req.db;
	
	    // Set our collection
		var projectscollection = db.get('projects');
	    var workshopcollection = db.get('workshops');
		var actorscollection = db.get('actors');
	
		var converter = new Converter({});
	
		converter.fromFile("./legodata2.csv",function(err,result){
			if(err) {
				console.log('Error: ' + err);
				next();
			} else {
				//var object = JSON.parse(result)
				var workshopJSON = {'name' : req.body.name, 'user_id' : req.user._id, 'project_id' : req.body.project_id, 'nodes' : [], 'links' : []};
			
				//console.dir(workshopJSON, {depth: null, colors: true})
			
				result.forEach(function(actor){
				
					if(actor.Name != ''){
						var exists = 0;
						//If the Actor ID actor.ID already in the workshop JSON object then dont need to add again.
						var  actorID = actor.ID;
						workshopJSON.nodes.forEach(function(node) {
							if (node.ID == actorID){
								exists = 1;								
							}
						});
						
						if(exists == 1){
							console.log('EXISTS!');
						} else {
							// Create a record / document for each actor
							// Add all the actors to the Workshop document (nodes)
							// Create a link where necessary
							// Create an Actor stub
							actor['project_id'] = req.body.project_id;
							actor['workshop_name'] = req.body.name;
							actor['user_id'] = req.user._id;
					
							actorscollection.insert(actor, {w: 1}, function(err, doc){
								actor._id = doc._id;
							});
							console.log(JSON.stringify(actor));
							console.log('++++++++++++++++++++++++++++++++++++++++');
							workshopJSON.nodes.push(actor);
							//console.dir(workshopJSON, {depth: null, colors: true});
						};
						
					
					// Create a link where necessary
					if(actor.Connection != ''){
						// Need to create a link 'record'
						var link;
						link = actor.Connection.split(",");
						console.log('SOURCE: ' + link[0]);
						console.log('TARGET: ' + link[1]);
						JSONrel = {'source': Number(link[0]), 'target': Number(link[1]), 'value': actor.Posneg, 'label': 'connection'};
						workshopJSON.links.push(JSONrel);
					}
				};
				});
				
				console.log("THE COMPLETE JSON OBJECT FOR THE WORKSHOP: ");
				console.dir(workshopJSON, {depth: null, colors: true});
			
			    workshopcollection.insert(workshopJSON, function (err, doc) {
			        if (err) {
			            // If it failed, return error
			            res.send("There was a problem adding the information to the database.");
			        }
			        else {
						projectscollection.findOne(req.body.project_id, function (err, post) {
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
				            res.redirect("/projects/" + req.body.project_id);
						});
			            
			        }
			    });
			}
		});	
	} else {
		// No name for the project details so dont do anything
		res.redirect("/projects/" + req.body.project_id);
	};
	} else {
		// No user details rediect to login
		res.redirect('/login');
	}
});

router.post('/prepop', function(req, res, next) {
	if(req.user) {
		
		if(req.body.name) {
	    // Set our internal DB variable
	    var db = req.db;
	
	    // Set our collection
		var projectscollection = db.get('projects');
	    var workshopcollection = db.get('workshops');
		var actorscollection = db.get('actors');
	
		var converter = new Converter({});
	
		converter.fromFile("./InterActor_dataset_small.csv",function(err,result){
			if(err) {
				console.log('Error: ' + err);
				next();
			} else {
				//var object = JSON.parse(result)
				var workshopJSON = {'name' : req.body.name, 'user_id' : req.user._id, 'project_id' : req.body.project_id, 'nodes' : [], 'links' : []};
			
				//console.dir(workshopJSON, {depth: null, colors: true})
			
				result.forEach(function(actor){
				
					if(actor.Name != ''){
						var exists = 0;
						//If the Actor ID actor.ID already in the workshop JSON object then dont need to add again.
						var  actorID = actor.ID;
						workshopJSON.nodes.forEach(function(node) {
							if (node.ID == actorID){
								exists = 1;								
							}
						});
						
						if(exists == 1){
							console.log('EXISTS!');
						} else {
							// Create a record / document for each actor
							// Add all the actors to the Workshop document (nodes)
							// Create a link where necessary
							// Create an Actor stub
							actor['project_id'] = req.body.project_id;
							actor['workshop_name'] = req.body.name;
							actor['user_id'] = req.user._id;
					
							actorscollection.insert(actor, {w: 1}, function(err, doc){
								actor._id = doc._id;
							});
							console.log(JSON.stringify(actor));
							console.log('++++++++++++++++++++++++++++++++++++++++');
							workshopJSON.nodes.push(actor);
							//console.dir(workshopJSON, {depth: null, colors: true});
						};
						
					
					// Create a link where necessary
					//if(actor.Connection != ''){
						// Need to create a link 'record'
					//	var link;
					//	link = actor.Connection.split(",");
					//	console.log('SOURCE: ' + link[0]);
					//	console.log('TARGET: ' + link[1]);
					//	JSONrel = {'source': Number(link[0]), 'target': Number(link[1]), 'value': actor.Posneg, 'label': 'connection'};
					//	workshopJSON.links.push(JSONrel);
					//}
				};
				});
				
				console.log("THE COMPLETE JSON OBJECT FOR THE WORKSHOP: ");
				console.dir(workshopJSON, {depth: null, colors: true});
			
			    workshopcollection.insert(workshopJSON, function (err, doc) {
			        if (err) {
			            // If it failed, return error
			            res.send("There was a problem adding the information to the database.");
			        }
			        else {
						projectscollection.findOne(req.body.project_id, function (err, post) {
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
				            //res.redirect("/projects/" + req.body.project_id);
							res.redirect("/support/prepoplinks/" + doc._id);
						});
			            
			        }
			    });
			}
		});	
	} else {
		// No name for the project details so dont do anything
		res.redirect("/projects/" + req.body.project_id);
	};
	} else {
		// No user details rediect to login
		res.redirect('/login');
	}
});

router.get('/prepoplinks/:id', function(req, res, next) {
	if(req.user) {

		workshopID = req.params.id;
		
		
	    // Set our internal DB variable
	    var db = req.db;
	
	    // Set our collection
	    var workshopcollection = db.get('workshops');
		var actorscollection = db.get('actors');
	
		var converter = new Converter({});
		
		var mappingJSON = {'map':[]};
	
		workshopcollection.findOne(workshopID, function(err, workshopJSON){
			
			converter.fromFile("./InterActor_dataset_small.csv",function(err,result){
				if(err) {
					console.log('Error: ' + err);
					next();
				} else {
					//var object = JSON.parse(result)
					var linksJSON = {'links' : []};
					console.log('Sent Workshop data : ' + JSON.stringify(workshopJSON));
					//console.dir(workshopJSON, {depth: null, colors: true})
				
					workshopJSON.nodes.forEach(function(node) {
						// Make the mappingJSON
						var mapping = {};
						mapping[node.ID] = node._id;
						mappingJSON.map.push(mapping);
						console.log('MappingJSON : ' + JSON.stringify(mappingJSON));
						console.log('Nodes.length : ' + workshopJSON.nodes.length);
						console.log('MappingJSON.length : ' + mappingJSON.map.length);
						if(workshopJSON.nodes.length == mappingJSON.map.length){
							console.log('MappingJSON Final : ' + JSON.stringify(mappingJSON));
						
							// Now do the links
							result.forEach(function(row){
				
								// Create a link where necessary
								if(row.Connection != ''){
									// Need to create a link 'record'
									var link;
									link = row.Connection.split(",");
									console.log('SOURCE: ' + link[0]);
									console.log('TARGET: ' + link[1]);
									var source = link[0];
									var target = link[1];
									JSONrel = {'source': mappingJSON.map[Number((link[0])-1)][source], 'target': mappingJSON.map[Number((link[1])-1)][target], 'value': row.Posneg, 'label': 'connection'};
									linksJSON.links.push(JSONrel);
								};
							});
							console.log('LINKS JSON : ' + JSON.stringify(linksJSON));
							
							// need to add this / update the workshop record with this data.
							workshopcollection.update({_id: workshopID},{$set: linksJSON}, {w: 1}, function(err, count, status){
								console.log(status);
								res.redirect('/workshops/' + workshopID);
							});
						};
					});
				};
			});
		});
	} else {
		// No user details rediect to login
		res.redirect('/login');
	}
});

router.post('/exportXML', function(req, res, next) {
	if(req.user) {

		var XMLOutput = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><system xmlns="https://www.trespass-project.eu/schemas/TREsPASS_model" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="https://www.trespass-project.eu/schemas/TREsPASS_model https://www.trespass-project.eu/schemas/TREsPASS_model.xsd" author="INTERActor" version="0.0.0" date="2016-06-14 10:17:42" id="id-BkZ-hlL8Gx-model">';
		// Get the Workshop data and then re-jig into XML format for ANM
	    // Set our internal DB variable
	    var db = req.db;

	    // Set our collection
	    var collection = db.get('workshops');

		collection.findOne(req.body._id, function (err, post) {
			if (err) return next(err);
		 	console.log('Workshop : ' + post);
			// Set the title
			XMLOutput = XMLOutput + "<title>" + post.name + "</title><actors>";
			// Need to loop though the actors and add them
			post.nodes.forEach(function(node){
				XMLOutput = XMLOutput + '<actor id="actor__' + node.Name + '" type="tkb:actor" name="' + node.Name + '" interactor_id="' + node._id + '"><atLocations></atLocations></actor>';
				
			});
			XMLOutput = XMLOutput + '</actors><edges></edges><locations></locations><assets></assets></system>';
			res.set('Content-Type', 'text/xml');
			res.send(new Buffer(XMLOutput));
			//res.download(XMLOutput, 'export.xml', function(err){
			//  if (err) {
			    // Handle error, but keep in mind the response may be partially-sent
			    // so check res.headersSent
			//	console.log('XML err : ' + err);
			//  } else {
			    // decrement a download credit, etc.
			//  }
			//});
			//res.render('workshopdetails', {title: 'Actor Mapping - Workshops', workshop: post, user: req.user });
		});	

	} else {
		// No user details rediect to login
		res.redirect('/login');
	}
});

module.exports = router;