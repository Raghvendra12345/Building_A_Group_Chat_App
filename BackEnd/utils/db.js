

const sequelize=require("sequelize")


const sequelizeData=new sequelize("group_chat_app","root","Raghav@123",{
    host:"localhost",
    dialect:"mysql"
});


(
    async()=>{
        try{
           await sequelizeData.authenticate();
           console.log("Database Connected Successfully")
        }
        catch(error){
             console.log({error:error.message})
        }
    }
)();

module.exports=sequelizeData
