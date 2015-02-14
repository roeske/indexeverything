var bcrypt = require('bcrypt');
var Page = require("../models/page");
var fs = require('fs');

var api = require("express").Router();
var MongoClient = require('mongodb').MongoClient;
var MongoID = require('mongodb').ObjectID;


var CONN_STRING = "mongodb://David:SauceAl22zeN@ds049537.mongolab.com:49537/pages";
//var CONN_STRING = "mongodb://localhost:27017/pages";
var SEARCH_LIMIT = 100;

api.locals = {};
api.locals.isAdmin = function isAdmin(sessionID) {
    return api.locals.admin === sessionID;
}

api.locals.start = function (runServer) {
    MongoClient.connect(CONN_STRING, function (err, db) {
        if (err) {
            console.log('error connecting to mongo Database. ' + err);
            runServer(err);
        } else {
            api.locals.db = db.collection("pages");
            api.locals.hash = '$2a$10$qPEF08PtpFsof9zVa.KT/O5Hs4pbc4YPqdQ20.yPpGBUEK/tpmajW';
            runServer();
        }
    });
};

api.get('/page/:id', function (req, res) {

    if (!api.locals.isAdmin(req.sessionID)) {
        res.status(401).send();
        return;
    }

    api.locals.db.findOne({_id: new MongoID(req.params.id)}, function (err, page) {
        if (page) {
            return res.send(page);
        } else if (err) {
            res.statusCode = 500;
            return res.send({error: 'Server error'});
        } else {
            console.log('Page with id ' + req.params.id + ' not found');
            return res.send({error: 'Page not found'});
        }
    });
});

api.post('/pages', function (req, res) {
    var page = new Page({
        url: req.body.url,
        title: req.body.title,
        text: req.body.text
    });
    api.locals.db.insert(page, function (err) {
        if (!err) {
            return res.send({status: 'OK'});
        } else {
            console.log('DB insert err: ' + err);
            if (err.name == 'ValidationError') {
                res.statusCode = 400;
                res.send({error: 'Validation error'});
            } else {
                res.statusCode = 500;
                res.send({error: 'Server error'});
            }
            console.log('Internal error: ' + res.statusCode + ' ' + err.message);
        }
    });
});

api.post('/search', function (req, res) {

    if (!api.locals.isAdmin(req.sessionID)) {
        res.status(401).send();
        return;
    }

    api.locals.db.ensureIndex({ "text": "text"  }, { name: "TextIndex" }, function (err, indexname) {
        if(err) console.log(err);
    });

    api.locals.db.find({$text: {$search: req.body.query}}).toArray(function (err, pages) {
        if (!err) {
            return res.send(pages);
        } else {
            res.statusCode = 500;
            console.log('Internal error: ' + res.statusCode + ' ' + err.message);
            return res.send({error: 'Server error'});
        }
    });
});

/*          authentication          */

api.get('/auth', function (req, res) {
    if (api.locals.isAdmin(req.sessionID))
        res.status(200).end();
    else
        res.status(401).end();
});

api.get('/unauth', function (req, res) {
    api.locals.admin = '';
    res.status(200).end();
});

api.get('/auth/:pass', function (req, res) {
    bcrypt.compare(req.params.pass, api.locals.hash, function (err, result) {
        if (err) {
            console.log('problem compare hash: ' + err);
            res.status(500);
            res.send('error');
        }
        else if (!result) {
            res.status(401);
            res.send('wrong password');
        } else {
            api.locals.admin = req.sessionID;
            res.send('ok');
        }
    });
});

/*
 bcrypt.genSalt(10, function (err, salt) {
 bcrypt.hash('SET_PASS_HERE', salt, function (err, hash) {
 if (err) {
 console.log('problem making hash: ' + err);
 } else {
 app.locals.hash = hash;
 }
 });
 });
 */

module.exports = api;