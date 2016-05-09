var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
var actors = require('./routes/actors');

var database = require('./database');

var mongodb = require('mongodb');
var monk = require('monk');
var db = monk('mongodb://localhost:27017/myproject');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

var allowCrossDomain = function(req,res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
};
app.use(allowCrossDomain);

// MongoDB 
//var MongoClient = require('mongodb').MongoClient
//, assert = require('assert');

// Connection to database
// Connection URL
//var url = 'mongodb://localhost:27017/myproject';
// Use connect method to connect to the Server
//MongoClient.connect(url, function(err, db) {
//  assert.equal(null, err);
//  console.log("Connected correctly to server");

  // Add in documents to the Database
  //  database.insertDocuments(db, function() {
  //   database.updateDocument(db, function() {
  //      database.deleteDocument(db, function() {
  //        database.findDocuments(db, function() {
  //          db.close();
  //        });
  //      });
  //    });
  //  });

  //db.close();
//});


// Database Testing Ends
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
  req.db = db;
  next();
});

app.use('/', routes);
app.use('/users', users);
app.use('/actors', actors);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;

