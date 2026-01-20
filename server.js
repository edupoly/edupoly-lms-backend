const express = require("express");
const bodyparser = require("body-parser")
const mongoose = require('mongoose')
const cors = require("cors")
const Technology = require("./models/technology.model");
const upload = require("./controllers/multer.controller");
const sharp = require("sharp");
const fs=require("fs");
const path = require("path");
const { addQuestion, getQuestions, getQuestionById, editQuestionById, deleteQuestionById } = require("./controllers/question.controller");
const { addNewQuiz, getAllQuizzes, editQuizById, getQuizById, deleteQuizById, saveResults, getStudentResults, getResultsByQuizId } = require("./controllers/quiz.controller");
const { signup, login, getUserDetails } = require("./controllers/user.controller");
const dotenv = require("dotenv");
const dbConnect = require("./config/dbConnect");



const app = express();

app.use(cors())
app.use(bodyparser.urlencoded({ extended: false }))
app.use(bodyparser.json())

dotenv.config();
dbConnect();

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// technology routes

app.get("/technologies", async (req, res) => {
    try {
        const data = await Technology.find({})
        console.log(data)
        if (!data) {
            return res.json({ msg: "Technologies not found" })
        }
        res.send(data)
    } catch (error) {
        res.json({ msg: "server Error" })
    }
})

app.post("/addtechnology", async (req, res) => {
    try {
        const { title, description, image } = req.body;
        const technology = new Technology({
            title,
            image,
            description
        });
        const savedtechnology = await technology.save()
        if (!savedtechnology) {
            return res.json({ msg: "Technology not added" })
        }
        res.json({ msg: "Technology added successfully", id: savedtechnology._id })

    }
    catch (error) {
        res.json({ msg: "Error in adding technology" })
    }
});

app.post("/addQuestion",upload.any(),addQuestion);
app.get("/getQuestions",getQuestions);
app.get("/getQuestionById/:Id",getQuestionById);
app.put("/editQuestionById/:Id",editQuestionById);
app.delete("/deleteQuestionById/:Id",deleteQuestionById);

app.post("/addQuiz",addNewQuiz);
app.get("/getAllQuizzes",getAllQuizzes);
app.put("/editQuizById/:Id",editQuizById);
app.get("/getQUizById/:Id",getQuizById);
app.delete("/deleteQuizById/:Id",deleteQuizById);
app.post("/submitQuiz",saveResults);
app.get("/getStudentResults",getStudentResults);
app.get("/getResultsByQuizId/:Id",getResultsByQuizId);

app.post("/user/signup",signup);
app.post("/user/login",login);
app.get("/user/getUserDetails",getUserDetails);

app.get("/gettechnologies", async (req, res) => {
    try {
        const tech = await Technology.find()
        if (!tech) {
            return res.json({ msg: "no technology found" })
        }
        res.send(tech)
    } catch (error) {
        res.json({ msg: "Error in finding technologies" })
    }
})

app.get("/gettechnology/:id", async (req, res) => {
    try {
        const technology = await Technology.findOne({ _id: req.params.id })
        if (!technology) {
            return res.json({ msg: "no technology found" })
        }
        res.send(technology)
    } catch (error) {
        res.json({ msg: "Error in finding technologyy" })
    }
})


app.put("/updatetechnology/:id", async (req, res) => {
    try {
        var updateddata = req.body
        const technology = await Technology.findOneAndUpdate({ _id: req.params.id }, updateddata, { new: true })
        console.log(technology)
        if (!technology) {
            return res.json({ msg: "technology not updated" })
        }
        res.json({ msg: "technology updated succesfully" })
    } catch (error) {
        res.json({ msg: "server error" })
    }
})


