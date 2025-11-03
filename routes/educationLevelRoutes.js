const express = require("express");
const router = express.Router();
const {
  listEducationLevels,
  createEducationLevel,
  updateEducationLevel,
  deleteEducationLevel,
  toggleEducationLevelStatus,
} = require("../Controllers/educationLevelController");
const protect = require("../middelwares/authMiddleware");

router.use(protect);

router.route("/").get(listEducationLevels).post(createEducationLevel);

router.route("/:id").put(updateEducationLevel).delete(deleteEducationLevel);

router.patch("/:id/toggle-status", toggleEducationLevelStatus);

module.exports = router;
