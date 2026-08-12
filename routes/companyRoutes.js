const express = require("express");
const router = express.Router();
const verifyJWT = require("../middelwares/authMiddleware");
const multer = require("multer");
const ctrl = require("../Controllers/companyController");

// Configure multer for logo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "Uploads/companies/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Company routes
// Create, list, update, delete (admin protected)
router.post("/", verifyJWT, upload.single("logo"), ctrl.createCompany);
router.get("/", verifyJWT, ctrl.listCompanies);
router.put("/:id", verifyJWT, upload.single("logo"), ctrl.updateCompany);
router.delete("/:id", verifyJWT, ctrl.deleteCompany);

// Public company auth and dashboard
router.post("/login", ctrl.loginCompany);
router.get("/dashboard", ctrl.companyDashboard);

module.exports = router;
