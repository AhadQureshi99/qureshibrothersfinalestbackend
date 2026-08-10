const express = require("express");
const router = express.Router();
const verifyJWT = require("../middelwares/authMiddleware");
const ctrl = require("../Controllers/testCenterController");

// Test Center routes
router.post("/", verifyJWT, ctrl.createTestCenter);
router.get("/", verifyJWT, ctrl.listTestCenters);
router.put("/:id", verifyJWT, ctrl.updateTestCenter);
router.delete("/:id", verifyJWT, ctrl.deleteTestCenter);
router.patch("/:id/toggle-status", verifyJWT, ctrl.toggleTestCenterStatus);

module.exports = router;
