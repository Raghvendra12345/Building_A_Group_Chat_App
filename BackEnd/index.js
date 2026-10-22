


const chatModel=require("./models/chatModel")
const mediaRoutes = require("./routes/media");

const { archiveJob } = require("./jobs/archiveMessages");

const aiRoutes = require("./routes/aiRoutes");

const express=require("express")
const cors=require("cors")

const app=express()

const http=require("http")



app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use("/ai", aiRoutes);
app.use("/media", mediaRoutes);

const userDB=require('./utils/db')
const userRoute=require("./routes/userRoutes")
const socketIO=require("./socket_io")

const  PORT=4700


app.use('/chat',userRoute)


const server=http.createServer(app)



const io=socketIO(server)

app.set("io",io)



app.get('/',(req,res)=>[
    res.status(200).send("Everything working fine")
])




userDB
.sync({force:false})
.then(()=>{

    // Start the nightly archive job
        archiveJob.start();
        console.log("Message archive cron job started.");
      server.listen(PORT,"0.0.0.0",()=>{

        
        console.log("server is running fine")
    });
})
.catch((err)=>{
    console.log({err:err.message})
});