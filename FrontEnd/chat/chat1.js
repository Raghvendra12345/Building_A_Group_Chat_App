const token = localStorage.getItem("token");

const currentUserId = Number(JSON.parse(atob(token.split(".")[1])).userId);

let selectedUserId = null;

const onlineUsers = new Map();

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

const groupTypingIndicator = document.getElementById("groupTypingIndicator");

const groupTypers = new Map();
let groupTypingTimer = null;

messageInput.addEventListener("input", () => {
  socket.emit("groupTyping", {
    isTyping: true,
  });

  clearTimeout(groupTypingTimer);

  groupTypingTimer = setTimeout(() => {
    socket.emit("groupTyping", {
      isTyping: false,
    });
  }, 1000);

  requestPredictiveSuggestions(messageInput, groupAiSuggestions, false);
});

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
    clearSuggestions(groupAiSuggestions);
    clearTimeout(groupAiTimer);
    groupAiRequestId++;
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


const conversationsList = document.getElementById("conversationsList");

let conversations = [];
let selectedUsername = "";
const privateChatSection = document.getElementById("privateChatSection");
const privateChatTitle = document.getElementById("privateChatTitle");
const privateMessages = document.getElementById("privateMessages");

const backToGroupButton = document.getElementById("backToGroupButton");

console.log("Back button found:", backToGroupButton);

backToGroupButton.addEventListener("click", () => {
  console.log("Back button clicked!");

  privateChatSection.style.display = "none";
  messages.style.display = "block";
  messageForm.style.display = "flex";
});

const privateMessageForm = document.getElementById("privateMessageForm");

const privateMessageInput = document.getElementById("privateMessageInput");

const groupAiSuggestions = document.getElementById("groupAiSuggestions");
const privateAiSuggestions = document.getElementById("privateAiSuggestions");
const smartRepliesContainer = document.getElementById("smartReplies");

let groupAiTimer = null;
let privateAiTimer = null;

let groupAiRequestId = 0;
let privateAiRequestId = 0;
let smartReplyRequestId = 0;

function clearSuggestions(container) {
  container.replaceChildren();
  container.classList.remove("visible");
}

function addSuggestionButtons(container, suggestions, input) {
  container.replaceChildren();

  if (!suggestions.length) {
    container.classList.remove("visible");
    return;
  }

  const label = document.createElement("span");
  label.className = "ai-suggestion-label";
  label.textContent = "AI suggestions";
  container.appendChild(label);

  suggestions.forEach((suggestion) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "ai-suggestion-button";
    button.textContent = suggestion;

    button.addEventListener("click", () => {
      const currentText = input.value.trimEnd();

      // Gemini returns continuations, so append them to the draft.
      input.value = currentText ? `${currentText} ${suggestion}` : suggestion;

      input.focus();
      clearSuggestions(container);
    });

    container.appendChild(button);
  });

  container.classList.add("visible");
}

async function fetchPredictiveSuggestions(text, container, input, requestId) {
  try {
    const response = await fetch("http://localhost:4700/ai/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        text,
        tone: "casual",
      }),
    });

    const result = await response.json();

    // Ignore an older response if the user has typed more since.
    if (requestId() !== true) return;

    if (!response.ok) {
      throw new Error(result.message || "Suggestion request failed");
    }

    addSuggestionButtons(container, result.suggestions || [], input);
  } catch (error) {
    console.error("Predictive suggestions error:", error.message);
    clearSuggestions(container);
  }
}

function requestPredictiveSuggestions(input, container, isPrivate) {
  const text = input.value.trim();

  if (isPrivate) {
    clearTimeout(privateAiTimer);
  } else {
    clearTimeout(groupAiTimer);
  }

  const requestNumber = isPrivate ? ++privateAiRequestId : ++groupAiRequestId;

  clearSuggestions(container);

  // Avoid calling Gemini for very short drafts.
  if (text.length < 3) return;

  const isLatestRequest = () =>
    isPrivate
      ? requestNumber === privateAiRequestId
      : requestNumber === groupAiRequestId;

  const timer = setTimeout(() => {
    fetchPredictiveSuggestions(text, container, input, isLatestRequest);
  }, 700);

  if (isPrivate) {
    privateAiTimer = timer;
  } else {
    groupAiTimer = timer;
  }
}

