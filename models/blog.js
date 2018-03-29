const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const blogSchema = new Schema({
    name: String,
    image: String,
    description: String,
    date: {
        type: Date,
        default: Date.now
    },
    comments:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ]
}, { usePushEach: true });


module.exports = mongoose.model("Blog", blogSchema);