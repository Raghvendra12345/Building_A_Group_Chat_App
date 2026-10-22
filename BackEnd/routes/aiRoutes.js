
const express = require("express");
const router = express.Router();

const userAuthentication = require("../middleware/auth");

const {
    predictMessage,
    generateSmartReplies
} = require("../controllers/aiController");

router.post(
    "/predict",
    userAuthentication,
    predictMessage
);

router.post(
    "/smart-replies",
    userAuthentication,
    generateSmartReplies
);

module.exports = router;