async function fetchSmartReplies(incomingMessage) {
  const requestNumber = ++smartReplyRequestId;

  clearSuggestions(smartRepliesContainer);

  try {
    const response = await fetch("http://localhost:4700/ai/smart-replies", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        message: incomingMessage,
        tone: "casual",
      }),
    });

    const result = await response.json();

    // Don't show replies for an older message or a closed conversation.
    if (
      requestNumber !== smartReplyRequestId ||
      !privateChatSection.contains(smartRepliesContainer) ||
      privateChatSection.style.display === "none"
    ) {
      return;
    }

    if (!response.ok) {
      throw new Error(result.message || "Smart replies failed");
    }

    if (!Array.isArray(result.replies)) return;

    smartRepliesContainer.replaceChildren();

    const label = document.createElement("span");
    label.className = "ai-suggestion-label";
    label.textContent = "Suggested replies";
    smartRepliesContainer.appendChild(label);

    result.replies.forEach((reply) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "smart-reply-button";
      button.textContent = reply;

      button.addEventListener("click", () => {
        privateMessageInput.value = reply;
        privateMessageInput.focus();
        clearSuggestions(smartRepliesContainer);
      });

      smartRepliesContainer.appendChild(button);
    });

    smartRepliesContainer.classList.add("visible");
  } catch (error) {
    console.error("Smart replies error:", error.message);
    clearSuggestions(smartRepliesContainer);
  }
}

const privateMediaInput = document.getElementById("privateMediaInput");
const sendMediaButton = document.getElementById("sendMediaButton");

const typingIndicator = document.getElementById("typingIndicator");

let typingTimer = null;

privateMessageInput.addEventListener("input", () => {
  if (!selectedUserId) return;

  // Notify the other user that typing has started.
  socket.emit("privateTyping", {
    receiverId: selectedUserId,
    isTyping: true,
  });

  // Stop the indicator after 1 second without typing.
  clearTimeout(typingTimer);

  typingTimer = setTimeout(() => {
    socket.emit("privateTyping", {
      receiverId: selectedUserId,
      isTyping: false,
    });
  }, 1000);

  requestPredictiveSuggestions(privateMessageInput, privateAiSuggestions, true);
});

// sendMediaButton.addEventListener("click", async () => {
//   if (!selectedUserId) {
//     alert("Please select a private conversation first");
//     return;
//   }

//   const file = privateMediaInput.files[0];

//   if (!file) {
//     alert("Please select an image, video, or PDF first");
//     return;
//   }

//   if (file.size > 10 * 1024 * 1024) {
//     alert("File size must not exceed 10 MB");
//     return;
//   }

//   let messageType;

//   if (file.type.startsWith("image/")) {
//     messageType = "image";
//   } else if (file.type === "video/mp4") {
//     messageType = "video";
//   } else if (file.type === "application/pdf") {
//     messageType = "file";
//   } else {
//     alert("This file type is not supported");
//     return;
//   }

//   sendMediaButton.disabled = true;

//   try {
//     const token = localStorage.getItem("token");

//     // Step 1: Upload the file to S3 through the backend.
//     const formData = new FormData();
//     formData.append("media", file);

//     const uploadResponse = await fetch(
//       "http://localhost:4700/media/upload",
//       {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//         body: formData,
//       }
//     );

//     const uploadResult = await uploadResponse.json();

//     if (!uploadResponse.ok) {
//       throw new Error(uploadResult.message || "Media upload failed");
//     }

//     // Step 2: Save the uploaded media as a private chat message.
//     const messageResponse = await fetch(
//       "http://localhost:4700/chat/private-messages",
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           receiverId: selectedUserId,
//           message: "",
//           messageType,
//           mediaKey: uploadResult.media.key,
//         }),
//       }
//     );

//     const messageResult = await messageResponse.json();

//     if (!messageResponse.ok) {
//       throw new Error(messageResult.message || "Failed to send media message");
//     }

