const mongoose              = require("mongoose"),
      passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new mongoose.Schema({
        username: {
            type: String,
            unique: true
        },
        email: {
            type: String,
            unique: true
        },
        password: String,
         isAdmin: {
           type: Boolean,
         default: false
         },
        resetPasswordToken: String,
        resetPasswordExpires: Date,
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);