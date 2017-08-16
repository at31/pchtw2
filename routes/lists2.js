var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient,
	    test = require('assert');
var mongodb = require('mongodb');
var crypto = require('crypto');
var settings=require('./settings');
var moment =require('moment');


var url=settings.dbURL;
/* GET all lists*/
router.get('/all', function (req, res, next) {
/* async function gData(){
	try{
		let db = await MongoClient.connect(url);
		let l2c = db.collection('l2');
		let lists = await l2c.find().toArray();
		let po = await db.collection('postoffices')
		.find({'postalCode':{$in: lists.path}}).toArray();		
		lists.path = lists.path.map(pCode=>{
			return po.find(po=>{
				if (pCode===po.postalCode)
					return po;
			});
		});
		db.close();
		return res.json(lists);
	}catch(err){
		console.log(err);
	}
}
gData();
*/

	    MongoClient.connect(url, function (err, db) {
		    var collection = db.collection('l2');
			    collection.aggregate([
{$lookup:{from:'users', localField:'executor', foreignField:'_id', as:"executor"}},
{$lookup:{from:'users', localField:'created', foreignField:'_id', as:"created"}},
{$unwind:'$path'},
{$lookup:{from:'postoffices', localField:'path', foreignField:'postalCode', as:"path"}},
{$unwind:'$path'},
{$group:{_id:'$_id', path: {$push:'$path'}, evnts:{$addToSet:'$evnts'},
title : {$max:'$title'},
description : {$max:'$description'},
executor: {$max: '$executor'},
createdDate : {$max: '$createdDate'},
created : {$max:'$created'},
endDate : {$max:'$endDate'},
endDesc : {$max:'$endDesc'},
status : {$max:'$status'}
}},
{$unwind:'$evnts'},
{$unwind:'$evnts'},
{$lookup:{from:'evnt', localField:'evnts', foreignField:'_id', as:"evnts"}},
{$unwind:'$evnts'},
{$group:{_id:'$_id', path: {$addToSet:'$path'}, evnts:{$push:'$evnts'},
title : {$max:'$title'},
description : {$max:'$description'},
executor: {$max: '$executor'},
createdDate : {$max: '$createdDate'},
created : {$max:'$created'},
endDate : {$max:'$endDate'},
endDesc : {$max:'$endDesc'},
status : {$max:'$status'}
}},
{$unwind:'$path'},
{$unwind:'$executor'},
{$unwind:'$created'},
    {
		 $project:
			{
				'_id':1,
				'title':1,
				'description':1,
                'created._id':1,
				'created.fio':1,
                'created.login':1,
                'created.role':1,
                'created.email':1,
				'createdDate':1,
				'executor.login':1,
				'executor.fio':1,
				'executor._id':1,
				'executor.role':1,
				'executor.email':1,
				'evnts':1,
				'path':1,
                'status':1,
                'endDate':1,
                'endDesc':1
			}
	}],function (err,result) {
					    test.equal(null,err);
					    res.setHeader('Last-Modified', (new Date()).toUTCString());
					    res.json(result);
					    db.close();
				});			
		});
});



router.post('/new', function (req, res, next) {
//new
	    
		req.body.evnts = req.body.evnts.map(evnt=>{
		    return new mongodb.ObjectID(evnt);
		});
	    req.body.createdDate=moment(req.body.createdDate).toDate();
	    req.body.executor=new mongodb.ObjectID(req.body.executor);
	    req.body.created=new mongodb.ObjectID(req.body.created);
	
	    MongoClient.connect(url, function (err, db) {
		    var collection = db.collection('l2');
		    console.log(req.body);
		    collection.insertOne(req.body).then(function (list) {
					    test.equal(1, list.insertedCount);
					    res.json({
						'status':'ok',
						'text': 'Список сохранен',
						'_id':list._id
					});
					    db.close();

				}, function (err) {
					    db.close();
					    res.json({
						'status':'err',
						'text': "Ошибка создания списка (DB error)"
					});
				});
	});
});

