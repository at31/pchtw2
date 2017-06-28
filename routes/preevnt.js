var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var mongodb = require('mongodb');
var settings=require('./settings');
var moment =require('moment');
var passport = require('passport');
var mess = require('./message');
// Connection URL
// var url = 'mongodb://localhost:27017/test';
var url=settings.dbURL;

/* GET  listing. */
router.get('/', function (req, res, next) {

	// Use connect method to connect to the server
    MongoClient.connect(url, function (err, db) {
        assert.equal(null, err);
        console.log('Connected successfully to server');

        var collection = db.collection('preevnt');
        // Find some documents
        /*collection.find({}).toArray(function (err, docs) {
            assert.equal(err, null);
            callback(docs);
        });*/
        collection.aggregate([
            {
                $lookup:
                {
                    from:'postoffices',
                    localField:'postalCode',
                    foreignField:'postalCode',
                    as:'po'
                },

            },
            {
                $unwind:'$po'
            }
        ],function (err,result) {
            assert.equal(null,err);
            res.setHeader('Last-Modified', (new Date()).toUTCString());
            res.json(result);
            db.close();
        });
    });
});


/* GET  */
router.get('/evnt/:indx', function (req, res, next) {

    console.log(req.params.indx);

	// Use connect method to connect to the server
    MongoClient.connect(url, function (err, db) {
        assert.equal(null, err);
        console.log('Connected successfully to server');

        findDocuments(db, function (docs) {
            db.close();

            res.json(docs);
        });
    });


    var findDocuments = function (db, callback) {
		// Get the documents collection
        var collection = db.collection('preevnt');
		// Find some documents
        collection.find({postalCode: req.params.indx}).toArray(function (err, docs) {
            assert.equal(err, null);
            callback(docs);
        });
    };
});


router.post('/save', passport.authenticate('jwt', {session: false}), function (req, res, next) {
    console.log('Authorization ===> ',req.get('Authorization'));

	// Use connect method to connect to the server
    MongoClient.connect(url, function (err, db) {
        assert.equal(null, err);
        console.log('Connected successfully to server');

        insertDoc(db, function () {
            db.close();
        });
    });


    var insertDoc = function (db, callback) {
        var evnt=req.body;
        // evnt.start = moment(evnt.start).toDate();
        // evnt.end = moment(evnt.end).toDate();
        evnt.status=0;


        db.collection('preevnt').insertOne(evnt, function (err, r) {
            assert.equal(null, err);
            assert.equal(1, r.insertedCount);
            db.collection('preevnt').aggregate([
                {
                    $match:{
                        _id: new mongodb.ObjectID(r.insertedId)
                    }
                },
                {
                    $lookup:
                        {
                            from:'postoffices',
                            localField:'postalCode',
                            foreignField:'postalCode',
                            as:'po'
                        },

                },
                {
                    $unwind:'$po'
                }
            ], function (err,result) {
                assert.equal(null,err);
                mess.savePreEvnt(result);
                db.close();
                res.json({
                    'insertedid': r.insertedId
                });
            });
        });
    };
});
router.post('/search', function (req,res) {
    console.log(req.body.match);
    MongoClient.connect(url, function (err,db) {
        var collection = db.collection('preevnt');
        collection.aggregate([
            {
                $match:req.body.match//{postalCode:'308031'}
            },
            {
                $lookup:
                {
                    from:'postoffices',
                    localField:'postalCode',
                    foreignField:'postalCode',
                    as:'po'
                },

            },
            {
                $unwind:'$po'
            }
        ],function (err,result) {
            assert.equal(null,err);
            res.setHeader('Last-Modified', (new Date()).toUTCString());
            res.json(result);
            db.close();
        });
    });
});

router.post('/save/multi', passport.authenticate('jwt', {session: false}), function (req, res, next) {
    console.log(req.body);

	// Use connect method to connect to the server
    MongoClient.connect(url, function (err, db) {
        assert.equal(null, err);
        console.log('Connected successfully to server');

        insertDoc(db, function () {
            db.close();
        });
    });


    var insertDoc = function (db, callback) {

        req.body.forEach(function (evnt) {
            evnt.start = moment(req.body.start).toDate();
            evnt.end = moment(req.body.end).toDate();
            evnt.status=0;
        });
		// req.body.start = new Date(req.body.start);
		// req.body.end = new Date(req.body.end);


        db.collection('preevnt').insert(req.body, function (err, r) {
            assert.equal(null, err);
		//	assert.equal(1, r.insertedCount);
            res.json({
                'insertedcount': r.insertedCount
            });
        });
    };
});

router.post('/del', /* passport.authenticate('jwt', {session: false}), */ function (req, res, next) {
    MongoClient.connect(url, function (err, db) {
        assert.equal(null, err);

        db.collection('preevnt').deleteOne({
            _id: new mongodb.ObjectID(req.body.id)
        }, function (err, r) {
            assert.equal(null, err);
            assert.equal(1, r.deletedCount);
            db.close();
            res.json({
                'delete': 'ok'
            });
        });
    });
});

module.exports = router;
