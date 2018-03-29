const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    text: String,
    author: {
        id: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
        },
        username: String
      },
    date: {
        type: Date,
        default: Date.now
    }
});




module.exports = mongoose.model("Comment", commentSchema);