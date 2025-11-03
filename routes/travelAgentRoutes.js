const express = require("express");
const router = express.Router();
const verifyJWT = require("../middelwares/authMiddleware");
const multer = require("multer");
const ctrl = require("../Controllers/travelAgentController");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "Uploads/travel-agents/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Travel Agent routes
router.post("/", verifyJWT, upload.array("files"), ctrl.createTravelAgent);
router.get("/", verifyJWT, ctrl.listTravelAgents);
router.put("/:id", verifyJWT, upload.array("files"), ctrl.updateTravelAgent);
router.delete("/:id", verifyJWT, ctrl.deleteTravelAgent);

module.exports = router;
