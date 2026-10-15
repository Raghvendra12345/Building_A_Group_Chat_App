const token = localStorage.getItem("token");

const currentUserId = Number(JSON.parse(atob(token.split(".")[1])).userId);

const socket = io("http://localhost:4700", {
  auth: {
    token: token,
  },
});

socket.on("connect", () => {
  console.log("Connected with id: ", socket.id);

  // socket.emit('sendMessage','Hello Server!')
});

socket.on("receiveMessage", (msg) => {
  console.log("Received Message:", msg);
  displayMessage(msg, false);
});

socket.on("connect_error", (err) => {
  console.error("Socket connection failed:", err.message);
});

socket.on("disconnect", (reason) => {
  console.log("Disconnected:", reason);
});

const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");
const messages = document.getElementById("messages");

const emailInput = document.getElementById("emailInput");
const joinRoom = document.getElementById("joinRoomButton");

const searchForm = document.getElementById("searchForm");

// Scroll to the latest message when page loads

messages.scrollTop = messages.scrollHeight;

// Send message

async function sendMessages(event) {
  event.preventDefault();

  const messageText = messageInput.value.trim();

  // Don't send empty message

  if (!messageText) {
    return;
  }

  try {
    const token = localStorage.getItem("token");

    const response = await fetch("http://localhost:4700/chat/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        message: messageText,
      }),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || "Failed to fetch message");
    }
    console.log("Message Saved successfully ", data.data);
    displayMessage(data.data, true);

    // Broadcast the saved message through Socket.IO
    socket.emit("sendMessage", data.data);

    messageInput.value = "";
    // Keep the latest message visible.
    messages.scrollTop = messages.scrollHeight;
  } catch (err) {
    console.error("Error sending message:", err.message);
    alert(err.message);
  }
}

function displayMessage(dataItem, isSent = true) {
  console.log("Message data:", dataItem);

  console.log("Associated user:", dataItem.user);
  const username = dataItem.user?.username || "Unknown";
  const message = document.createElement("div");
  message.classList.add("message", isSent ? "sent" : "received");

  const messageContent = document.createElement("div");
  messageContent.classList.add("message-content");

  const messageText = document.createElement("p");

  messageText.textContent = `${username}: ${dataItem.message}`;

  const timestamp = document.createElement("span");
  timestamp.classList.add("timestamp");

  const currentTime = new Date(dataItem.createdAt || Date.now());

  timestamp.textContent = currentTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  messageContent.appendChild(messageText);
  messageContent.appendChild(timestamp);
  message.appendChild(messageContent);

  messages.appendChild(message);
  messages.scrollTop = messages.scrollHeight;
}

messageForm.addEventListener("submit", sendMessages);
searchForm.addEventListener("submit", search);

async function load() {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch("http://localhost:4700/chat/allmessages", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || data.message);
    }
    console.log("Messages", data.data);

    messages.replaceChildren();

    data.data.forEach((item) => {
      const isSent = Number(item.userId) === currentUserId;
      displayMessage(item, isSent);
    });
    messages.scrollTop = messages.scrollHeight;
  } catch (err) {
    console.log("Error Loading Message", err.message);
  }
}
load();

function logout() {
  const confirmLogout = confirm("Are you sure you want to logout?");

  if (!confirmLogout) {
    return;
  }

  // Remove login information
  localStorage.removeItem("token");
  localStorage.removeItem("email");

  // Go back to login page
  window.location.href = "../Login/login.html";
}

// async function search(event){
//     event.preventDefault()
//      const myEmail=localStorage.getItem("email")

//      if(!myEmail){
//        alert("user email not found")
//        return;
//      }

//      const email=event.target.search.value.trim().toLowerCase()

//      socket.emit("join-room",email)

//      alert("Room we Joined ",email)
// }

const privateChatSection = document.getElementById("privateChatSection");
const privateChatTitle = document.getElementById("privateChatTitle");
const privateMessages = document.getElementById("privateMessages");

const privateMessageForm = document.getElementById("privateMessageForm");

const privateMessageInput = document.getElementById("privateMessageInput");

let selectedUserId = null;

socket.on("privateMessage", (item) => {
  console.log("Incoming private message:", item);

  // Display only when the conversation with the sender is open.
   const isCorrectConversation=
    Number(selectedUserId) === Number(item.senderId) &&
    Number(item.receiverId) === currentUserId

    console.log("Is correct conversation:", isCorrectConversation);
   if (isCorrectConversation) {
        displayPrivateMessage(item);
    }
  else {
    console.log("Message received, but this conversation is not open.");
  }
});

async function search(event) {
  event.preventDefault();

  const email = emailInput.value.trim().toLowerCase();

  if (!email) {
    alert("Please enter an email address");
    return;
  }

  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `http://localhost:4700/chat/search?email=${encodeURIComponent(email)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "User search failed");
    }

    // console.log("User found:", data.data);

    // alert(`User found: ${data.data.username}`);

    const selectedUser = data.data;
    selectedUserId = selectedUser.id;

    privateChatSection.style.display = "flex";
    messages.style.display = "none";
    messageForm.style.display = "none";

    privateChatTitle.textContent = `Private Chat with ${selectedUser.username}`;

    // privateMessages.replaceChildren();

    // Load the existing conversation
    await loadPrivateMessages(selectedUserId);

    console.log("Private chat opened with:", selectedUser);
  } catch (error) {
    console.error("Search error:", error.message);
    alert(error.message);
  }
}
privateMessageForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const message = privateMessageInput.value.trim();

  if (!message) return;

  if (!selectedUserId) {
    alert("Please select a user first");
    return;
  }

  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      "http://localhost:4700/chat/private-messages",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiverId: selectedUserId,
          message: message,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to send private message");
    }

    const item = data.data;

    displayPrivateMessage(item);

    privateMessageInput.value = "";
    privateMessages.scrollTop = privateMessages.scrollHeight;

    console.log("Private message saved:", item);
  } catch (error) {
    console.error("Private message error:", error.message);
    alert(error.message);
  }
});

async function loadPrivateMessages(otherUserId) {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `http://localhost:4700/chat/private-messages?userId=${otherUserId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load messages");
    }

    privateMessages.replaceChildren();

    data.data.forEach((item) => {
      displayPrivateMessage(item);
    });

    privateMessages.scrollTop = privateMessages.scrollHeight;
  } catch (error) {
    console.error("Loading private messages failed:", error.message);
  }
}

function displayPrivateMessage(item) {
  const isSent = Number(item.senderId) === currentUserId;

  const message = document.createElement("div");
  message.classList.add(
    "private-message",
    isSent ? "private-sent" : "private-received",
  );

  const bubble = document.createElement("div");
  bubble.classList.add("private-message-bubble");

  const messageText = document.createElement("p");
  messageText.textContent = item.message;

  const timestamp = document.createElement("span");
  timestamp.classList.add("private-timestamp");
  timestamp.textContent = new Date(
    item.createdAt || Date.now(),
  ).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  bubble.append(messageText, timestamp);
  message.appendChild(bubble);
  privateMessages.appendChild(message);

  privateMessages.scrollTop = privateMessages.scrollHeight;
}
