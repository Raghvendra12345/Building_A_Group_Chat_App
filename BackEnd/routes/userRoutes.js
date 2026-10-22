

const dbModel=require("../controllers/userController")

const chatModel=require("../controllers/chatController")

const privateChatController = require("../controllers/privateMessageController");

const express=require("express")
const userAuthentication=require('../middleware/auth')

const route=express.Router()


route.post("/user",dbModel.signup)
route.post('/login',dbModel.login)


route.post('/messages',userAuthentication,chatModel.sendMessage)
route.get('/allmessages',userAuthentication,chatModel.getMessage)

route.get('/search',userAuthentication,dbModel.searchUser)


route.post(
    "/private-messages",
    userAuthentication,
    privateChatController.sendPrivateMessage
);

route.get(
    "/private-messages",
    userAuthentication,
    privateChatController.getPrivateMessages
);

route.get(
    "/conversations",
    userAuthentication,
    privateChatController.getConversations
);

route.patch(
    "/private-messages/read",
    userAuthentication,
    privateChatController.markPrivateMessagesAsRead
);

module.exports=route