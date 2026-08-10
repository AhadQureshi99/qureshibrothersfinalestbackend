const express = require("express");
const {
  getAllRoles,
  createRole,
  updateRole,
  deleteRole,
} = require("../Controllers/roleController");
const protect = require("../middelwares/authMiddleware");

const router = express.Router();

router.route("/").get(protect, getAllRoles).post(protect, createRole);
router.route("/:id").put(protect, updateRole).delete(protect, deleteRole);

module.exports = router;
