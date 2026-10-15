

const chat=require("./chatModel")
const user=require("./userModel")


user.hasMany(chat,{
    foreignKey:"userId"
})

chat.belongsTo(user,{
    foreignKey:"userId"
})


module.exports={user,chat}