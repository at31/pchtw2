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
		        var collection = db.collection('users');
		        collection.find({}).toArray().then(function (usersarr) {
			        usersarr.forEach(user=>{
				        user.pass='';
			});
			        return res.json(usersarr);
			        db.close();
		});
	});
});


router.get('/id/:id', function (req, res, next) {
	        MongoClient.connect(url, function (err, db) {
		        var collection = db.collection('users');
		        collection.findOne({
			        _id: new mongodb.ObjectID(req.params.id)
		}).then(function (user) {
			        return res.json(user);

			        db.close();
		});

	});

});

router.post('/new', function (req, res, next) {
	        MongoClient.connect(url, function (err, db) {
		        var collection = db.collection('users');
		    /*
		    var _user = {
			    email: req.body.email,
			    pass: hash(req.body.pass),
			    role: req.body.role,
			    login: req.body.login,
			    fio: req.body.fio
		};
		*/
			req.body.pass=hash(req.body.pass);
	        let _user=Object.assign({},req.body);
	        delete _user._id;

		        collection.findOne({
			        email: _user.email,
			        fio: _user.fio
		}).then(function (user) {
			        if (user) {
				        res.json({
					    'status': 'err',
					    'text': 'Пользователь существует'
				});
			} else {
				        collection.insertOne(_user).then(function (user) {
					        console.log(user);
					        assert.equal(1, user.insertedCount);
					        res.json({
						    'status':'ok',
						    'text': 'Пользователь создан, авторизируйтесь'
					});
					        db.close();

				}, function (err) {
					        console.log('not find user');
					        console.log(err);
					        db.close();
					        res.json({
						    'status':'err',
						    'text': 'Ошибка создания пользователя (DB error)'
					});
				});
			}
		});

	});
});

router.post('/update', function (req, res, next) {

/*
	var _user = {
			email: req.body.email,
			pass: hash(req.body.pass),
			role: req.body.role,
			login: req.body.login,
			fio: req.body.fio,
		};
*/	        
	        MongoClient.connect(url, function (err, db) {
		        var collection = db.collection('users');
		        collection.findOne({_id: new mongodb.ObjectID(req.body._id)}).then((user)=>{
		        	let _user=Object.assign({},req.body);
		        	delete _user._id;
		        	if(_user.pass===''){
		        		_user.pass=user.pass;
		        	}else if(_user.pass!==''){
		        		_user.pass=hash(_user.pass);
		        	}
		        	return _user;	
		        }).then((_user)=>{
		        	console.log(_user);
		        	return collection.findOneAndReplace({_id: new mongodb.ObjectID(req.body._id)}, _user);		        	
		        }).then((user)=>{		        	
		        	db.close();
		        	return res.json(user);		        	
		        }).catch((error)=>{
		        	console.log('error user update', err);
		        	return res.json(error);
		        });	        
		        
	});
});

router.post('/del', function (req, res, next) {
	        MongoClient.connect(url, function (err, db) {
		        var collection = db.collection('users');
		        console.log(req.body);
		        collection.findOneAndDelete({_id: new mongodb.ObjectID(req.body._id)}).then(function (r) {
			        assert.equal(1, r.lastErrorObject.n);
    assert.equal(req.body._id, r.value._id);
			        return res.json({
						    'status':'ok',
						    'text': 'Пользователь удален'
					});

			        db.close();
		});
	});
});

function hash(text) {
	        console.log(text);
    return crypto.createHash('sha1')
        .update(text).digest('base64');
}

router.get('/utest',function (req,res,next) {
	        req.session.user={user:'atcrew'};
	        res.send(200);
});

module.exports = router;
