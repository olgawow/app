
"use strict";
var express = require('express');
var app = new express();
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var router = express.Router();
//ROUTER
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var dbUrl = 'mongodb://localhost:27017/test_messages';
var dbPort = '27017';
//var dbUrl = 'mongodb://user:123@ds042138.mongolab.com:42138/test_messages';
//var dbPort = '42138';
var db;

app.use(bodyParser.json());
app.use(logger('dev'));

router.route('/patient')
    .get(function (req, res) {
        db.collection('patient').find({}).toArray(function (err, records) {
            if (err) { res.send(err); }
            res.json(records);
        });
    })

    .post(function (req, res) {
        db.collection('patient').insert({
            username: req.body.username,
            password: req.body.password,
            firstname: req.body.firstname,
            lastname: req.body.lastname
        }, {w: 1}, function (err) {
            if (err) { res.send(err); }
            res.send({message: 'Record Added'});
        });
    });
router.route('/patient/:username')
    .get(function (req, res) {
        db.collection('patient').findOne({username: new ObjectId(req.params.username)}, function (err, record) {
            if (err) { res.send(err); }
            res.json(record);
        });
    })
    .put(function (req, res) {
        db.collection('patient').update({_id: new ObjectId(req.params.id)}, {$set: {
            uniqueid : req.body.uniqueid
        }}, {w: 1}, function (err, record) {
            if (err) { res.send(err); }
            res.json(record);
        });
    });

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/demo.html'));
});
app.use('/api', router);
app.use(express.static(path.join(__dirname, 'app')));
app.use('/app', express.static(__dirname + '/app'));


// ERROR Handler 400
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// ERROR Handler 505
if (app.get('env') === 'development') {
    app.use(function (req, res, next) {
        var err = new Error('Not Found');
        err.status = 505;
        next(err);
    });
}

app.use(function (err, req, res) {
    res.status(err.status || 500);
    res.send(err.status + ': Internal Server Error\n\r' + err.message);
});

// Initialize connection once
MongoClient.connect(dbUrl, function (err, database) {
    if (err) { throw err; }
    db = database;
    //SERVER
    app.set('port', process.env.PORT || 8000);
    var server = app.listen(app.get('port'), function () {
        console.log('Express server listening on port ' + server.address().port);
        console.log('MongoDB is running on port ' + dbPort);
    });
});