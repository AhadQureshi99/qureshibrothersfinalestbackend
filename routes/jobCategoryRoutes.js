const express = require("express");
const router = express.Router();
const verifyJWT = require("../middelwares/authMiddleware");
const ctrl = require("../Controllers/jobCategoryController");

// Job Category routes
router.post("/", verifyJWT, ctrl.createJobCategory);
router.get("/", verifyJWT, ctrl.listJobCategories);
router.put("/:id", verifyJWT, ctrl.updateJobCategory);
router.delete("/:id", verifyJWT, ctrl.deleteJobCategory);
router.patch("/:id/toggle-status", verifyJWT, ctrl.toggleJobCategoryStatus);

module.exports = router;
