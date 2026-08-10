const express = require("express");
const router = express.Router();
const verifyJWT = require("../middelwares/authMiddleware");
const ctrl = require("../Controllers/visaCategoryController");

// Visa Category routes
router.post("/", verifyJWT, ctrl.createVisaCategory);
router.get("/", verifyJWT, ctrl.listVisaCategories);
router.put("/:id", verifyJWT, ctrl.updateVisaCategory);
router.delete("/:id", verifyJWT, ctrl.deleteVisaCategory);
router.patch("/:id/toggle-status", verifyJWT, ctrl.toggleVisaCategoryStatus);

module.exports = router;
