
const express=require('express')
const bcrypt=require('bcrypt')
const validator=require("validator")
const {Op}=require("sequelize")

const chatUser=require('../models/userModel')
const generateToken = require('../utils/generateToken')


const signup=async(req,res)=>{
    try{

        const {username,email,phoneNumber,password}=req.body

        if(!username || !email || !phoneNumber || !password){
            res.status(404).json({error:"Fill all details"})
        }

        const existingUser=await chatUser.findOne({

            where:{
                [Op.or]:[
                    {email:email},
                    {phoneNumber:phoneNumber}
                ]
            }
        })

        if(existingUser){
            res.status(401).json({error:"User already exist..Please Login"})
        }

        if(!validator.isStrongPassword(password)){
            return res.status(403).json({error:"Password should be UpperCase,LowerCase,digit & Special Character"})
        }

        const saltrounds=10

        bcrypt.hash(password,saltrounds,async(err,hash)=>{
            console.log(err)

            const signup=await chatUser.create({
                username:username,
                email:email,
                phoneNumber:phoneNumber,
                password:hash
            })
            res.status(201).json({message:"chatUser Created Successfully"})
    })



    }
    catch(err){
         console.log({err:err.message})
         return res.status(500).json({err:err.message})
    }

}

const login=async(req,res)=>{
    try{
        const {identifier,password}=req.body

        if(!identifier || !password){
            return res.status(404).json({error:"Details Not filled"})
        }

        // const whereCondition=email ? {email:email} : {phoneNumber:phoneNumber}

         const user=await chatUser.findOne({
            where: 
               {
                [Op.or]:[
                    {email:identifier},
                    {phoneNumber:identifier}
                ]
               }
        })

        if(!user){
            return res.status(401).json({success:false,error:"User not exist..Please Signup"})
        }

        const result=await bcrypt.compare(password,user.password)

           if(!result){
            return res.status(200).json({success:false,error:"Invalid password"})
           }
             
           const token=generateToken(user.id,user.username)

           console.log("TOKEN FROM GENERATE:", token);
            
                return res.status(200).json({success:true,message:"User Logged In Successfully",token})
            
        


    }
    catch(err){
        console.log({err:err.message})
        return res.status(500).json({success:false,err:err.message})
    }
}

module.exports={signup,login}