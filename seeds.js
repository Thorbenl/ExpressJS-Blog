const mongoose      = require("mongoose"),
    Blog            = require("./models/blog"),
    Comment         = require("./models/comment");


function seedDB(){
	Blog.remove({}, function(err) {
		if(err) {
			console.log(err);
		}

	});

	
}

module.exports = seedDB;


