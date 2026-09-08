

const dbModel=require("../controllers/userController")

const express=require("express")

const route=express.Router()


route.post("/user",dbModel.signup)
route.post('/login',dbModel.login)

// route.post("/login", (req, res) => {
//     console.log("LOGIN ROUTE REACHED");
//     console.log(req.body);

//     res.status(200).json({
//         success: true,
//         message: "Login route working"
//     });
// });


module.exports=route