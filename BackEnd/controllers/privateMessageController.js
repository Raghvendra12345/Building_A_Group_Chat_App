const privateMessage = require("../models/personalChat");
const { user } = require("../models/index");
const { Op ,fn,col} = require("sequelize");

const { HeadObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("../config/s3");


const sendPrivateMessage = async (req, res) => {
  try {
    const { receiverId, message, messageType, mediaKey } = req.body;

    const type = messageType || "text";
    const text = typeof message === "string" ? message.trim() : "";

    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: "Receiver is required",
      });
    }

    if (type === "text" && !text) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    if (!["text", "image", "video", "file"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid message type",
      });
    }

    if (type !== "text" && !mediaKey) {
      return res.status(400).json({
        success: false,
        message: "Media key is required for media messages",
      });
    }


if (type !== "text") {
  // The key must belong to the logged-in sender.
  const expectedPrefix = `chat-media/${req.user.userId}/`;

  if (
    typeof mediaKey !== "string" ||
    !mediaKey.startsWith(expectedPrefix) ||
    mediaKey.length <= expectedPrefix.length
  ) {
    return res.status(403).json({
      success: false,
      message: "Invalid media key or unauthorized upload",
    });
  }

  // Verify that the uploaded object exists in S3.
  try {
    await s3.send(
      new HeadObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: mediaKey,
      })
    );
  } catch (error) {
    console.error("Media validation error:", error.name);

    return res.status(400).json({
      success: false,
      message: "Uploaded media was not found or could not be verified",
    });
  }
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

    // For media messages, message is an empty string.
    // The mediaKey is the S3 object key.
    const savedMessage = await privateMessage.create({
      message: text,
      senderId: req.user.userId,
      receiverId: receiver.id,
      messageType: type,
      mediaKey: type === "text" ? null : mediaKey,
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

    const io = req.app.get("io");

    if (io) {
      io.to(`user:${receiver.id}`).emit("privateMessage", messageData);
    }

    return res.status(201).json({
      success: true,
      data: messageData,
    });
  } catch (error) {
    console.error("Send private message error:", error.message);

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




const getConversations = async (req, res) => {
  try {
    const currentUserId = Number(req.user.userId);

    // Get all messages involving the current user.
    const messages = await privateMessage.findAll({
      where: {
        [Op.or]: [
          { senderId: currentUserId },
          { receiverId: currentUserId },
        ],
      },
      order: [["createdAt", "DESC"]],
    });

    // Find the latest message for every conversation.
    const latestMessages = new Map();

    for (const item of messages) {
      const otherUserId =
        Number(item.senderId) === currentUserId
          ? Number(item.receiverId)
          : Number(item.senderId);

      if (!latestMessages.has(otherUserId)) {
        latestMessages.set(otherUserId, item);
      }
    }

    const otherUserIds = [...latestMessages.keys()];

    const users = otherUserIds.length
      ? await user.findAll({
          where: {
            id: { [Op.in]: otherUserIds },
          },
          attributes: ["id", "username"],
        })
      : [];

    const usersById = new Map(
      users.map((person) => [Number(person.id), person])
    );

    // Count unread messages in one grouped query.
    const unreadRows = await privateMessage.findAll({
      attributes: [
        "senderId",
        [fn("COUNT", col("id")), "unreadCount"],
      ],
      where: {
        receiverId: currentUserId,
        isRead: false,
      },
      group: ["senderId"],
      raw: true,
    });

    const unreadBySender = new Map(
      unreadRows.map((row) => [
        Number(row.senderId),
        Number(row.unreadCount),
      ])
    );

    const conversations = [];

    for (const [otherUserId, item] of latestMessages) {
      const person = usersById.get(otherUserId);

      if (!person) continue;

      conversations.push({
        userId: person.id,
        username: person.username,
        lastMessage: item.message,
        lastMessageTime: item.createdAt,
        lastMessageSenderId: item.senderId,
        unreadCount: unreadBySender.get(otherUserId) || 0,
      });
    }

    return res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    console.error("Get conversations error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load conversations",
    });
  }
};

const markPrivateMessagesAsRead = async (req, res) => {
  try {
    const currentUserId = Number(req.user.userId);
    const senderId = Number(req.body.senderId);

    if (!Number.isInteger(senderId) || senderId <= 0) {
      return res.status(400).json({
        success: false,
        message: "A valid senderId is required",
      });
    }

    if (senderId === currentUserId) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation",
      });
    }

    const [updatedCount] = await privateMessage.update(
      { isRead: true },
      {
        where: {
          senderId: senderId,
          receiverId: currentUserId,
          isRead: false,
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: "Messages marked as read",
      updatedCount,
    });
  } catch (error) {
    console.error("Mark messages as read error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to mark messages as read",
    });
  }
};
module.exports = {
  sendPrivateMessage,
  getPrivateMessages,
  getConversations,
  markPrivateMessagesAsRead,
};
