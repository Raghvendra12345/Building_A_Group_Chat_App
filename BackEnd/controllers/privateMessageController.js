const privateMessage = require("../models/personalChat");
const { user } = require("../models/index");
const { Op } = require("sequelize");

const sendPrivateMessage = async (req, res) => {
  try {
    const { receiverId, message } = req.body;

    if (!receiverId || !message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Receiver and message are required",
      });
    }

    if (Number(receiverId) === Number(req.user.userId)) {
      return res.status(400).json({
        success: false,
        message: "You cannot send a private message to yourself",
      });
    }

    const receiver = await user.findByPk(receiverId);

    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: "Receiver not found",
      });
    }

    const savedMessage = await privateMessage.create({
      message: message.trim(),
      senderId: req.user.userId,
      receiverId: receiver.id,
    });

    const sender = await user.findByPk(req.user.userId, {
      attributes: ["id", "username"],
    });

    const messageData = {
      ...savedMessage.toJSON(),
      sender: {
        id: sender.id,
        username: sender.username,
      },
    };

    // Get the Socket.IO instance
    const io = req.app.get("io");

    // Send the saved message to the recipient's room
    // if (io) {
    //   io.to(`user:${receiver.id}`).emit("privateMessage", messageData);
    // }

    console.log("Socket.IO exists:", !!io);
    console.log("Receiver ID:", receiver.id);
    console.log("Target room:", `user:${receiver.id}`);
    console.log(
      "Sockets in target room:",
      io?.sockets.adapter.rooms.get(`user:${receiver.id}`)?.size ?? 0,
    );

    if (io) {
      io.to(`user:${receiver.id}`).emit("privateMessage", messageData);
      console.log("privateMessage event emitted");
    }

    // return res.status(201).json({
    //   success: true,
    //   data: {
    //     ...savedMessage.toJSON(),
    //     sender: sender,
    //   },
    // });
    return res.status(201).json({
      success: true,
      data: messageData,
    });
  } catch (error) {
    console.log(error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to send private message",
    });
  }
};

const getPrivateMessages = async (req, res) => {
  try {
    const otherUserId = Number(req.query.userId);
    const currentUserId = Number(req.user.userId);

    if (!Number.isInteger(otherUserId) || otherUserId <= 0) {
      return res.status(400).json({
        success: false,
        message: "A valid userId is required",
      });
    }

    if (otherUserId === currentUserId) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation",
      });
    }

    const otherUser = await user.findByPk(otherUserId);

    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const conversation = await privateMessage.findAll({
      where: {
        [Op.or]: [
          {
            senderId: currentUserId,
            receiverId: otherUserId,
          },
          {
            senderId: otherUserId,
            receiverId: currentUserId,
          },
        ],
      },
      order: [["createdAt", "ASC"]],
    });

    return res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.log(error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to load private messages",
    });
  }
};

module.exports = {
  sendPrivateMessage,
  getPrivateMessages,
};