app.delete("/deletetechnology/:tid", async (req, res) => {
    try {
        console.log(req.params.tid)
        const deletedTechnology = await Technology.findByIdAndDelete(req.params.tid);
        console.log(deletedTechnology)
        if (!deletedTechnology) {
            return res.json({ message: "Technology not found" });
        }
        res.json({ msg: "Technology deleted successfully" });

    } catch (error) {
        res.json({ msg: "Server error" });
    }
});


// concept routes


app.put("/addconcept/:tid", async (req, res) => {
    try {
        var obj = req.body
        const concept = await Technology.findOneAndUpdate(
            { _id: req.params.tid },
            { $push: { concepts: obj } }
        )
        if (!concept) {
            return res.json({ msg: "concept is not added" })
        }
        res.json({ msg: "concept added succesfully" })
    } catch (error) {
        res.json({ msg: "Server error", error });
    }

})


app.put("/updateconceptname/:tid/:cid", async (req, res) => {
    try {
        var { conceptName } = req.body
        const concept = await Technology.findOneAndUpdate(
            { _id: req.params.tid, "concepts._id": req.params.cid },
            { $set: { "concepts.$.conceptName": conceptName } }
        )
        if (!concept) {
            return res.json({ msg: "concept not updated" })
        }
        res.json({ msg: "concept updated succesfully" })
    } catch (error) {
        res.json({ msg: "Server error", error });
    }
})


app.delete("/deleteconcept/:tid/:cid", async (req, res) => {
    try {
        const concept = await Technology.findOneAndUpdate(
            { _id: req.params.tid },
            { $pull: { concepts: { _id: req.params.cid } } },
            { new: true }
        );
        if (!concept) {
            return res.json({ msg: "concept not deleted" })
        }
        res.json({ msg: "concept deleted succesfully" })
    } catch (error) {
        res.json({ msg: "Server error", error });
    }
})



// topic routes


app.get("/topicdetails/:tid/:cid", async (req, res) => {
    try {
        console.log("hiiiiiiiiiiiiiiiii")
        var topic = await Technology.findOne(
            { _id: req.params.tid, "concepts._id": req.params.cid },
            { "concepts.$": 1 }
        )
        console.log(topic)
        res.send(topic)
    } catch (error) {
        console.log("error in topic")
    }
})


app.put("/addtopic/:tid/:cid", async (req, res) => {
    try {
        console.log("88888", req.body)
        var obj = { ...req.body }
        console.log("ooo", obj)
        const topic = await Technology.findOneAndUpdate(
            { _id: req.params.tid, "concepts._id": req.params.cid },
            { $push: { "concepts.$.topics": obj } },
            { new: true }
        )
        console.log("topic", topic)
        if (!topic) {
            return res.json({ msg: "topic is not added" })
        }
        res.json({ msg: "topic added succesfully" })
    } catch (error) {
        res.json({ msg: "Server error", error });
    }
})


// app.put("/addcontent/:tid/:cid/:topicId", async (req, res) => {
//     try {
//         console.log("Request body:", req.body);
//         const newContent = { ...req.body };
//         console.log("New content:", newContent);

//         const updatedDocument = await Technology.findOneAndUpdate(
//             {
//                 _id: req.params.tid,
//                 "concepts._id": req.params.cid,
//                 "concepts.$.topics._id": req.params.topicId
//             },
//             { $push: { "concepts.$[concept].topics.$[topic].contents": newContent } },
//             {
//                 new: true,
//                 arrayFilters: [
//                     { "concept._id": req.params.cid },
//                     { "topic._id": req.params.topicId }
//                 ]
//             }
//         );

//         console.log("Updated document:", updatedDocument);
//         if (!updatedDocument) {
//             return res.json({ msg: "Content could not be added" });
//         }

//         res.json({ msg: "Content added successfully", updatedDocument });
//     } catch (error) {
//         res.json({ msg: "Server error", error });
//     }
// });


