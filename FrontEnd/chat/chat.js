


// const socket=io("http://localhost:4700",{
//   auth:{token}
// })



// socket.on("connect_error",(error)=>{
//   console.log("Connection ERROR ",error.message)
// })



  

  // if(!window.roomName){
  //   alert("Please join a chat  first")
  //   return
  // }

  // socket.emit("new-message",{
  //   message:messageText,
  //   roomName:window.roomName
  // })



// socket.on("new-message",(data)=>{
    //   console.log("Received Message : ",data)
       
    //   const myUsername = localStorage.getItem("username");

    //    const message = document.createElement("div");

    // message.classList.add("message", "sent");

    // if (data.username === myUsername) {
    //     message.classList.add("message", "sent");
    // } else {
    //     message.classList.add("message", "received");
    // }

    // Get current time

    // const currentTime =new Date(data.createdAt)
    // const currentTime =new Date()

    // const time = currentTime.toLocaleTimeString([], {
    //   hour: "2-digit",
    //   minute: "2-digit",
    // });

    // Create message content

    // message.innerHTML = `
    //     <div class="message-content">
    //         <p>${data.message}</p>
    //         <span class="timestamp">${time}</span>
    //     </div>
    // `;

    // Add message to chat

    // messages.appendChild(message);
    // })

  



// async function search(event){
//   event.preventDefault()

//   const storedEmail=localStorage.getItem("email")

//   if(!storedEmail){
//     alert("User email not found ")
//     return;
//   }

//   const myEmail=storedEmail.trim().toLowerCase();
//   const email=event.target.search.value.trim().toLowerCase();

//   if(!email){
//     alert("Please enter an email")
//     return;
//   }

  // const roomName=[myEmail,email].sort().join(" - ")

  // socket.emit("join-room",roomName)

  // window.roomName=roomName

  // alert("Room we Join "+roomName)
// }




    

    // Clear current room
    // window.roomName = null;

    // Disconnect socket
    // if (socket && socket.connected) {
    //     socket.disconnect();
    // }
