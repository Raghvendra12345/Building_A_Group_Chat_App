const express=require("express")

const chatModel=require("../models/chatModel")

const sendMessage=async(req,res)=>{
    try{
       const {message}=req.body

       if(!message || !message.trim()){
        return res.status(400).json({success:false,error:"Message cannot be Empty"})
       }

       const newMessage=await chatModel.create({
           message:message.trim(),
           userId:req.user.userId
       })
       return res.status(201).json({success:true,message:"Message send Successfully",data:newMessage})
    }
    catch(error){
         console.log(error.message)
         return res.status(500).json({success:false,error:error.message})
    }

}

module.exports={sendMessage}