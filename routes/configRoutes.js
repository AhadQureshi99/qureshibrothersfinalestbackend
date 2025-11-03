const express = require("express");
const router = express.Router();
const verifyJWT = require("../middelwares/authMiddleware");
const multer = require("multer");
const ctrl = require("../Controllers/configController");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "Uploads/payment-agents/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Payment Agent routes
router.post(
  "/payment-agents",
  verifyJWT,
  upload.array("files"),
  ctrl.createPaymentAgent
);
router.get("/payment-agents", verifyJWT, ctrl.listPaymentAgents);
router.put(
  "/payment-agents/:id",
  verifyJWT,
  upload.array("files"),
  ctrl.updatePaymentAgent
);
router.delete("/payment-agents/:id", verifyJWT, ctrl.deletePaymentAgent);

module.exports = router;
