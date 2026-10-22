

const express = require("express");
const multer = require("multer");

const { uploadMedia ,getMediaUrl} = require("../controllers/mediaController");
const authentication = require("../middleware/auth");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB maximum
    files: 1,
  },
});

router.post(
  "/upload",
  authentication,
  upload.single("media"),
  uploadMedia
);

router.post("/upload", authentication, upload.single("media"), uploadMedia);

router.get("/:messageId/url", authentication, getMediaUrl);

// Handle upload errors
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        success: false,
        message: "File size must not exceed 10 MB",
      });
    }

    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  next(err);
});

module.exports = router;
