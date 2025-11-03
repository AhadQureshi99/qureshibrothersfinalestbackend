const express = require("express");
const router = express.Router();
const verifyJWT = require("../../middelwares/authMiddleware");
const ctrl = require("../../Controllers/accounting/accountController");

router.post("/", verifyJWT, ctrl.createAccount);
router.get("/", verifyJWT, ctrl.listAccounts);
router.put("/:id", verifyJWT, ctrl.updateAccount);
router.delete("/:id", verifyJWT, ctrl.deleteAccount);
router.get("/:id/balance", verifyJWT, ctrl.getAccountBalance);

module.exports = router;
