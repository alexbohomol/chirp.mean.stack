var express = require('express');
var router = express.Router();

// require authentication for non-GET methods
router.use(function (req, res, next) {

    if (req.method === "GET")
        return next();

    if (req.isAuthenticated())
        return next();

    return res.redirect('/#login');
});

// api to posts collection itself
router.route('/posts')

    // send a new post to add to the collection
    .post(function (req, res) {

        //TODO create a new post in the database
        res.send({message:"TODO create a new post in the database"});
    })

    // get the whole posts collection
    .get(function (req, res) {

        //TODO get all the posts in the database
        res.send({message:"TODO get all the posts in the database"});
    });

// api for the particular post
router.route('/posts/:id')

    // update the existing post
    .put(function (req, res) {

        res.send({message:'TODO modify an existing post by using param ' + req.params.id});
    })

    // get the particular post
    .get(function (req, res) {

        res.send({message:'TODO get an existing post by using param ' + req.params.id});
    })

    // delete the particular post
    .delete(function (req, res) {

        res.send({message:'TODO delete an existing post by using param ' + req.params.id});
    });

module.exports = router;
