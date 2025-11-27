const mongoose = require("mongoose");

const questionSchema = mongoose.Schema({
    category:String,
    question:String,
    options:Array,
    correctOption:String,
    tags:Array,
    difficulty:String
})

const question = mongoose.model("question",questionSchema);

module.exports = question;

