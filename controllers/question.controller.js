const sharp = require("sharp");
const question = require("../models/question.modal")
const path = require("path")
const fs = require("fs")

const addQuestion = async (req, res) => {
    try {
        const reqQue = JSON.parse(req?.body?.quizQues);
        // console.log("Request Image:", req.files);
        if (reqQue.questionImage != null) {
            const imageFile = req.files[0];
            if (imageFile) {
                const compressedFileName = `questionImage_${Date.now()}.jpg`;
                const imageFilePath = `uploads/${compressedFileName}`;

                async function compressToMaxSize(buffer = imageFile.buffer, maxSizeKB = 200) {
                    let quality = 80;
                    let compBuffer = buffer;

                    while (quality > 0 && compBuffer.length / 1024 > maxSizeKB) {
                        compBuffer = await sharp(buffer)
                            .resize({
                                withoutEnlargement: true
                            })
                            .jpeg({ quality })
                            .toBuffer();
                        quality -= 10;
                    }
                    return compBuffer;
                }

                let compressedFile = await compressToMaxSize(imageFile.buffer, 200);

                fs.writeFileSync(`./${imageFilePath}`, compressedFile);

                reqQue.questionImage = imageFilePath;
            }
        };
        console.log("After adding image",reqQue);
        const newQuestion = new question(reqQue);
        console.log(newQuestion);
        let addedQuestion = await newQuestion.save();
        if (!addedQuestion) {
            res.json({ message: "Question not added" });
        }
        res.json({ message: "Question Added Successfully" })
    }
    catch (error) {
        console.log(error);
        res.json({ message: "Error in adding Question", error });
    }
}

const getQuestions = async (req, res) => {
    try {
        const questions = await question.find();
        if (questions.length == 0) {
            res.json({ message: "No Questions Found" });
        }
        else {
            res.json({ questions, message: "Questions send successfully" });
        }
    }
    catch (error) {
        res.json({ message: "Error getting Questions", error })
    }
}

const getQuestionById = async (req, res) => {
    try {
        const requestedQuestion = await question.findById(req.params.Id);
        if (!requestedQuestion) {
            res.json({ message: "No Question Found" });
        }
        else {
            res.json({ requestedQuestion, message: "Requested Question sent successfully" });
        }
    }
    catch (error) {
        res.json({ message: "Error fetching requested question", error });
    }
}

const editQuestionById = async (req, res) => {
    try {
        // console.log(req.body);
        const editedQuestion = await question.findByIdAndUpdate(req.params.Id, req.body);
        if (!editedQuestion) {
            res.json({ message: "Question not updated" });
        }
        else {
            res.json({ message: "Edited question successfully", editedQuestion });
        }
    }
    catch (error) {
        res.json({ message: "Error editing question", error });
    }
}

const deleteQuestionById = async (req, res) => {
    try {
        const deletedQuestion = await question.findByIdAndDelete(req.params.Id);
        if (!deletedQuestion) {
            res.json({ message: "Question not deleted" });
        }
        else {
            res.json({ message: "Deleted Question Successfully" });
        }
    }
    catch (error) {
        res.json({ message: "Error deleting Question", error });
    }
}

module.exports = { addQuestion, getQuestions, getQuestionById, editQuestionById, deleteQuestionById };