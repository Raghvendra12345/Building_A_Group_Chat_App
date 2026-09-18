

module.exports=(socket,io)=>{
       

    console.log("User Connected ",socket.id)


    socket.on("sendMessage",(data)=>{
        console.log("User ",socket.user.username,"said: ",data)

        io.emit("receiveMessage",data)
    })

    socket.on("disconnect",()=>{
        console.log("User Disconnected ",socket.id)
    });
}