var   Blog    = require("../models/blog"),
      Comment = require("../models/comment");

// all the middleware goes here
var middlewareObj = {};

middlewareObj.checkBlogpostOwnership = function(req, res, next) {
    if(req.isAuthenticated()){
        Blog.findById(req.params.id, function(err, foundPost){
            if(err || !foundPost){
                req.flash("error", "Blogpost not found, something went wrong!");
                res.redirect("back");
            }  else {
                // does user own the blogpost?
                if(foundPost.author.id.equals(req.user._id) || req.user.isAdmin) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that!");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that!");
        res.redirect("back");
    }
}


middlewareObj.checkCommentOwnership = function(req, res, next) {
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err){
                res.redirect("back");
            }  else {
                // does user own the comment?
                if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin) {
                    next();
                } else {
                    res.redirect("back");
                }
            }
        });
    } else {
        res.redirect("back");
    }
}

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to be logged in to do that!");
    res.redirect("/login");
}


module.exports = middlewareObj;