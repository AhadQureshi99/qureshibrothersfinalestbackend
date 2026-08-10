const express = require("express");
const router = express.Router();
const {
  getEmployers,
  getEmployer,
  createEmployer,
  updateEmployer,
  deleteEmployer,
} = require("../Controllers/employerController");
const authMiddleware = require("../middelwares/authMiddleware");

// All routes require authentication
router.use(authMiddleware);

// Routes
router.get("/", getEmployers);
router.get("/:id", getEmployer);
router.post("/", createEmployer);
router.put("/:id", updateEmployer);
router.delete("/:id", deleteEmployer);

module.exports = router;
