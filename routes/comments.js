const express       = require('express');
router              = express.Router({mergeParams: true});
Blog                = require('../models/blog');
Comment             = require('../models/comment');
// ====================
// COMMENTS ROUTES
// ====================

// Get the form to create a new comment
router.get("/new", isLoggedIn, function(req, res){
    // find campground by id
    Blog.findById(req.params.id, function(err, blog){
        if(err){
            console.log(err);
        } else {
            res.render("Comments/new", {blog: blog});
        }
    })
});

// Create a new comment on a specific blogpost
router.post("/", isLoggedIn, function(req, res){
    //lookup campground using ID
    Blog.findById(req.params.id, function(err, blog){
        if(err){
            console.log(err);
            res.redirect("/blog");
        } else {
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    console.log(err);
                } else {
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    blog.comments.push(comment);
                    blog.save();
                    res.redirect('/blog/' + blog._id);
                }
            });
        }
    });
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}


module.exports = router;