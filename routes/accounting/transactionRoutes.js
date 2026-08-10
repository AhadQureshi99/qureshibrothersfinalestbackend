const express = require("express");
const router = express.Router();
const verifyJWT = require("../../middelwares/authMiddleware");
const ctrl = require("../../Controllers/accounting/transactionController");
const multer = require("multer");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const directory = "uploads/finance-transactions";
    fs.mkdirSync(directory, { recursive: true });
    cb(null, directory);
  },
  filename: (req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.post("/", verifyJWT, upload.array("attachments", 5), ctrl.createTransaction);
router.get("/", verifyJWT, ctrl.listTransactions);
router.put("/:id", verifyJWT, upload.array("attachments", 5), ctrl.updateTransaction);
router.delete("/:id", verifyJWT, ctrl.deleteTransaction);
router.get("/type/:type", verifyJWT, ctrl.getTransactionsByType);

module.exports = router;
