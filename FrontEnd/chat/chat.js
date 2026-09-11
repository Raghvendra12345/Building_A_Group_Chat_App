const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");
const messages = document.getElementById("messages");


// Scroll to the latest message when page loads

messages.scrollTop = messages.scrollHeight;


// Send message

messageForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const messageText = messageInput.value.trim();

    // Don't send empty message

    if (!messageText) {
        return;
    }


    // Create message container

    const message = document.createElement("div");

    message.classList.add("message", "sent");


    // Get current time

    const currentTime = new Date();

    const time = currentTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });


    // Create message content

    message.innerHTML = `
        <div class="message-content">
            <p>${messageText}</p>
            <span class="timestamp">${time}</span>
        </div>
    `;


    // Add message to chat

    messages.appendChild(message);


    // Clear input

    messageInput.value = "";


    // Automatically scroll to latest message

    messages.scrollTop = messages.scrollHeight;

});