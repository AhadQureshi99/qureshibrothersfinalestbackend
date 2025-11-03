const express = require("express");
const router = express.Router();
const verifyJWT = require("../middelwares/authMiddleware");
const ctrl = require("../Controllers/testTypeController");

// Test Type routes
router.post("/", verifyJWT, ctrl.createTestType);
router.get("/", verifyJWT, ctrl.listTestTypes);
router.put("/:id", verifyJWT, ctrl.updateTestType);
router.delete("/:id", verifyJWT, ctrl.deleteTestType);
router.patch("/:id/toggle-status", verifyJWT, ctrl.toggleTestTypeStatus);

module.exports = router;