//     // Show the saved message and refresh the conversation list.
//     await displayPrivateMessage(messageResult.data);
//     privateMediaInput.value = "";
//     await loadConversations();

//     console.log("Media message saved:", messageResult.data);
//   } catch (error) {
//     console.error("Media sending error:", error.message);
//     alert(error.message);
//   } finally {
//     sendMediaButton.disabled = false;
//   }
// });

socket.on("onlineUsers", (userIds) => {
  onlineUsers.clear();

  userIds.forEach((id) => {
    onlineUsers.set(Number(id), true);
  });

  renderConversations();
});

socket.on("userStatus", (data) => {
  const userId = Number(data.userId);

  if (data.isOnline) {
    onlineUsers.set(userId, true);
  } else {
    onlineUsers.delete(userId);
  }

  renderConversations();
});

socket.on("groupTyping", (data) => {
  // Ignore our own typing events.
  if (Number(data.userId) === currentUserId) {
    return;
  }

  const userId = Number(data.userId);

  if (data.isTyping) {
    groupTypers.set(userId, data.username);
  } else {
    groupTypers.delete(userId);
  }

  const usernames = [...groupTypers.values()];

  if (usernames.length === 0) {
    groupTypingIndicator.textContent = "";
  } else if (usernames.length === 1) {
    groupTypingIndicator.textContent = `${usernames[0]} is typing...`;
  } else if (usernames.length === 2) {
    groupTypingIndicator.textContent = `${usernames[0]} and ${usernames[1]} are typing...`;
  } else {
    groupTypingIndicator.textContent = `${usernames[0]}, ${usernames[1]} and ${
      usernames.length - 2
    } others are typing...`;
  }
});

socket.on("privateTyping", (data) => {
  // Only show typing when this sender's conversation is open.
  if (Number(data.senderId) !== Number(selectedUserId)) {
    return;
  }

  typingIndicator.textContent = data.isTyping ? "Typing..." : "";
});



socket.on("privateMessage", async (item) => {
  console.log("Incoming private message:", item);

  const senderId = Number(item.senderId);
  const receiverId = Number(item.receiverId);
  const selectedId = Number(selectedUserId);
  const loggedInUserId = Number(currentUserId);

  const isCorrectConversation =
    selectedUserId !== null &&
    selectedUserId !== undefined &&
    (
      (senderId === loggedInUserId && receiverId === selectedId) ||
      (senderId === selectedId && receiverId === loggedInUserId)
    );

  if (isCorrectConversation) {
    // Display the message in the currently open private chat.
    await displayPrivateMessage(item);

    // If the message is incoming, mark it as read immediately.
    if (senderId !== loggedInUserId) {
      try {
        const response = await fetch(
          "http://localhost:4700/chat/private-messages/read",
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              senderId: senderId,
            }),
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || "Failed to mark messages as read"
          );
        }

        console.log(
          "Incoming messages marked as read:",
          result.updatedCount
        );
      } catch (error) {
        console.error("Mark incoming messages as read error:", error.message);
      }
    }

    // Generate smart replies only for incoming text messages.
    if (
      senderId !== loggedInUserId &&
      (item.messageType || "text") === "text" &&
      item.message
    ) {
      fetchSmartReplies(item.message);
    }
  }

  // Refresh only after the read request has completed.
  await loadConversations();
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

    // const selectedUser = data.data;
    // selectedUserId = selectedUser.id;

    // privateChatSection.style.display = "flex";
    // messages.style.display = "none";
    // messageForm.style.display = "none";

    // privateChatTitle.textContent = `Private Chat with ${selectedUser.username}`;

    // // privateMessages.replaceChildren();

    // // Load the existing conversation
    // await loadPrivateMessages(selectedUserId);

    // console.log("Private chat opened with:", selectedUser);

    // Use the same function that opens conversations from the list.
    await openPrivateChat(data.data);
  } catch (error) {
    console.error("Search error:", error.message);
    alert(error.message);
  }
}


privateMessageForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!selectedUserId) {
    alert("Please select a private conversation first");
    return;
  }

  const message = privateMessageInput.value.trim();
  const file = privateMediaInput.files[0];

  // Nothing to send
  if (!message && !file) {
    return;
  }

  let messageType = "text";

  // Validate the selected file, if any
  if (file) {
    if (file.size > 10 * 1024 * 1024) {
      alert("File size must not exceed 10 MB");
      return;
    }

    if (file.type.startsWith("image/")) {
      messageType = "image";
    } else if (file.type === "video/mp4") {
      messageType = "video";
    } else if (file.type === "application/pdf") {
      messageType = "file";
    } else {
      alert("This file type is not supported");
      return;
    }
  }

  // Disable the one Send button while processing
  const sendButton = privateMessageForm.querySelector('button[type="submit"]');

  if (sendButton) {
    sendButton.disabled = true;
  }

  try {
    const token = localStorage.getItem("token");
    let mediaKey = null;

    // Step 1: If a file is selected, upload it to S3
    if (file) {
      const formData = new FormData();
      formData.append("media", file);

      const uploadResponse = await fetch("http://localhost:4700/media/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const uploadResult = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploadResult.message || "Media upload failed");
      }

      mediaKey = uploadResult.media.key;
    }

    // Step 2: Save either a text message or a media message
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
          messageType: messageType,
          mediaKey: mediaKey,
        }),
      },
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to send message");
    }

    // Step 3: Display the saved message
    await displayPrivateMessage(result.data);

    // Step 4: Clear both fields
    privateMessageInput.value = "";
    privateMediaInput.value = "";
    // Step 5.6.B: Clear AI suggestions and cancel pending responses
    clearSuggestions(privateAiSuggestions);
    clearSuggestions(smartRepliesContainer);

    clearTimeout(privateAiTimer);
    privateAiRequestId++;
    smartReplyRequestId++;

    privateMessages.scrollTop = privateMessages.scrollHeight;

    // Step 5: Refresh the conversation list
    await loadConversations();

    console.log("Message sent successfully:", result.data);
  } catch (error) {
    console.error("Message sending error:", error.message);
    alert(error.message);
  } finally {
    if (sendButton) {
      sendButton.disabled = false;
    }
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
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load messages");
    }

    privateMessages.replaceChildren();

    // Ensure messages are displayed from oldest to newest.
    const messages = [...data.data].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );

    // Wait for each message to finish rendering before displaying the next.
    for (const item of messages) {
      await displayPrivateMessage(item);
    }

    privateMessages.scrollTop = privateMessages.scrollHeight;
  } catch (error) {
    console.error("Loading private messages failed:", error.message);
  }
}



async function displayPrivateMessage(item) {
  const isSent = Number(item.senderId) === currentUserId;
  const messageType = item.messageType || "text";

  const message = document.createElement("div");
  message.classList.add(
    "private-message",
    isSent ? "private-sent" : "private-received",
  );

  const bubble = document.createElement("div");
  bubble.classList.add("private-message-bubble");

  // Display ordinary text messages as before.
  if (messageType === "text") {
    const messageText = document.createElement("p");
    messageText.textContent = item.message;
    bubble.appendChild(messageText);
  } else {
    // Request a temporary viewing URL for this saved media message.
    const mediaPlaceholder = document.createElement("p");
    mediaPlaceholder.textContent = "Loading media...";
    bubble.appendChild(mediaPlaceholder);

    try {
      const response = await fetch(
        `http://localhost:4700/media/${item.id}/url`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to load media");
      }

      if (messageType === "image") {
        const image = document.createElement("img");
        image.src = result.url;
        image.alt = "Shared image";
        image.style.maxWidth = "100%";
        image.style.maxHeight = "300px";
        image.style.objectFit = "contain";
        image.style.borderRadius = "8px";
        bubble.replaceChild(image, mediaPlaceholder);
      } else if (messageType === "video") {
        const video = document.createElement("video");
        video.src = result.url;
        video.controls = true;
        video.style.maxWidth = "100%";
        video.style.maxHeight = "300px";
        bubble.replaceChild(video, mediaPlaceholder);
      } else if (messageType === "file") {
        const link = document.createElement("a");
        link.href = result.url;
        link.textContent = "Open shared file";
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        bubble.replaceChild(link, mediaPlaceholder);
      } else {
        mediaPlaceholder.textContent = "Unsupported message type";
      }
    } catch (error) {
      console.error("Media display error:", error.message);
      mediaPlaceholder.textContent = "Unable to load media";
    }
  }

  const timestamp = document.createElement("span");
  timestamp.classList.add("private-timestamp");
  timestamp.textContent = new Date(
    item.createdAt || Date.now(),
  ).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  bubble.appendChild(timestamp);
  message.appendChild(bubble);
  privateMessages.appendChild(message);

  privateMessages.scrollTop = privateMessages.scrollHeight;
}

