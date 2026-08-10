const express = require("express");
const router = express.Router();
const verifyJWT = require("../middelwares/authMiddleware");
const ctrl = require("../Controllers/medicalCenterController");

// Medical Center routes
router.post("/", verifyJWT, ctrl.createMedicalCenter);
router.get("/", verifyJWT, ctrl.listMedicalCenters);
router.put("/:id", verifyJWT, ctrl.updateMedicalCenter);
router.delete("/:id", verifyJWT, ctrl.deleteMedicalCenter);
router.patch("/:id/toggle-status", verifyJWT, ctrl.toggleMedicalCenterStatus);

module.exports = router;