router.post('/update', function (req, res, next) {
	   // console.log(req.body);
	// throw new Error('Уупс!');
	    req.body.evnts = req.body.evnts.map(evnt=>{
		    return new mongodb.ObjectID(evnt);
		});
	    req.body.created = new mongodb.ObjectID(req.body.created);
	    req.body.executor = new mongodb.ObjectID(req.body.executor);
	    if(req.body.endDate){
	    	req.body.endDate = moment(req.body.endDate).toDate();
	    }	    
	    MongoClient.connect(url, function (err, db) {		
		    var collection = db.collection('l2');
		    collection.findOneAndUpdate({
			    _id: new mongodb.ObjectID(req.body._id)},
			{$set:{
				    title:req.body.title,
				    description:req.body.description,
				    executor:req.body.executor,
				    endDate: req.body.endDate,
				    endDesc: req.body.endDesc,
				    path:req.body.path,
				    evnts:req.body.evnts,
				    status: req.body.status
				//created and createdDate нельзя модифицировать!!!
			}
			}).then(function (evnt) {
			    return res.json(evnt);
				    db.close();		
		});
	});
});

router.post('/del', function (req, res, next) {
	    MongoClient.connect(url, function (err, db) {		
		    var collection = db.collection('l2');
		    collection.findOneAndDelete({_id: new mongodb.ObjectID(req.body._id)}).then(function (r) {
			    test.equal(1, r.lastErrorObject.n);
     test.equal(req.body._id, r.value._id);
			    return res.json({
						'status':'ok',
						'text': "Список удален"
					});

			    db.close();	
		});
	});
});

router.post('/search', function (req, res, next) {
	    MongoClient.connect(url, function (err, db) {
		    var collection = db.collection('l2');
			    collection.aggregate([
{$lookup:{from:'users', localField:'executor', foreignField:'_id', as:"executor"}},
{$lookup:{from:'users', localField:'created', foreignField:'_id', as:"created"}},
{$unwind:'$path'},
{$lookup:{from:'postoffices', localField:'path', foreignField:'postalCode', as:"path"}},
{$unwind:'$path'},
{$group:{_id:'$_id', path: {$push:'$path'}, evnts:{$addToSet:'$evnts'},
title : {$max:'$title'},
description : {$max:'$description'},
executor: {$max: '$executor'},
createdDate : {$max: '$createdDate'},
created : {$max:'$created'},
endDate : {$max:'$endDate'},
endDesc : {$max:'$endDesc'},
status : {$max:'$status'}
}},
{$unwind:'$evnts'},
{$unwind:'$evnts'},
{$lookup:{from:'evnt', localField:'evnts', foreignField:'_id', as:"evnts"}},
{$unwind:'$evnts'},
{$group:{_id:'$_id', path: {$addToSet:'$path'}, evnts:{$push:'$evnts'},
title : {$max:'$title'},
description : {$max:'$description'},
executor: {$max: '$executor'},
createdDate : {$max: '$createdDate'},
created : {$max:'$created'},
endDate : {$max:'$endDate'},
endDesc : {$max:'$endDesc'},
status : {$max:'$status'}
}},
{$unwind:'$path'},
{$unwind:'$executor'},
{$unwind:'$created'},
    {
		 $project:
			{
				'_id':1,
				'title':1,
				'description':1,
                'created._id':1,
				'created.fio':1,
                'created.login':1,
                'created.role':1,
                'created.email':1,
				'createdDate':1,
				'executor.login':1,
				'executor.fio':1,
				'executor._id':1,
				'executor.role':1,
				'executor.email':1,
				'evnts':1,
				'path':1,
                'status':1,
                'endDate':1,
                'endDesc':1
			}
	},
	{$match:req.body.search}
	],function (err,result) {
					    test.equal(null,err);
					    res.setHeader('Last-Modified', (new Date()).toUTCString());
					    res.json(result);
					    db.close();
				});			
		});
});


module.exports = router;
