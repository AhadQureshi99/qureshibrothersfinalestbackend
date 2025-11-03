const express = require("express");
const router = express.Router();
const verifyJWT = require("../../middelwares/authMiddleware");
const ctrl = require("../../Controllers/accounting/transactionController");

router.post("/", verifyJWT, ctrl.createTransaction);
router.get("/", verifyJWT, ctrl.listTransactions);
router.put("/:id", verifyJWT, ctrl.updateTransaction);
router.delete("/:id", verifyJWT, ctrl.deleteTransaction);
router.get("/type/:type", verifyJWT, ctrl.getTransactionsByType);

module.exports = router;
