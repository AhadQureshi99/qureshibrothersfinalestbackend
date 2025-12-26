const Expense = require("../models/expenseModel");
const { createLog } = require("./activityLogController");
const ExpenseRequest = require("../models/expenseRequestModel");

// Create expense (admins and superadmins and users can add — per requirement admin can add without approval)
const createExpense = async (req, res) => {
  try {
    const { date, type, expenseName, amount, remarks } = req.body;
    const expense = await Expense.create({
      date: date || new Date(),
      type: type || "other",
      expenseName,
      amount: Number(amount),
      remarks,
      createdBy: req.user._id,
    });
    // Log activity
    await createLog({
      action: "created",
      entityType: "Expense",
      entityId: expense._id,
      entityName: expense.expenseName,
      description: `New expense ${expense.expenseName} has been created by ${
        req.user?.username || "System"
      }`,
      performedBy: req.user?.username || "System",
      performedById: req.user?._id,
      meta: { amount: expense.amount },
    });
    return res.status(201).json({ message: "Expense created", expense });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// List expenses
const listExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find()
      .sort({ createdAt: -1 })
      .populate("createdBy", "username email role");
    return res.json({ expenses });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Admin requests an edit or delete (creates a request if not superadmin)
const requestExpenseAction = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const { requestType, payload } = req.body; // payload for edit

    // If superadmin, perform immediately
    if (req.user.role === "superadmin") {
      if (requestType === "delete") {
        await Expense.findByIdAndDelete(expenseId);
        return res.json({ message: "Expense deleted by superadmin" });
      }
      if (requestType === "edit") {
        const updated = await Expense.findByIdAndUpdate(expenseId, payload, {
          new: true,
        });
        return res.json({
          message: "Expense updated by superadmin",
          expense: updated,
        });
      }
    }

    // Otherwise create a pending request
    const reqDoc = await ExpenseRequest.create({
      expenseId,
      requestType,
      requestedBy: req.user._id,
      payload: payload || {},
    });
    return res
      .status(201)
      .json({ message: "Request created", request: reqDoc });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Superadmin: list pending requests
const listRequests = async (req, res) => {
  try {
    if (req.user.role !== "superadmin")
      return res.status(403).json({ message: "Forbidden" });
    const requests = await ExpenseRequest.find({ status: "pending" }).populate(
      "requestedBy",
      "username email"
    );
    return res.json({ requests });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Superadmin approves/rejects a request
const handleRequest = async (req, res) => {
  try {
    if (req.user.role !== "superadmin")
      return res.status(403).json({ message: "Forbidden" });
    const { requestId } = req.params;
    const { action } = req.body; // 'approve' | 'reject'
    const reqDoc = await ExpenseRequest.findById(requestId);
    if (!reqDoc) return res.status(404).json({ message: "Request not found" });

    if (action === "reject") {
      reqDoc.status = "rejected";
      await reqDoc.save();
      return res.json({ message: "Request rejected" });
    }

    // approve
    if (reqDoc.requestType === "delete") {
      await Expense.findByIdAndDelete(reqDoc.expenseId);
    } else if (reqDoc.requestType === "edit") {
      await Expense.findByIdAndUpdate(reqDoc.expenseId, reqDoc.payload);
    }
    reqDoc.status = "approved";
    await reqDoc.save();
    return res.json({ message: "Request approved and applied" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Superadmin direct update/delete endpoints
const updateExpense = async (req, res) => {
  try {
    if (req.user.role !== "superadmin")
      return res.status(403).json({ message: "Forbidden" });
    const updated = await Expense.findByIdAndUpdate(
      req.params.expenseId,
      req.body,
      { new: true }
    );
    // Log activity
    await createLog({
      action: "updated",
      entityType: "Expense",
      entityId: updated?._id,
      entityName: updated?.expenseName,
      description: `Expense ${updated?.expenseName} has been updated by ${
        req.user?.username || "System"
      }`,
      performedBy: req.user?.username || "System",
      performedById: req.user?._id,
      meta: { amount: updated?.amount },
    });
    return res.json({ message: "Expense updated", expense: updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

const deleteExpense = async (req, res) => {
  try {
    if (req.user.role !== "superadmin")
      return res.status(403).json({ message: "Forbidden" });
    const deleted = await Expense.findByIdAndDelete(req.params.expenseId);
    // Log activity
    await createLog({
      action: "deleted",
      entityType: "Expense",
      entityId: deleted?._id,
      entityName: deleted?.expenseName,
      description: `The Expense ${deleted?.expenseName} has been deleted by ${
        req.user?.username || "System"
      }`,
      performedBy: req.user?.username || "System",
      performedById: req.user?._id,
      meta: { amount: deleted?.amount },
    });
    return res.json({ message: "Expense deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createExpense,
  listExpenses,
  requestExpenseAction,
  listRequests,
  handleRequest,
  updateExpense,
  deleteExpense,
};
