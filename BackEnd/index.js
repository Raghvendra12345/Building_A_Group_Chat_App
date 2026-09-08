

const express=require("express")
const cors=require("cors")

const app=express()
app.use(cors())

const userDB=require('./utils/db')
const userRoute=require("./routes/userRoutes")

const  PORT=4700

app.use(express.json())
app.use('/chat',userRoute)



app.get('/',(req,res)=>[
    res.status(200).send("Everything working fine")
])




userDB
.sync({force:false})
.then(()=>{
      app.listen(PORT,()=>{
        console.log("server is running fine")
    });
})
.catch((err)=>{
    console.log({err:err.message})
});