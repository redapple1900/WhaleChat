var express = require('express');
var router = express.Router();
var io = require('./io.js');


router.use(function timeLog(req, res, next) {
    console.log('Time: ', Date.now());
    next();
});

router.get('/', function (req, res, next) {
    res.redirect('back');
})

router.post('/', function (req, res, next) {
    if (req.body.username && req.body.room) {
        res.render('pages/about', { 'user' : req.body.username, 'room' : req.body.room });
    } else {
        res.redirect('back');
    }
})

module.exports = router;



