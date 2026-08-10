const express = require("express");
const router = express.Router();
const {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
} = require("../Controllers/jobController");
const verifyJWT = require("../middelwares/authMiddleware");

// All routes require authentication
router.use(verifyJWT);

// Routes
router.route("/").get(getJobs).post(createJob);
router.route("/:id").get(getJob).put(updateJob).delete(deleteJob);

module.exports = router;
