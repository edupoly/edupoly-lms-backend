const mongoose = require("mongoose");

const questionSchema = mongoose.Schema({
    category:String,
    question:String,
    questionImage:String,
    optionType:String,
    options:Array,
    correctOption:Array,
    tags:Array,
    difficulty:String
})

const question = mongoose.model("question",questionSchema);

module.exports = question;

