const express = require("express");
const router = express.Router();
const verifyJWT = require("../middelwares/authMiddleware");
const ctrl = require("../Controllers/visaProfessionController");

// Visa Profession routes
router.post("/", verifyJWT, ctrl.createVisaProfession);
router.get("/", verifyJWT, ctrl.listVisaProfessions);
router.put("/:id", verifyJWT, ctrl.updateVisaProfession);
router.delete("/:id", verifyJWT, ctrl.deleteVisaProfession);
router.patch("/:id/toggle-status", verifyJWT, ctrl.toggleVisaProfessionStatus);

module.exports = router;