async function loadConversations() {
  try {
    const response = await fetch("http://localhost:4700/chat/conversations", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to load conversations");
    }

    conversations = result.data;

    renderConversations();
  } catch (error) {
    console.error("Error loading conversations:", error.message);

    conversationsList.textContent = "Unable to load conversations.";
  }
}

function renderConversations() {
  conversationsList.replaceChildren();

  if (conversations.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.textContent = "No private conversations yet.";
    conversationsList.appendChild(emptyMessage);
    return;
  }

  conversations.forEach((conversation) => {
    const button = document.createElement("button");
    button.type = "button";
    button.classList.add("conversation-item");

    if (Number(conversation.userId) === Number(selectedUserId)) {
      button.classList.add("active");
    }

    // Username
    const username = document.createElement("span");
    username.classList.add("conversation-username");
    username.textContent = conversation.username;

    // Online/offline status
    const status = document.createElement("span");
    status.classList.add("user-status");

    if (onlineUsers.has(Number(conversation.userId))) {
      status.textContent = "Online";
      status.classList.add("online");
    } else {
      status.textContent = "Offline";
      status.classList.add("offline");
    }

    // Last message preview
    const preview = document.createElement("span");
    preview.classList.add("conversation-preview");

    const prefix =
      Number(conversation.lastMessageSenderId) === currentUserId ? "You: " : "";

    preview.textContent = prefix + (conversation.lastMessage || "");

    // Last message time
    const time = document.createElement("span");
    time.classList.add("conversation-time");

    time.textContent = conversation.lastMessageTime
      ? new Date(conversation.lastMessageTime).toLocaleString([], {
          dateStyle: "short",
          timeStyle: "short",
        })
      : "";

    // Unread count badge
    const unreadCount = Number(conversation.unreadCount) || 0;
    const unreadBadge = document.createElement("span");
    unreadBadge.classList.add("unread-badge");

    if (unreadCount > 0) {
      unreadBadge.textContent = unreadCount > 99 ? "99+" : unreadCount;
      unreadBadge.style.display = "inline-flex";
    } else {
      unreadBadge.style.display = "none";
    }

    button.append(username, status, preview, time, unreadBadge);

    button.addEventListener("click", () => {
      openPrivateChat({
        id: conversation.userId,
        username: conversation.username,
      });
    });

    conversationsList.appendChild(button);
  });
}

async function openPrivateChat(selectedUser) {
  selectedUserId = Number(selectedUser.id);
  selectedUsername = selectedUser.username;

  clearSuggestions(privateAiSuggestions);
  clearSuggestions(smartRepliesContainer);

  clearTimeout(privateAiTimer);
  privateAiRequestId++;
  smartReplyRequestId++;

  console.log("Private chat opened with:", selectedUser);

  privateChatSection.style.display = "flex";
  messages.style.display = "none";
  messageForm.style.display = "none";

  privateChatTitle.textContent = `Private Chat with ${selectedUsername}`;

  // Mark messages received from this user as read.
  try {
    const response = await fetch(
      "http://localhost:4700/chat/private-messages/read",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          senderId: selectedUserId,
        }),
      },
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to mark messages as read");
    }

    console.log("Messages marked as read:", result.updatedCount);

    // Refresh the conversation list to update unread counts.
    await loadConversations();
  } catch (error) {
    console.error("Mark as read error:", error.message);
  }

  renderConversations();

  await loadPrivateMessages(selectedUserId);
}
loadConversations();
