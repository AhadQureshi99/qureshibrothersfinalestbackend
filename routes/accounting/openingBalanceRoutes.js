const express = require("express");
const router = express.Router();
const verifyJWT = require("../../middelwares/authMiddleware");
const ctrl = require("../../Controllers/accounting/openingBalanceController");

router.post("/", verifyJWT, ctrl.createOpeningBalance);
router.get("/", verifyJWT, ctrl.listOpeningBalances);
router.put("/:id", verifyJWT, ctrl.updateOpeningBalance);
router.delete("/:id", verifyJWT, ctrl.deleteOpeningBalance);

module.exports = router;
