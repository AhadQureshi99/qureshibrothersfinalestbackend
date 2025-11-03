const express = require("express");
const router = express.Router();
const verifyJWT = require("../middelwares/authMiddleware");
const multer = require("multer");
const ctrl = require("../Controllers/recruitmentAgentController");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "Uploads/recruitment-agents/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Recruitment Agent routes
router.post("/", verifyJWT, upload.array("files"), ctrl.createRecruitmentAgent);
router.get("/", verifyJWT, ctrl.listRecruitmentAgents);
router.put(
  "/:id",
  verifyJWT,
  upload.array("files"),
  ctrl.updateRecruitmentAgent
);
router.delete("/:id", verifyJWT, ctrl.deleteRecruitmentAgent);

module.exports = router;
