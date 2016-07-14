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

//Converter Class 
var Converter = require("csvtojson").Converter;


/* GET */
router.get('/testdata', function(req, res, next) {
	
    // Set our internal DB variable
    var db = req.db;
	
    // Set our collection
    var workshopcollection = db.get('workshops');
	
	var converter = new Converter({});
	
	converter.fromFile("./legodata.csv",function(err,result){
		if(err) {
			console.log('Error: ' + err);
			next();
		} else {
			//var object = JSON.parse(result)
			var workshopJSON = {'name' : 'testWorkshop', 'nodes' : result, 'links' : []};
			
			//console.dir(workshopJSON, {depth: null, colors: true})
			
			result.forEach(function(actor){
				
				// Create a record / document for each actor
				// Add all the actors to the Workshop document (nodes)
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
				
				//console.log('ACTOR: ' + JSON.stringify(actor));
				//console.log('*********************************');
			});
			console.dir(workshopJSON, {depth: null, colors: true});
			
		    workshopcollection.insert(workshopJSON, function (err, doc) {
		        if (err) {
		            // If it failed, return error
		            res.send("There was a problem adding the information to the database.");
		        }
		        else {
		            // And forward to success page
		            res.redirect("/workshops");
		        }
		    });
		}
	});	
});

module.exports = router;