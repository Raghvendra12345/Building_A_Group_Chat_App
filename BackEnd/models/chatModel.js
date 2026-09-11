

const sequelize=require("../utils/db")

const {DataTypes,Sequelize}=require("sequelize")

const chatMessage=sequelize.define('chatMessage',{
    id:{
        type:DataTypes.INTEGER,
        allowNull:false,
        autoIncrement:true,
        primaryKey:true
    },
    message:{
         type:DataTypes.TEXT,
         allowNull:false
    },
    userId:{
       type:DataTypes.INTEGER,
       allowNull:false
    }
})

module.exports=chatMessage