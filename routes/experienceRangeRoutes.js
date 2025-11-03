const express = require("express");
const router = express.Router();
const {
  createExperienceRange,
  listExperienceRanges,
  updateExperienceRange,
  toggleExperienceRangeStatus,
  deleteExperienceRange,
} = require("../Controllers/experienceRangeController");
const verifyJWT = require("../middelwares/authMiddleware");

router.post("/", verifyJWT, createExperienceRange);
router.get("/", verifyJWT, listExperienceRanges);
router.put("/:id", verifyJWT, updateExperienceRange);
router.patch("/:id/toggle-status", verifyJWT, toggleExperienceRangeStatus);
router.delete("/:id", verifyJWT, deleteExperienceRange);

module.exports = router;
