var express = require('express');
var router = express.Router();

// GET the app home
router.get('/', function(req, res, next) {
    res.render('index', { title: "Chirp!"});
});

module.exports = router;
