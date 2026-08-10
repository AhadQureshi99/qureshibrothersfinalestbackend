const express = require("express");
const router = express.Router();
const {
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill,
  toggleSkillStatus,
} = require("../Controllers/skillController");
const protect = require("../middelwares/authMiddleware");

router.use(protect);

router.route("/").get(getSkills).post(createSkill);

router.route("/:id").put(updateSkill).delete(deleteSkill);

router.patch("/:id/toggle-status", toggleSkillStatus);

module.exports = router;