app.put("/addcontent/:tid/:cid/:topicId", upload.any(), async (req, res) => {
    try {

        // console.log("Request body:", req.body);
        // console.log("Request Image:", req.files);
        const topicInfo = JSON.parse(req.body.topicInfo)
        // console.log(topicInfo);
        for (let index = 0; index < topicInfo.quizcontent.length; index++) {
            const q = topicInfo.quizcontent[index];
            if (q.questionImage != null) {
                const imageFile = req.files.find((file) => file.fieldname == `questionImage_${index}`);
                if(imageFile){
                    const compressedFileName = `questionImage_${Date.now()}_${index}.jpg`;
                    const imageFilePath = path.join(`uploads`,compressedFileName);

                    async function compressToMaxSize(buffer = imageFile.buffer , maxSizeKB = 200){
                        let quality = 80;
                        let compBuffer = buffer;

                        while (quality > 0 && compBuffer.length/1024 > maxSizeKB){
                            compBuffer = await sharp(buffer)
                            .resize({
                                withoutEnlargement:true
                            })
                            .jpeg({quality})
                            .toBuffer();
                            quality -=10;
                        }
                        return compBuffer;
                    }

                    let compressedFile = await compressToMaxSize(imageFile.buffer , 200);
                    // const compressedBuffer = await sharp(imageFile.buffer)
                    // .resize({
                    //     withoutEnlargement:true
                    // })
                    // .jpeg({quality:50})
                    // .toBuffer()

                    fs.writeFileSync(imageFilePath,compressedFile);

                    q.questionImage = imageFilePath;
                }
            };
        };

        // console.log("Topic Info after images:", topicInfo);
        // console.log("params", req.params)
        // const newContent = { ...req.body };
        const updatedDocument = await Technology.findOneAndUpdate(
            {
                _id: req.params.tid,
                "concepts._id": req.params.cid,
                "concepts.topics._id": req.params.topicId
            },
            {
                $push: { "concepts.$[concept].topics.$[topic].contents": topicInfo }
            },
            {
                new: true,
                arrayFilters: [
                    { "concept._id": req.params.cid },
                    { "topic._id": req.params.topicId }
                ]
            }
        );

        if (!updatedDocument) {
            return res.json({ msg: "Content could not be added" });
        }

        res.json({ msg: "Content added successfully", updatedDocument });
        // res.json({ msg: "Content added successfully", addedContent: topicInfo });
    } catch (error) {
        console.error("Error adding content:", error);
        res.json({ msg: "Server error", error });
    }
});




app.put("/addcontent/:tid/:cid/:topicId", async (req, res) => {
    try {
        // console.log("Request Body:", req.body);

        const { tid, cid, topicId } = req.params;
        const contentObj = { ...req.body };



        const updatedTopic = await Technology.findOneAndUpdate(
            {
                _id: tid,
                "concepts._id": cid,
                "concepts.topics._id": topicId
            },
            {
                $push: { "concepts.$[concept].topics.$[topic].contents": contentObj }
            },
            {
                arrayFilters: [
                    { "concept._id": cid },
                    { "topic._id": topicId }
                ],
                new: true
            }
        );

        if (!updatedTopic) {
            return res.json({ msg: "Content not added. Topic not found." });
        }


        res.json({ msg: "Content added successfully", updatedTopic });
    } catch (error) {
        console.error("Error:", error);
        res.json({ msg: "Server error", error: error.message });
    }
});



// app.put("/addcontent/:tid/:cid/:topicId", async (req, res) => {
//     try {
//         console.log("Request Body:", req.body);

//         const { tid, cid, topicId } = req.params;
//         const contentObj = { ...req.body };

//         const updatedTopic = await Technology.findOneAndUpdate(
//             {
//                 _id: tid,
//                 "concepts._id": cid,
//                 "concepts.topics._id": topicId
//             },
//             {
//                 $push: { "concepts.$[concept].topics.$[topic].contents": contentObj }
//             },
//             {
//                 arrayFilters: [
//                     { "concept._id": cid },
//                     { "topic._id": topicId }
//                 ],
//                 new: true
//             }
//         );

