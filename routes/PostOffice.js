var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient,
	assert = require('assert');
var mongodb = require('mongodb');
var crypto = require('crypto');
var settings=require('./settings');

// Connection URL
//var url = 'mongodb://localhost:27017/test';
var url=settings.dbURL;
/* GET all users*/
router.get('/all', function(req, res, next) {

	MongoClient.connect(url, function(err, db) {
		var collection = db.collection('postoffices');
			collection.aggregate([							
				{
				  $lookup:{	from:"evnt",
							localField:"postalCode",
							foreignField:"postalCode", 
							as:"evnts"}
				}
				]).toArray().then(function(r){

				db.close();							
				res.setHeader('Last-Modified', (new Date()).toUTCString());
				return res.json(r);

			});
	});
});

router.get('/search', function(req, res, next) {

	MongoClient.connect(url, function(err, db) {
		var collection = db.collection('postoffices');
			collection.aggregate([							
				{
				  $lookup:{	from:"evnt",
							localField:"postalCode",
							foreignField:"postalCode", 
							as:"evnts"}
				},				
				{
					$match:{
						"evnts.title":"123"
					}
				}
				]).toArray().then(function(r){

				db.close();							
				res.setHeader('Last-Modified', (new Date()).toUTCString());
				return res.json(r);

			});
	});
});

router.post('/modify', function (req, res, next) {
    
    MongoClient.connect(url, function (err, db) {
        assert.equal(null, err);
        console.log('Connected successfully to server');
        db.collection('postoffices').updateOne({
            _id: new mongodb.ObjectID(req.params.id)
					// title:'111111'
        }, {
            $set: {
                title: req.body.title,
                start: req.body.start,
                end: req.body.end,
                postalCode: req.body.postalCode,
                status: req.body.status,
                description: req.body.description,
                executor: req.body.executor
            }
        },
			function (err, r) {
    assert.equal(null, err);
    assert.equal(1, r.matchedCount);
    assert.equal(1, r.modifiedCount);

    db.close();

    res.json({
        'update': 'ok'
    });
});
    });

});


module.exports = router;