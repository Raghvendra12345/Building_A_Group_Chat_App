const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");
const messages = document.getElementById("messages");

// Scroll to the latest message when page loads

messages.scrollTop = messages.scrollHeight;

const token=localStorage.getItem("token")

const socket=io("http://localhost:4700",{
  auth:{token}
})

socket.on("connect",()=>{
  console.log("User Connected to server ",socket.id)
})

// Send message

// messageForm.addEventListener("submit", async function (event) {

async function sendMessages(event) {
  event.preventDefault();

  const messageText = messageInput.value.trim();

  // Don't send empty message

  if (!messageText) {
    return;
  }

  socket.emit("sendMessage",{message:messageText})

    messageInput.value = "";

}

socket.on("receiveMessage",(data)=>{
      console.log("Received Message : ",data)


       const message = document.createElement("div");

    message.classList.add("message", "sent");

    // Get current time

    const currentTime =new Date(data.createdAt)

    const time = currentTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Create message content

    message.innerHTML = `
        <div class="message-content">
            <p>${data.message}</p>
            <span class="timestamp">${time}</span>
        </div>
    `;

    // Add message to chat

    messages.appendChild(message);
    })

  



      //  const response=await fetch("http://localhost:4700/chat/messages",{
      //   "method":"POST",
      //   headers:{
      //       "Content-Type":"application/json",
      //       "Authorization":`Bearer ${token}`
      //   },
      //   body:JSON.stringify({message:messageText})
        
      //  })

      //  const data=await response.json()

      //  if(!response.ok) throw new Error(data.error || data.message)

messageForm.addEventListener('submit',sendMessages)

async function load() {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch("http://localhost:4700/chat/allmessages", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || data.message);
    }
    console.log("Messages", data.data);
     
    data.data.forEach((item)=>{
        const message=document.createElement('div')

        message.classList.add("message","sent")

        const currentTime=new Date(item.createdAt)

        const time=currentTime.toLocaleTimeString([],{
               hour:"2-digit",
               minute:"2-digit"
        });

         message.innerHTML = `
        <div class="message-content">
            <p>${item.message}</p>
            <span class="timestamp">${time}</span>
        </div>
    `;

      messages.appendChild(message)
    })
    messages.scrollTop=messages.scrollHeight;

  } catch (err) {
    console.log("Error Loading Message", err.message);
  }
}
load();
