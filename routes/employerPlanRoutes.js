const express = require("express");
const router = express.Router();
const {
  getEmployerPlans,
  getEmployerPlan,
  createEmployerPlan,
  updateEmployerPlan,
  deleteEmployerPlan,
} = require("../Controllers/employerPlanController");
const authMiddleware = require("../middelwares/authMiddleware");

// All routes require authentication
router.use(authMiddleware);

// Routes
router.get("/", getEmployerPlans);
router.get("/:id", getEmployerPlan);
router.post("/", createEmployerPlan);
router.put("/:id", updateEmployerPlan);
router.delete("/:id", deleteEmployerPlan);

module.exports = router;
