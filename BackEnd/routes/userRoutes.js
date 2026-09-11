

const dbModel=require("../controllers/userController")

const chatModel=require("../controllers/chatController")

const express=require("express")
const userAuthentication=require('../middleware/auth')

const route=express.Router()


route.post("/user",dbModel.signup)
route.post('/login',dbModel.login)


route.post('/messages',userAuthentication,chatModel.sendMessage)


module.exports=route