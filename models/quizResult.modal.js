const { default: mongoose } = require("mongoose");

const quizResultSchema = mongoose.Schema({
    quizId:String,
    userId:String,
    result:Object,
    submittedAt:{
        type: Date,
        default:Date.now
    }
})

const quizResultModel = mongoose.model("quizresult",quizResultSchema);

module.exports = quizResultModel;