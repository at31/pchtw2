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
router.get('/all', function (req, res, next) {

	    MongoClient.connect(url, function (err, db) {
		    var collection = db.collection('postoffices');
			    collection.aggregate([							
				    {
				          $lookup:{from:'evnt',
							localField:'postalCode',
							foreignField:'postalCode', 
							as:'evnts'}
				    }
				]).toArray().then(function (r) {

				    db.close();							
				    res.setHeader('Last-Modified', (new Date()).toUTCString());
				    return res.json(r);

			});
	});
});

router.get('/search', function (req, res, next) {

	    MongoClient.connect(url, function (err, db) {
		    var collection = db.collection('postoffices');
			    collection.aggregate([							
				    {
				          $lookup:{from:'evnt',
							localField:'postalCode',
							foreignField:'postalCode', 
							as:'evnts'}
				    },				
				    {
					        $match:{
						'evnts.title':"123"
					}
				    }
				]).toArray().then(function (r) {

				    db.close();							
				    res.setHeader('Last-Modified', (new Date()).toUTCString());
				    return res.json(r);

			});
	});
});
router.post('/new',function (req,res) {
	MongoClient.connect(url, function (err, db) {
    	assert.equal(null, err);
    	db.collection('postoffices').insertOne(req.body).then(function (po) {
					            assert.equal(1, po.insertedCount);
					            res.json({
					            	'insert': 'ok',
					            	'id': po.insertedId
					            });
		});
	});
});
router.post('/update', function (req, res, next) {    
    MongoClient.connect(url, function (err, db) {
        assert.equal(null, err);
        db.collection('postoffices').updateOne({
            _id: new mongodb.ObjectID(req.body.id)
        }, {
            $set: {
                label: req.body.postalCode,
                postalCode: req.body.postalCode,
                latitude: req.body.latitude,
                longitude: req.body.longitude,
                addressSource: req.body.addressSource,
                region: req.body.region,
                settlement: req.body.settlement,
                comps: req.body.comps
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

router.post('/del', function(req, res, next) {
	MongoClient.connect(url, function(err, db) {		
		var collection = db.collection('postoffices');
		collection.findOneAndDelete({_id: new mongodb.ObjectID(req.body._id)}).then(function(r) {
			test.equal(1, r.lastErrorObject.n);
        	test.equal(req.body._id, r.value._id);
			return res.json({
						"status":"ok",
						"text": "Почтовое отделение удалено"
					});

			db.close();	
		});
	});
});

module.exports = router;
