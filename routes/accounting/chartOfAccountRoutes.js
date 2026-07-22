const express = require("express");
const router = express.Router();
const verifyJWT = require("../../middelwares/authMiddleware");
const ctrl = require("../../Controllers/accounting/chartOfAccountController");

router.post("/", verifyJWT, ctrl.createAccount);
router.get("/", verifyJWT, ctrl.listAccounts);
router.get("/next-code", verifyJWT, ctrl.getNextCode);
router.put("/:id", verifyJWT, ctrl.updateAccount);
router.delete("/:id", verifyJWT, ctrl.deleteAccount);

module.exports = router;
