const express = require("express");
const router = express.Router();
const verifyJWT = require("../middelwares/authMiddleware");
const ctrl = require("../Controllers/workingCategoryController");

router.post("/", verifyJWT, ctrl.createWorkingCategory);
router.get("/", verifyJWT, ctrl.listWorkingCategories);
router.put("/:workingCategoryId", verifyJWT, ctrl.updateWorkingCategory);
router.delete("/:workingCategoryId", verifyJWT, ctrl.deleteWorkingCategory);
router.patch(
  "/:workingCategoryId/toggle-status",
  verifyJWT,
  ctrl.toggleWorkingCategoryStatus
);

module.exports = router;
