const express = require("express");
const router = express.Router();
const verifyJWT = require("../middelwares/authMiddleware");
const ctrl = require("../Controllers/salaryRangeController");

// Salary Range routes
router.post("/", verifyJWT, ctrl.createSalaryRange);
router.get("/", verifyJWT, ctrl.listSalaryRanges);
router.put("/:id", verifyJWT, ctrl.updateSalaryRange);
router.delete("/:id", verifyJWT, ctrl.deleteSalaryRange);
router.patch("/:id/toggle-status", verifyJWT, ctrl.toggleSalaryRangeStatus);

module.exports = router;
