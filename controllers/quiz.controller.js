const question = require("../models/question.modal");
const quiz = require("../models/quiz.modal");
const jwt = require("jsonwebtoken");
const quizResultModel = require("../models/quizResult.modal");
const userModel = require("../models/user.modal");

const addNewQuiz = async (req, res) => {
    try {
        const newQuiz = new quiz(req.body);
        const addedQuiz = await newQuiz.save();
        if (!addedQuiz) {
            res.json({ message: "Quiz not added" });
        }
        else {
            res.json({ message: "Quiz added Successfully" });
        }
    }
    catch (error) {
        res.json({ message: "Error adding QUiz", error });
    }
}

const getAllQuizzes = async (req, res) => {
    try {
        const allQuizzes = await quiz.find();
        if (allQuizzes.length == 0) {
            res.json({ message: "No quizzes found" });
        }
        else {
            res.json({ allQuizzes, message: "Quizzes sent successfully" });
        }
    }
    catch (error) {
        res.json({ message: "Error sending quizzes", error });
    }
}

const getQuizById = async (req, res) => {
    try {
        if (req?.headers?.token) {
            const userDetails = jwt.verify(req?.headers?.token, "login token");
            const quizById = await quiz.findById(req.params.Id);
            if (quizById.length == 0) {
                res.json({ message: "No quiz found" });
            }
            else {
                if (userDetails?.role == "Student") {
                    const quizQuestions = await Promise.all(quizById.quizQuestions.map(async (queId) => {
                        return await question.findById(queId, { correctOption: 0, category: 0, difficulty: 0, __v: 0, tags: 0 })
                    }))
                    const initialValues = { quizId: quizById["_id"] };
                    quizQuestions.forEach((que) => { initialValues[que["_id"]] = "" });
                    res.json({ quizQuestions, initialValues,quizTitle:quizById?.quizTitle, message: "Quiz sent successfully" });
                }
                else {
                    res.json({ requestedQuiz: quizById, message: "Quiz sent successfully" });
                }
            }
        }
        else {
            res.json({ message: "Please login" });
        }
    }
    catch (error) {
        res.json({ message: "Error sending requested quiz", error });
    }
}


const editQuizById = async (req, res) => {
    try {
        const editedQuiz = await quiz.findByIdAndUpdate(req.params.Id, req.body);
        if (!editedQuiz) {
            res.json({ message: "Quiz not updated" });
        }
        else {
            res.json({ message: "Quiz updated successfully", editedQuiz });
        }
    }
    catch (error) {
        res.json({ message: "Error editing quiz", error });
    }
}

const deleteQuizById = async (req, res) => {
    try {
        const deletedQuiz = await quiz.findByIdAndDelete(req.params.Id);
        if (!deletedQuiz) {
            res.json({ message: "Quiz not deleted" });
        }
        else {
            res.json({ message: "Quiz deleted successfully", deletedQuiz });
        }
    }
    catch (error) {
        res.json({ message: "Error deleting quiz", error });
    }
}

const saveResults = async (req, res) => {
    const quizById = await quiz.findById(req?.body?.quizId)
    const quizQuestions = await Promise.all(quizById?.quizQuestions?.map(async (queId) => {
        return await question.findById(queId)
    }))
    const result = {};
    quizQuestions.forEach((que) => {
        let score = 0;
        req.body[que["_id"]].forEach((ans)=>{
            if(que?.correctOption.includes(ans)) score++;
        })
        result[que["_id"].toString()] = {
            correctAnswer: que?.correctOption,
            userAnswer: req.body[que["_id"]],
            score
        };
    })
    const tokenDetails = jwt.verify(req?.headers?.token,"login token");
    const newResult = new quizResultModel({quizId:req?.body?.quizId,userId:tokenDetails?.userId,result})
    const addedResult = await newResult.save();
    res.json({message:"Quiz submitted successfully",result});
}

const getStudentResults = async (req,res) => {
    try{
        if(!req?.headers?.token){
            res.json({message:"Token is required"});
        }
        else{
            const tokenDetails = jwt.verify(req?.headers?.token,"login token");
            const studentResults = await quizResultModel.find({userId:tokenDetails?.userId});
            const updatedStudentResults = await Promise.all(studentResults.map(async (result)=>{
                const quizObj = await quiz.findById(result?.quizId);
                return {...result.toObject(),quizTitle:quizObj?.quizTitle};
            }))
            res.json({message:"Results sent successfully",studentResults:updatedStudentResults});
        }
    }
    catch(error){
        res.json({message:"Error sending results",error})
    }
}

const getResultsByQuizId = async (req,res) => {
    try{
        if(!req?.headers?.token){
            res.json({message:"Token is required"});
        }
        else{
            const tokenDetails = jwt.verify(req?.headers?.token,"login token");
            if(tokenDetails.role == "Student"){
                res.json({message:"Not authorized"});
            }
            else{
                const quizResultsById = await quizResultModel.find({quizId:req.params.Id});
                // console.log(quizResultsById);
                const quizResults = await Promise.all(quizResultsById.map(async (result)=>{
                    const userDetails = await userModel?.findById(result?.userId.toString());
                    // console.log("User Details",userDetails);
                    return {...result.toObject(),username:userDetails?.username,email:userDetails?.email}
                }))
                // console.log(quizResults);
                res.json({message:"Quiz results sent successfully",quizResults});
            }
        }
    }
    catch(error){
        res.json({message:"Error sending Quiz results",error});
    }
}

module.exports = { addNewQuiz, getAllQuizzes, editQuizById, getQuizById, deleteQuizById, saveResults, getStudentResults,getResultsByQuizId };