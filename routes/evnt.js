var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var mongodb = require('mongodb');
var settings=require('./settings');
var moment =require('moment');
var passport = require("passport");
// Connection URL
// var url = 'mongodb://localhost:27017/test';
var url=settings.dbURL;

router.get('/form',  function(req,res){
    res.render('evntform',{status:""});
});

/* GET  listing. */
router.get('/', function (req, res, next) {

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
        var collection = db.collection('evnt');
		// Find some documents
        collection.find({}).toArray(function (err, docs) {
            assert.equal(err, null);
            callback(docs);
        });
    };
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
        var collection = db.collection('evnt');
		// Find some documents
        collection.find({postalCode: req.params.indx}).toArray(function (err, docs) {
            assert.equal(err, null);
            callback(docs);
        });
    };
});


/* GET  map-reduce*/
router.get('/mr', function (req, res, next) {


    console.log(req.params.indx);

	// Use connect method to connect to the server
    MongoClient.connect(url, function (err, db) {
        assert.equal(null, err);
        console.log('Connected successfully to server');

        findDocuments(db, function (docs) {
            db.close();

            res.json(docs);
        });

		/* var collection = db.collection('evnt');
		collection.aggregate([{"$match":{"status":{$ne:"0"}}},{"$group":{_id:"$postalCode",count:{"$sum":1}}}],function(err,result){
			console.log(result);
		});*/
    });


    var findDocuments = function (db,callback) {
		// Get the documents collection
        var collection = db.collection('evnt');
		// Find some documents
        collection.aggregate([{'$match': {'status': {$ne: '0'}}},{'$group': {_id: '$postalCode',count: {'$sum': 1}}}]).toArray(function (err, docs) {
            assert.equal(err, null);
            callback(docs);
        });
    };
});


router.post('/save', passport.authenticate('jwt', { session: false }), function (req, res, next) {
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
        // console.log(req.body);
        var evnt=req.body;
        evnt.start = moment(evnt.start).toDate();
        evnt.end = moment(evnt.end).toDate();


        db.collection('evnt').insertOne(evnt, function (err, r) {
            assert.equal(null, err);
            assert.equal(1, r.insertedCount);
            res.json({
                'insertedid': r.insertedId
            });
        });
    };
});

router.post('/save/multi', function (req, res, next) {
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
            console.log(evnt.start);
            evnt.end = moment(req.body.end).toDate();
        });
		// req.body.start = new Date(req.body.start);
		// req.body.end = new Date(req.body.end);


        db.collection('evnt').insert(req.body, function (err, r) {
            assert.equal(null, err);
		//	assert.equal(1, r.insertedCount);
            res.json({
                'insertedcount': r.insertedCount
            });
        });
    };
});


router.post('/update/:id', function (req, res, next) {

    req.body.start = new Date(req.body.start);
    req.body.end = new Date(req.body.end);
    console.log(req.body);
    console.log(req.params.id);

    MongoClient.connect(url, function (err, db) {
        assert.equal(null, err);
        console.log('Connected successfully to server');
        db.collection('test').updateOne({
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


router.delete('/del/:id', function (req, res, next) {
    console.log(req.params.id);
    MongoClient.connect(url, function (err, db) {
        assert.equal(null, err);
        console.log('Connected correctly to server');

        db.collection('test').deleteOne({
            _id: new mongodb.ObjectID(req.params.id)
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

function eventDeleteOne(res,db,evntID){
    db.collection('evnt').deleteOne({_id: new mongodb.ObjectID(evntID)}).then((result,err)=>{
        if(err){
            console.log(err);
        }else{
            db.close();
            res.json({"delete":"ok"});
        }
    });
}

// total del from list an avent collections, rebuild lists (l2 collection)
router.post('/tdel', function (req, res, next) {
    let listarr= [];

    MongoClient.connect(url, function (err, db) {
        assert.equal(null, err);
        console.log('Connected correctly to server');
        let coll=db.collection('l2');
        coll.find({'evnts.evnt': new mongodb.ObjectID(req.body.id)})
		.toArray()
		.then(function (docs, err) {
    if (err) {
        console.log(err);
    }
    if (docs.length>0) {        
        docs.forEach(list=>{
            let newlist=Object.assign({},list);
            newlist.evnts=list.evnts.filter(evnt=>{
                if(evnt.evnt!=req.body.id) {
                    return evnt;
                }
            });
            newlist.path=[... new Set(newlist.evnts.map(evnt=>evnt.postalCode))];
            listarr.push(newlist);
            if(newlist.evnts.length>0) {
                coll.updateOne({_id: new mongodb.ObjectID(newlist._id)},
                {$set:{path:newlist.path,evnts:newlist.evnts}},{upsert:true})
            .then((r,err)=>{
                if(!err) {
                    eventDeleteOne(res,db,req.body.id);
                }

            });
            }else if(newlist.evnts.length==0) {
                console.log('newlist.evnts.length==0');
                coll.deleteOne({_id: new mongodb.ObjectID(newlist._id)}).then((r,err)=>{
                    if(!err) {
                        db.collection('evnt').deleteOne({_id: new mongodb.ObjectID(req.body.id)})
                    .then((r,err)=>{
                        if(!err) {
                            console.log('newlist.evnts.length==0  ==== delete');
                            db.close();
                            res.json({'delete': 'ok'});
                        }
                    });
                    }

                });
            }
        });
    }else {
        eventDeleteOne(res,db,req.body.id);
    }

});
		/* db.collection('evnt').deleteOne({_id:new mongodb.ObjectID(req._id)}).then((err,r)=>{
			assert.equal(null,err);
			assert.equla(1,r.deletedCount);
			});*/

    });

});


router.post('/lquery', function (req, res, next) {

    MongoClient.connect(url, function (err, db) {
        assert.equal(null, err);
        console.log('Connected successfully to server');

        findDocuments(db, function (docs) {
            db.close();

            res.json(docs);
        });
    });
    var findDocuments = function (db, callback) {
        var collection = db.collection('test');
        collection.find(req.body).toArray(function (err, docs) {
            assert.equal(err, null);
            callback(docs);
        });
    };
});

router.post('/emaillist', function (req, res, next) {

    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'atcrew3@gmail.com',
            pass: 'u3fd54k7ka5l8e7x2'
        }
    });
    var params = {
        from: 'atcrew3@gmail.com',
        to: 'atcrew3000@yandex.ru',
        subject: 'список заданий',
        text: req.body.txt
    };
    transporter.sendMail(params, function (err, res) {
        if (err) {
            console.error(err);
        }
    });

    return res.json({'status': 'ok'});
});

router.get('/cc', function (req,res) {
    res.clearCookie('testcook');
    res.send('Cookie deleted');
});

router.get('/sc', function (req,res) {
    res.cookie('testcook' , 'cookie_value_4_testcook').send('Cookie is set');
});


module.exports = router;
