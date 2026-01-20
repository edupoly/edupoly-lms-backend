const userModel = require("../models/user.modal")
const jwt = require("jsonwebtoken");

const signup = async (req,res) => {
    try{
        // console.log(req.body);
        const newUser = new userModel(req.body);
        const addedUser = await newUser.save();
        if(!addedUser){
            res.json({message:"Account not created"});
        }
        else{
            res.json({message:"Account created successfully",addedUser});
        }
    }
    catch(error){
        // console.log(error);
        res.json({message:"Error creating account",error});
    }
}

const login = async (req,res) => {
    try{
        const userDetails = await userModel.find(req.body);
        if(userDetails.length < 1){
            res.json({message:"Invalid Credentials"});
        }
        else{
            const token = jwt.sign({username:userDetails[0].username,userId:userDetails[0]["_id"].toString(),role:userDetails[0].role},process.env.JWT_SECRET)
            res.json({message:"Authentication successfull",token,role:userDetails[0].role,username:userDetails[0].username});
        }
    }
    catch(error){
        res.json({message:"Error in Authentication",error});
    }
}

const getUserDetails = async (req,res) => {
    try{
        if(!req?.headers?.token){
            res.json({message:"Token is required"});
        }
        else{
            const tokenDetails = jwt.verify(req?.headers?.token,"login token");
            const userDetails = await userModel.findById(tokenDetails?.userId);
            res.json({message:"User details sent successfully",userDetails:{username:userDetails[0].username,email:userDetails[0].email}});
        }
    }
    catch(error){
        res.json({message:"Error sending user details",error});
    }
}

module.exports = {signup,login,getUserDetails};