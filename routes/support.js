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
				            res.redirect("/projects/" + req.body.project_id);
						});
			            
			        }
			    });
			}
		});	
	} else {
		// No user details rediect to login
		res.redirect('/login');
	}
});

/* GET */
router.post('/testdata2', function(req, res, next) {
	if(req.user) {
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
				            res.redirect("/projects/" + req.body.project_id);
						});
			            
			        }
			    });
			}
		});	
	} else {
		// No user details rediect to login
		res.redirect('/login');
	}
});

module.exports = router;