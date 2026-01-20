var mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    username:String,
    email:String,
    phone:Number,
    role:String,
    password:String,
})

const userModel = mongoose.model("user",userSchema);

module.exports = userModel;