//         if (!updatedTopic) {
//             return res.json({ msg: "Content not added" });
//         }

//         res.json({ msg: "Content added successfully" });
//     } catch (error) {
//         console.error("Error:", error);
//         res.json({ msg: "Server error", error });
//     }
// });





// app.get("/gettopicdetails/:tid/:cid/:topicId",async(req,res)=>{
//      try {
//         console.log("hiii")
//       var topic =  await Technology.findOne(
//         {_id:req.params.tid,"concepts._id":req.params.cid,"concepts.topics._id":req.params.topicId},
//         {"concepts.topics.$":1}
//       )
//       res.send(topic)
//      } catch (error) {
//         res.json({msg:"server error"})
//      }
// })


app.get("/gettopicdetails/:tid/:cid/:topicId/:contentId", async (req, res) => {
    try {
        const { tid, cid, topicId, contentId } = req.params;
        console.log(req.params);

        const topic = await Technology.findOne(
            {
                _id: tid,
                "concepts._id": cid,
                "concepts.topics._id": topicId,
            },
            {
                "concepts.$": 1,
            }
        );

        if (!topic || !topic.concepts?.[0]?.topics) {
            return res.json({ msg: "Content not found" });
        }

        const topics = topic.concepts[0].topics;
        const topicDetails = topics.find((t) => t._id.toString() === topicId);

        if (!topicDetails || !topicDetails.contents) {
            return res.json({ msg: "Content not found" });
        }

        const content = topicDetails.contents.find(
            (c) => c._id.toString() === contentId
        );

        if (!content) {
            return res.json({ msg: "Content not found" });
        }

        res.json(content);
    } catch (error) {
        console.error("Error:", error);
        res.json({ msg: "Server error", error });
    }
});





// app.put("/updatetopic/:tid/:cid/:toid",async(req,res)=>{
//     try {
//         console.log(req.body)
//         const updatedTopic = await Technology.findOneAndUpdate(
//             {_id: req.params.tid,"concepts._id": req.params.cid,"concepts.topics._id": req.params.toid,},
//             {
//                 $set: {
//                     "concepts.$.topics.$[topic].title": req.body.title,
//                     "concepts.$.topics.$[topic].shortheading": req.body.shortheading,
//                     "concepts.$.topics.$[topic].contents": req.body.contents,
//                 },
//             },
//             {
//                 arrayFilters: [{ "topic._id": req.params.toid }],
//                 new: true,
//             }
//         );
//         if(!updatedTopic){
//             return res.json({msg:"topic is not updated"})
//         }
//         res.json({msg:"topic updated succesfully"})

//     } catch (error) {
//         res.json({msg:"server error"})
//     }
// })


// app.put("/edittopic/:tid/:cid/:topicid", async (req, res) => {
//     try {
//         console.log("Updating topic...");
//         const { tid, cid, topicid } = req.params;
//         const updateData = req.body; // Contains updated title & shortheading

//         console.log("Received Data:", updateData);

//         // Find and update the correct topic inside the Technology model
//         const updatedDoc = await Technology.findOneAndUpdate(
//             {
//                 _id: tid,
//                 "concepts._id": cid,
//                 "concepts.topics._id": topicid, // Ensure correct topic lookup
//             },
//             {
//                 $set: {
//                     "concepts.$.topics.$[topic]": updateData,
//                 //     "concepts.$.topics.$[topic].title": updateData.title,
//                 //     "concepts.$.topics.$[topic].shortheading": updateData.shortheading,
//                 },
//             },{

//                 // arrayFilters: [
//                 //     { "concept._id": cid }, 
//                 //     { "topic._id": topicid }, 

//                 // ],
//                 new: true,
//             }
//         );

//         if (!updatedDoc) {
//             return res.json({ msg: "Topic not found or not updated" });
//         }

