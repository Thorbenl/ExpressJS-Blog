const express     = require('express'),
    request       = require("request"),
    app           = express(),
    bodyParser    = require("body-parser"),
    mongoose      = require("mongoose"),
    seedDB        = require("./seeds"),
    methodOverride = require('method-override'),
    flash          = require('connect-flash'),

    //Authentication
    passport      = require("passport"),
    LocalStrategy = require("passport-local"),

    //Models
    Blog          = require("./models/blog"),
    Comment       = require("./models/comment"),
    User          = require("./models/user");


//requring routes
const commentRoutes     = require("./routes/comments"),
      blogRoutes        = require("./routes/blog"),
      indexRoutes       = require("./routes/index");


// ====================
// DATABASE CONFIG START
// ====================
// Connect to MongoDB
mongoose.connect('mongodb://eratiosu:Akaishu23!@ds223019.mlab.com:23019/blog', {
    useMongoClient: true
});

let db = mongoose.connection;

// Mongo Error Handler
db.on('error', console.error.bind(console, 'connection error:'));

// Feedback if connection to browser was successful
db.once('open', () => {
    console.log('Connected to database!');
});

//OUTCOMMENT THIS IF YOU WANT TO DELETE ALL DB ENTRIES :)
//seedDB();

// ====================
// DATABASE CONFIG END
// ====================

// ====================
// GENERAL APP SETTINGS START
// ====================

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));


app.use(methodOverride("_method"));

// ====================
// GENERAL APP SETTINGS END
// ====================


// ====================
// AUTH CONFIG PASSPORT START
// ====================
app.use(require("express-session")({
    secret: "I dont even know what im doing",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    next();
});

// ====================
// AUTH CONFIG PASSPORT END
// ====================


app.use("/", indexRoutes);
app.use("/blog", blogRoutes);
app.use("/blog/:id/comments", commentRoutes);


// ====================
// HEY, LISTEN!
// ====================
app.listen(3000, function () {
  console.log('Blog Server has started on port 3000!');
});
