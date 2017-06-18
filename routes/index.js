var express = require('express');
var router = express.Router();
var passport = require("passport");

/* GET home page. */
router.get('/', passport.authenticate('jwt', { session: false }), function(req, res, next) {
  //res.render('index', { title: 'Express' });
  // console.log(req.session.user);
  // res.render('login',{status:"Доброго времени суток )"});
  res.json({ok:200});
});



module.exports = router;
