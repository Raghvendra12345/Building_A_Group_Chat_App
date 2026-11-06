# Real-Time Chat Application

A full-stack real-time messaging application built using **Node.js, Express.js, Socket.IO, Sequelize, and MySQL**. The application enables users to communicate through private and group conversations with real-time message delivery, online/offline status, typing indicators, read receipts, and media sharing using AWS S3.

## 🚀 Features

### 🔐 Authentication & Authorization
- User registration and login.
- JWT-based authentication.
- Secure password hashing.
- Email or phone number-based login.

### 💬 Real-Time Messaging
- One-to-one private messaging.
- Group chat functionality.
- Instant message delivery using Socket.IO.
- Persistent message storage using MySQL.
- Conversation history and latest message retrieval.

### 👥 User Presence & Interaction
- Real-time online/offline status.
- Typing indicators.
- Private user rooms using Socket.IO.
- Unread message counts.
- Message read receipts.

### 📁 Media Sharing
- Image and file upload functionality.
- AWS S3 integration for media storage.
- Secure file upload endpoint.
- 10 MB upload size limit.

### 🤖 AI Integration
- Gemini AI integration for AI-powered chat assistance.
- Graceful handling of API quota errors (HTTP 429).

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| Backend | Node.js, Express.js |
| Real-Time Communication | Socket.IO |
| Database | MySQL |
| ORM | Sequelize |
| Authentication | JWT, bcrypt |
| Cloud Storage | AWS S3 |
| AI Integration | Google Gemini API |
| Frontend | HTML, CSS, JavaScript |
| Development Tools | Git, GitHub, Postman |

## 📂 Project Structure

```text
Chat-Application/
│
├── config/
│   └── s3.js
│
├── controllers/
│   ├── authController.js
│   ├── messageController.js
│   └── groupController.js
│
├── models/
│   ├── User.js
│   ├── PrivateChat.js
│   └── Group.js
│
├── routes/
│   ├── authRoutes.js
│   ├── messageRoutes.js
│   └── groupRoutes.js
│
├── middleware/
│   └── authMiddleware.js
│
├── public/
│
├── sockets/
│
├── .env
├── .gitignore
├── package.json
└── server.js
```


## 🔄 How It Works

1. Users register and authenticate using JWT.
2. Authenticated users establish a Socket.IO connection.
3. Each user joins a private room using their unique user ID.
4. Messages are exchanged in real time between users.
5. Messages are stored in the MySQL database through Sequelize.
6. Socket.IO handles online/offline status and typing indicators.
7. Read receipts and unread counts help users track conversations.
8. AWS S3 stores uploaded media files and provides their file URLs.

## 🔑 Key Backend Concepts Implemented

- RESTful API development.
- JWT authentication and authorization.
- Database relationships using Sequelize.
- Real-time bidirectional communication with Socket.IO.
- Private and group room management.
- Event-driven architecture.
- File uploads using Multer and AWS S3.
- Error handling and API response management.
- Environment-based configuration.

## 🔒 Security

- Password hashing using bcrypt.
- JWT-based protected routes.
- Environment variables for sensitive credentials.
- File upload size restrictions.
- Server-side authentication and validation.

## 👨‍💻 Author

**  Raghvendra Kumar**

- GitHub: https://github.com/Raghvendra12345
- LinkedIn: https://www.linkedin.com/in/raghvendra-kumar-451a38204

---

⭐ If you find this project interesting, feel free to explore the repository and give it a star!
