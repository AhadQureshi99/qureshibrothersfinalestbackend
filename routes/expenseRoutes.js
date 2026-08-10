const express = require("express");
const router = express.Router();
const verifyJWT = require("../middelwares/authMiddleware");
const ctrl = require("../Controllers/expenseController");

router.post("/", verifyJWT, ctrl.createExpense);
router.get("/", verifyJWT, ctrl.listExpenses);

// admin requests edit/delete (or superadmin direct)
router.post("/:expenseId/request", verifyJWT, ctrl.requestExpenseAction);

// superadmin: list requests and handle
router.get("/requests", verifyJWT, ctrl.listRequests);
router.post("/requests/:requestId/handle", verifyJWT, ctrl.handleRequest);

// superadmin direct update/delete
router.put("/:expenseId", verifyJWT, ctrl.updateExpense);
router.delete("/:expenseId", verifyJWT, ctrl.deleteExpense);

module.exports = router;
