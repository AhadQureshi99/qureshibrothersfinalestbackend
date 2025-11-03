const express = require("express");
const router = express.Router();
const verifyJWT = require("../../middelwares/authMiddleware");
const ctrl = require("../../Controllers/accounting/reportController");

router.get("/general-ledger", verifyJWT, ctrl.getGeneralLedger);
router.get("/trial-balance", verifyJWT, ctrl.getTrialBalance);
router.get("/balance-sheet", verifyJWT, ctrl.getBalanceSheet);
router.get("/income-statement", verifyJWT, ctrl.getIncomeStatement);
router.get("/cash-book", verifyJWT, ctrl.getCashBook);
router.get("/bank-book", verifyJWT, ctrl.getBankBook);
router.get(
  "/chart-of-accounts-balances",
  verifyJWT,
  ctrl.getChartOfAccountsBalances
);
router.get("/account-balances", verifyJWT, ctrl.getAccountBalances);
router.get("/cash-flow-statement", verifyJWT, ctrl.getCashFlowStatement);
router.get(
  "/statement-of-owners-equity",
  verifyJWT,
  ctrl.getStatementOfOwnersEquity
);

module.exports = router;
