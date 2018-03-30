const express       = require('express');
      router        = express.Router();
      passport      = require("passport");
      User          = require("../models/user");
      middleware    = require("../middleware");
      async         = require("async");
      Blog          = require("../models/blog");
      nodemailer    = require("nodemailer");
      crypto        = require("crypto");

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
       const newUser = new User({
            username: req.body.username,
            email: req.body.email
        });
   if(req.body.adminCode === 'secretbunny') {
       newUser.isAdmin = true;
   }
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            return res.render("register", {"error": err.message});
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to the blog, " + user.username);
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

// forgot password
router.get('/forgot', function(req, res) {
    res.render('forgot');
});

// Forgot password
router.post('/forgot', function(req, res, next) {
    async.waterfall([
        function(done) {
            crypto.randomBytes(20, function(err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function(token, done) {
            User.findOne({ email: req.body.email }, function(err, user) {
                if (!user) {
                    req.flash('error', 'No account with that email address exists.');
                    return res.redirect('/forgot');
                }

                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                user.save(function(err) {
                    done(err, token, user);
                });
            });
        },
        function(token, user, done) {
            var smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'iamtestingumbraco@gmail.com',
                    pass: "umbracoumbraco!"
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'learntocodeinfo@gmail.com',
                subject: 'Node.js Password Reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            smtpTransport.sendMail(mailOptions, function(err) {
                console.log('mail sent');
                req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                done(err, 'done');
            });
        }
    ], function(err) {
        if (err) return next(err);
        res.redirect('/forgot');
    });
});

router.get('/reset/:token', function(req, res) {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/forgot');
        }
        res.render('reset', {token: req.params.token});
    });
});

router.post('/reset/:token', function(req, res) {
    async.waterfall([
        function(done) {
            User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
                if (!user) {
                    req.flash('error', 'Password reset token is invalid or has expired.');
                    return res.redirect('back');
                }
                if(req.body.password === req.body.confirm) {
                    user.setPassword(req.body.password, function(err) {
                        user.resetPasswordToken = undefined;
                        user.resetPasswordExpires = undefined;

                        user.save(function(err) {
                            req.logIn(user, function(err) {
                                done(err, user);
                            });
                        });
                    })
                } else {
                    req.flash("error", "Passwords do not match.");
                    return res.redirect('back');
                }
            });
        },
        function(user, done) {
            var smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'iamtestingumbraco@gmail.com',
                    pass: "umbracoumbraco!"
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'mymandatory@mail.com',
                subject: 'Your password has been changed',
                text: 'Hello,\n\n' +
                'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
            };
            smtpTransport.sendMail(mailOptions, function(err) {
                req.flash('success', 'Success! Your password has been changed.');
                done(err);
            });
        }
    ], function(err) {
        res.redirect('/blog');
    });
});

module.exports = router;