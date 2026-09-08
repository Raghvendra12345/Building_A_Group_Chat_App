

const jwt=require("jsonwebtoken")
const express=require('express')


function generateToken(id,username){
    return jwt.sign(
        {
            userId:id,
            username:username
        },
        "secretkey"
    )
}

module.exports=generateToken