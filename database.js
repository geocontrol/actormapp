var MongoClient = require('mongodb').MongoClient
, assert = require('assert');

// Database Testing Begins
var insertDocuments = function(db, callback) {
  // Get the documents collection
  var collection = db.collection('documents');
  // Insert some documents
  collection.insertMany([
    {a : 1}, {a : 2}, {a : 3}
  ], function(err, result) {
    assert.equal(err, null);
    assert.equal(3, result.result.n);
    assert.equal(3, result.ops.length);
    console.log("Inserted 3 documents into the document collection");
    callback(result);
  });
}

var insertActor = function(db, actor, callback) {
	var collection = db.collection('actors');
	// Insert the actor
	collection.insert(actor);
}

var listActors = function(db, callback) {
	var collection = db.collection('actors');
	collection.find({}, function (err, docs){
		callback(docs);
	});	
}


var updateDocument = function(db, callback) {
  // Get the documents collection
  var collection = db.collection('documents');
  // Update document where a is 2, set b equal to 1
  collection.updateOne({ a : 2 }
    , { $set: { b : 1 } }, function(err, result) {
    assert.equal(err, null);
    assert.equal(1, result.result.n);
    console.log("Updated the document with the field a equal to 2");
    callback(result);
  });  
}

var deleteDocument = function(db, callback) {
  // Get the documents collection
  var collection = db.collection('documents');
  // Insert some documents
  collection.deleteOne({ a : 3 }, function(err, result) {
    assert.equal(err, null);
    assert.equal(1, result.result.n);
    console.log("Removed the document with the field a equal to 3");
    callback(result);
  });
}

var findDocuments = function(db, callback) {
  // Get the documents collection
  var collection = db.collection('documents');
  // Find some documents
  collection.find({}).toArray(function(err, docs) {
    assert.equal(err, null);
    assert.equal(2, docs.length);
    console.log("Found the following records");
    console.dir(docs);
    callback(docs);
  });
}

var getActors = function(db, nodes, callback) {
    
    var actorcollection = db.get('actors');
	
	var actorJSON = {'actors' : []};
	
	nodes.forEach(function(node) {
		//actorJSON.actors.push(node);
		// We now get the full actor details from the actor record page
		actorcollection.findOne(node._id, function (err, actor) {
			if (err) return next(err);
			actorJSON.actors.push(actor);
		});
	});
	console.log('FULL ACTOR JSON: ' + JSON.stringify(actorJSON));
	callback(actorJSON);
}


module.exports.insertDocuments = insertDocuments;
module.exports.updateDocument = updateDocument;
module.exports.deleteDocument = deleteDocument;
module.exports.findDocuments = findDocuments;
module.exports.insertActor = insertActor;
module.exports.getActors = getActors;