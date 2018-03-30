const express       = require('express');
      router        = express.Router();
      passport      = require("passport");
      User          = require("../models/user");
      middleware    = require("../middleware");

router.get('/', function (req, res) {
    res.render("home");
});


//  ===========
// AUTH ROUTES
//  ===========

// show register form
router.get("/register", function(req, res){
    res.render("register");
});

//handle sign up logic
router.post("/register", function(req, res){
    const newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            return res.render("register", {"error": err.message});
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to the blog " + user.username);
            res.redirect("/blog");
        });
    });
});

// show login form
router.get("/login", function(req, res){
    res.render("login");
});


// handling login logic
router.post("/login", passport.authenticate("local",
    {
        successRedirect: "/blog",
        failureRedirect: "/login"
    }), function(req, res){
});


// Logout route
router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "You are now logged out!");
    res.redirect("/");
});


module.exports = router;