//         res.json({ msg: "Topic updated successfully", updatedDoc });
//     } catch (error) {
//         console.error("Error updating topic:", error);
//         res.json({ msg: "Server error", error });
//     }
// });



app.put("/edittopic/:tid/:cid/:topicid", async (req, res) => {
    try {
        console.log("Updating topic...");
        const { tid, cid, topicid } = req.params;
        const updateData = req.body; // Updated topic data

        console.log("Received Data:", updateData);

        // Find and update the correct topic
        const updatedDoc = await Technology.findOneAndUpdate(
            {
                _id: tid,
                "concepts._id": cid, // Find correct concept
                "concepts.topics._id": topicid,
            },
            {
                $set: {
                    "concepts.$[].topics.$[t].title": updateData.title,
                    "concepts.$[].topics.$[t].shortheading": updateData.shortheading,
                    // "concepts.$[].topics.$[t].description":updateData.description
                },
            },
            {
                arrayFilters: [{ "t._id": topicid }],
                new: true
            }

        );

        if (!updatedDoc) {
            return res.status(404).json({ msg: "Topic not found or not updated" });
        }

        res.json({ msg: "Topic updated successfully", updatedDoc });
    } catch (error) {
        console.error("Error updating topic:", error);
        res.status(500).json({ msg: "Server error", error });
    }
});






app.put("/updatetopic/:tid/:cid/:topicId/:contentId", async (req, res) => {
    try {
        const { tid, cid, topicId, contentId } = req.params;
        console.log(tid, cid, topicId, contentId)
        const updateData = req.body;

        console.log("Request to update content:");
        console.log(updateData);

        const updatedDoc = await Technology.findOneAndUpdate(
            {
                _id: tid,
                "concepts._id": cid,
            },
            {
                $set: {
                    "concepts.$[concept].topics.$[topic].contents.$[content]": updateData,
                },
            },
            {
                arrayFilters: [
                    { "concept._id": cid },
                    { "topic._id": topicId },
                    { "content._id": contentId },
                ],
                new: true,
            }
        );

        if (!updatedDoc) {
            return res.json({ msg: "Content not updated. No matching document found." });
        }

        res.json({ msg: "Content updated successfully", updatedDoc });
    } catch (error) {
        console.error("Error updating content:", error);
        res.json({ msg: "Server error", error });
    }
});

//DELETE CONTENT
app.delete("/deletecontent/:tid/:cid/:topicId/:contentid", async (req, res) => {
    console.log(req.params)
    try {
        console.log("hi")
        const { tid, cid, topicId, contentid } = req.params
        var upcontent = await Technology.findOneAndUpdate(

            {
                _id: tid,
                "concepts._id": cid,
                "concepts.topics._id": topicId,
                // "concepts.topics._id.contents._id": req.params.contentid


            },
            { $pull: { "concepts.$[concept].topics.$[topic].contents": { _id: contentid } } },
            {
                arrayFilters: [
                    { 'concept._id': cid }, { "topic._id": topicId },
                ],
                new: true
            }
        )
        if (!upcontent) {
            return res.json({ msg: "content not deleted" })
        }
        res.json({ msg: "topic deleted succesfully" })
    } catch (error) {
        res.json({ msg: "server error" })
    }
})




app.delete("/deletetopic/:tid/:cid/:toid", async (req, res) => {
    try {

        var topic = await Technology.findOneAndUpdate(
            { _id: req.params.tid, "concepts._id": req.params.cid },
            { $pull: { "concepts.$.topics": { _id: req.params.toid } } },
            { new: true }
        )
        if (!topic) {
            return res.json({ msg: "topic not deleted" })
        }
        res.json({ msg: "topic deleted succesfully" })
    } catch (error) {
        res.json({ msg: "server error" })
    }
})


app.listen(process.env.PORT, () => {
    console.log(`server is running on ${process.env.PORT}`)
})