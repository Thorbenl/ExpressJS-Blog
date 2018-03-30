const express             = require('express');
      router              = express.Router();
      Blog                = require('../models/blog');
      Comment             = require('../models/comment');
      middleware          = require("../middleware");

const multer = require('multer');
const storage = multer.diskStorage({
        filename: function(req, file, callback) {
            callback(null, Date.now() + file.originalname);
    }
});

const imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
const upload = multer({ storage: storage, fileFilter: imageFilter})

const cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: 'dghfdgity',
    api_key: 245974188333435,
    api_secret: "UJwM9Nc5f97cEbB9kpgIeSK9PuA"
});

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
router.post("/",middleware.isLoggedIn, upload.single('image'), function(req, res) {
    cloudinary.v2.uploader.upload(req.file.path, function (err, result) {
    const newBlogPostName = req.body.name;
    const newBlogPostImage = result.secure_url;
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
    Blog.create(newBlogPost, function(err, newlyCreated){
        if(err){
            req.flash('error', err.message);
        } else {
            res.redirect("/blog");
        }
    });
    });
});

//NEW - Show form to create new blogpost and add that blogpost to db
router.get('/new', middleware.isLoggedIn, function (req,res) {
    res.render("Blog/new");
});

//Show - shows more info about a blogpost based on its ID
router.get('/:id', function (req,res) {
    Blog.findById(req.params.id).populate("comments").exec(function(err, foundBlogpost) {
        if(err || !foundBlogpost){
            req.flash("error", "Blogpost not found, something went wrong!");
            res.redirect("back")
        } else {
            res.render("Blog/show", {blogposts: foundBlogpost});
        }
    });
});


// EDIT POST ROUTE
router.get("/:id/edit", middleware.checkBlogpostOwnership, function(req, res){
        Blog.findById(req.params.id, function(err, foundPost){
            if(err) {
                res.redirect("/blog");
            } else {
                res.render("Blog/edit", {foundPost: foundPost});
            }
        });
});

// UPDATE POST ROUTE
router.put("/:id",middleware.checkBlogpostOwnership, function(req, res){
    // find and update the correct post
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedPost){
        if(err){
            res.redirect("/blog");
        } else {
            //redirect somewhere(show page)
            res.redirect("/blog/" + req.params.id);
        }
    });
});


// Delete - let a user delete a blogpost
router.delete("/:id",middleware.checkBlogpostOwnership, function(req, res){
    Blog.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/blog");
        } else {
            req.flash("success", "You just deleted the blogpost!");
            res.redirect("/blog");
        }
    });
});


module.exports = router;