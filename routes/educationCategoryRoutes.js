const express = require("express");
const router = express.Router();
const verifyJWT = require("../middelwares/authMiddleware");
const ctrl = require("../Controllers/educationCategoryController");

// Education Category routes
router.post("/", verifyJWT, ctrl.createEducationCategory);
router.get("/", verifyJWT, ctrl.listEducationCategories);
router.put("/:id", verifyJWT, ctrl.updateEducationCategory);
router.delete("/:id", verifyJWT, ctrl.deleteEducationCategory);
router.patch(
  "/:id/toggle-status",
  verifyJWT,
  ctrl.toggleEducationCategoryStatus
);

module.exports = router;
