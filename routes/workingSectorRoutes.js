const express = require("express");
const router = express.Router();
const verifyJWT = require("../middelwares/authMiddleware");
const ctrl = require("../Controllers/workingSectorController");

// Working Sector routes
router.post("/", verifyJWT, ctrl.createWorkingSector);
router.get("/", verifyJWT, ctrl.listWorkingSectors);
router.put("/:id", verifyJWT, ctrl.updateWorkingSector);
router.delete("/:id", verifyJWT, ctrl.deleteWorkingSector);
router.patch("/:id/toggle-status", verifyJWT, ctrl.toggleWorkingSectorStatus);

module.exports = router;
