const express = require("express");
const { getRecentLogs } = require("../Controllers/activityLogController");
const verifyJWT = require("../middelwares/authMiddleware");

const router = express.Router();

// Get recent activity logs
router.get("/recent", verifyJWT, getRecentLogs);

module.exports = router;
