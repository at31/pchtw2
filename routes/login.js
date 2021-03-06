var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');
var mongodb = require('mongodb');
var crypto = require('crypto');
var settings=require('./settings');
var jwt = require('jsonwebtoken');

// Connection URL
//var url = 'mongodb://localhost:27017/test';
var url=settings.dbURL;

router.get('/login', function(req,res){
    res.render('login',{status:"Доброго времени суток )"});
});

//login
router.post('/', function (req, res, next) {

    
    
    MongoClient.connect(url, function (err, db) {
        var collection = db.collection('users');
        collection.findOne({login: req.body.login}).then(function (user) {
            if(user) {
                console.log('login na!', user);    
            //передача пароля открытым способом не хорошая идея, надо на клиенте делать хэш... временно оставил
                if(user.pass===hash(req.body.pass)) {
                    //req.session.user = {id: user._id, name: user.name, role:user.role};
                    var payload = {id: user._id};
                    var token = jwt.sign(payload, 'tasmanianDevil', {expiresIn:6000});                    
                    res.json({
                            'status':'login',
                        message: 'авторизация - успешно',
                        token: token
                    });
                }else {
                    res.status(401).json({
                            'status':'err',
                        message: 'Не верный пароль',
                    });
                }
            }else {
                res.status(401).json({
                        'status':'err',
                    message: "Пользователь не существует"
                });
                console.log('нет такого...');
            }

            db.close();
        }, function (err) {
            console.log('db error');
            console.log(err);
            res.status(401).json({
                        'status':'err',
                message: "db error"
            });
            db.close(); 
        });
    });
    
   /* MongoClient.connect(url, function(err, db) {
        var collection = db.collection('evnt');
        collection.findOne({ _id: new mongodb.ObjectID("58703da2c064e912532c0aa2")}).then(function(doc) {
            console.log(doc);
            db.close(); 
        });
    });*/


});


router.get('/in', function (req, res, next) {
    if(req.session.user) {
        console.log(req.session.user);
        if(req.session.user.role==='admin') {
            console.log('/phase1 redirect');
            res.redirect('/phase1');    
        }else if(req.session.user.role==='user') {
            console.log('phase2 redirect');
            res.redirect('./phase2');
        }
        
    }else {
        res.redirect('/');
    }    
});
//log out
router.post('/out', function (req, res, next) {
    
});

function hash(text) {
    return crypto.createHash('sha1')
        .update(text).digest('base64')
}

module.exports = router;
