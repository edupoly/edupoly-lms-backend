const question = require("../models/question.modal")

const addQuestion = async (req, res) => {
    try {
        const newQuestion = new question(req.body);
        let addedQuestion = await newQuestion.save();
        if (!addedQuestion) {
            res.json({ message: "Question not added" });
        }
        res.json({ message: "Question Added Successfully" })
    }
    catch (error){
        res.json({message:"Error in adding Question",error});
    }
}

const getQuestions = async (req,res) => {
    try{
        const questions = await question.find();
        if(!questions){
            res.json({message:"No Questions Found"});
        }
        else{
            res.json({questions});
        }
    }
    catch (error){
        res.json({message:"Error getting Questions",error})
    }
}

module.exports = {addQuestion,getQuestions};