const express             = require('express');
      router              = express.Router();
      Blog                = require('../models/blog');
      Comment             = require('../models/comment');

// ====================
// BLOG ROUTES
// ====================

//INDEX - show all blogs
router.get("/", function(req, res){
    // Get all blog entries from DB
    Blog.find({}, function(err, allBlogposts){
        if(err){
            console.log(err);
        } else {
            res.render("Blog/index",{blogposts: allBlogposts});
        }
    });
});

//CREATE - add new blogpost to db
router.post("/",isLoggedIn, function(req, res){
    const newBlogPostName = req.body.name;
    const newBlogPostImage = req.body.image;
    const newBlogPostDescription = req.body.description;
    const author = {
        id: req.user._id,
        username: req.user.username
    };
    const newBlogPost = {
        name: newBlogPostName,
        image: newBlogPostImage,
        description: newBlogPostDescription,
        author: author
    };
    console.log(req.user);

    Blog.create(newBlogPost, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            console.log(newlyCreated);
            res.redirect("/blog");
        }

    });
});


//NEW - Show form to create new blogpost and add that blogpost to db
router.get('/new', isLoggedIn, function (req,res) {
    res.render("Blog/new");
});

//Show - shows more info about a blogpost based on its ID
router.get('/:id', function (req,res) {
    Blog.findById(req.params.id).populate("comments").exec(function(err, foundBlogpost) {
        if(err){
            console.log(err);
        } else {
            res.render("Blog/show", {blogposts: foundBlogpost});
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