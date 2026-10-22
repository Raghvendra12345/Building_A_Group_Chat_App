
const { randomUUID } = require("crypto");
const path = require("path");

const {
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");

const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const privateMessage = require("../models/personalChat");

const s3 = require("../config/s3");

const uploadMedia = async (req, res) => {
  try {
    // Check whether a file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select a file to upload",
      });
    }

    // Allow only these file types
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "video/mp4",
      "application/pdf",
    ];

    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: "This file type is not allowed",
      });
    }

    // Generate a unique S3 object key
    const extension = path.extname(req.file.originalname);
    // const key = `chat-media/${randomUUID()}${extension}`;
    const key = `chat-media/${req.user.userId}/${randomUUID()}${extension}`;

    // Upload the file to S3
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    });

    await s3.send(command);

    // Return upload details to the frontendÍ
    const fileUrl =
      `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return res.status(201).json({
      success: true,
      message: "File uploaded successfully",
      media: {
        key,
        fileUrl,
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
      },
    });
  } catch (error) {
    console.error("S3 media upload error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to upload file",
    });
  }
};


const getMediaUrl = async (req, res) => {
  try {
    const messageId = Number(req.params.messageId);
    const currentUserId = Number(req.user.userId);

    if (!Number.isInteger(messageId) || messageId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid message ID",
      });
    }

    // Find the media message in the database
    const message = await privateMessage.findByPk(messageId);

    if (!message || !message.mediaKey) {
      return res.status(404).json({
        success: false,
        message: "Media message not found",
      });
    }

    // Only the sender or receiver can view this media
    if (
      Number(message.senderId) !== currentUserId &&
      Number(message.receiverId) !== currentUserId
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this media",
      });
    }

    // Generate a temporary URL using the key stored in the database
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: message.mediaKey,
    });

    const url = await getSignedUrl(s3, command, {
      expiresIn: 300,
    });

    return res.status(200).json({
      success: true,
      url,
      expiresIn: 300,
    });
  } catch (error) {
    console.error("Get media URL error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to generate media URL",
    });
  }
};


module.exports = { uploadMedia ,getMediaUrl};
