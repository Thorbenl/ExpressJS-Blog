const express             = require('express');
      router              = express.Router({mergeParams: true});
      Blog                = require('../models/blog');
      Comment             = require('../models/comment');
      middleware          = require("../middleware");


// ====================
// COMMENTS ROUTES
// ====================

// Get the form to create a new comment
router.get("/new", middleware.isLoggedIn, function(req, res){
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
router.post("/", middleware.isLoggedIn, function(req, res){
    //lookup campground using ID
    Blog.findById(req.params.id, function(err, blog){
        if(err){
            req.flash("error", "Oops! Something went wrong!");
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

// COMMENT EDIT ROUTE
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    Blog.findById(req.params.id, function(err, foundPost) {
        if(err || !foundPost) {
            req.flash("error", "Cannot find the Blogpost");
            return res.redirect("back");
        }
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err || !foundComment){
                req.flash("error", "Comment not found, something went wrong!");
                res.redirect("back");
            } else {
                res.render("Comments/edit", {blogpost_id: req.params.id, comment: foundComment});
            }
        });
    });
});

// COMMENT UPDATE
router.put("/:comment_id",middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err){
            res.redirect("back");
        } else {
            req.flash("success", "Comment edited!");
            res.redirect("/blog/" + req.params.id );
        }
    });
});

// COMMENT DESTROY ROUTE
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    //findByIdAndRemove
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            res.redirect("back");
        } else {
            req.flash("success", "Comment deleted!");
            res.redirect("/blog/" + req.params.id);
        }
    });
});


module.exports = router;