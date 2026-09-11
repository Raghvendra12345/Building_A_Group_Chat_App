

const jwt=require("jsonwebtoken")
const chatUser=require("../models/userModel")



async function authentication(req,res,next){
    try{
        const token=req.headers.authorization
             console.log(token)

       if(!token){
           return res.status(401).json({success:false,message:"No token provided"})
         }


        const authToken=token.split(" ")[1]


        const decoded=jwt.verify(authToken,"secretkey")
    
        const user=await chatUser.findByPk(decoded.userId)

        if(!user) return res.status(401).json({success:false,message:"User not found"})
       
           req.user={
               userId:user.id,
               username:user.username
           }
         next();
       
    }
    


    
   
    catch(err){
        // console.log(err.message)
        // return res.status(401).json({success:false,message:"Invalid or expried token"})
        console.log("AUTH ERROR:", err.message)

    return res.status(401).json({
        success:false,
        message:err.message
    })
    }

   
}

module.exports=authentication