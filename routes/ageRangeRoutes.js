const express = require("express");
const router = express.Router();
const verifyJWT = require("../middelwares/authMiddleware");
const ctrl = require("../Controllers/ageRangeController");

// Age Range routes
router.post("/", verifyJWT, ctrl.createAgeRange);
router.get("/", verifyJWT, ctrl.listAgeRanges);
router.put("/:id", verifyJWT, ctrl.updateAgeRange);
router.delete("/:id", verifyJWT, ctrl.deleteAgeRange);
router.patch("/:id/toggle-status", verifyJWT, ctrl.toggleAgeRangeStatus);

module.exports = router;
