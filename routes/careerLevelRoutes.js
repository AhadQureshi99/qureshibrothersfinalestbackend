const express = require("express");
const router = express.Router();
const {
  listCareerLevels,
  createCareerLevel,
  updateCareerLevel,
  deleteCareerLevel,
  toggleCareerLevelStatus,
} = require("../Controllers/careerLevelController");
const protect = require("../middelwares/authMiddleware");

router.use(protect);

router.route("/").get(listCareerLevels).post(createCareerLevel);

router.route("/:id").put(updateCareerLevel).delete(deleteCareerLevel);

router.patch("/:id/toggle-status", toggleCareerLevelStatus);

module.exports = router;
