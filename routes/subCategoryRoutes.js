const express = require("express");
const router = express.Router();
const verifyJWT = require("../middelwares/authMiddleware");
const ctrl = require("../Controllers/subCategoryController");

router.post("/", verifyJWT, ctrl.createSubCategory);
router.get("/", verifyJWT, ctrl.listSubCategories);
router.put("/:subCategoryId", verifyJWT, ctrl.updateSubCategory);
router.delete("/:subCategoryId", verifyJWT, ctrl.deleteSubCategory);
router.patch(
  "/:subCategoryId/toggle-status",
  verifyJWT,
  ctrl.toggleSubCategoryStatus
);

module.exports = router;
