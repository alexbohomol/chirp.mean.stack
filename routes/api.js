var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Post = mongoose.model('Post');

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

    // create a new post
    .post(function (req, res) {

        var post = new Post();
        post.text = req.body.text;
        post.created_by = req.body.created_by;

        post.save(function (err, post) {
            
            if (err) return res.status(500).send(err);

            return res.json(post);
        });
    })

    // get all posts
    .get(function (req, res) {

        Post.find(function (err, posts) {
            
            if (err) return res.status(500).send(err);

            return res.json(posts);
        });
    });

// api for the particular post
router.route('/posts/:id')

    // update the existing post
    .put(function (req, res) {

        Post.findById(req.params.id, function (err, post) {
            
            if (err) res.status(500).send(err);

            post.created_by = req.body.created_by;
            post.text = req.body.text;

            post.save(function (err, post) {
                
                if (err) res.status(500).send(err);

                return res.json(post);
            });
        });
    })

    // get the particular post
    .get(function (req, res) {

        Post.findById(req.params.id, function (err, post) {
            
            if (err) res.status(500).send(err);

            return res.json(post);
        });
    })

    // delete the particular post
    .delete(function (req, res) {

        Post.remove({ _id: req.params.id }, function (err) {
            
            if (err) res.status(500).send(err);

            return res.json("deleted!");
        });
    });

module.exports = router;
