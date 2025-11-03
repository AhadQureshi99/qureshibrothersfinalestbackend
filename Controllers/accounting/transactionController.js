const Transaction = require("../../models/accounting/transactionModel");

// Create transaction
const createTransaction = async (req, res) => {
  try {
    const {
      transactionType,
      date,
      reference,
      description,
      amount,
      account,
      contraAccount,
      candidate,
      paymentAgent,
      travelAgent,
      job,
    } = req.body;

    const transaction = await Transaction.create({
      transactionType,
      date: date || new Date(),
      reference,
      description,
      amount: Number(amount),
      account,
      contraAccount,
      candidate,
      paymentAgent,
      travelAgent,
      job,
      createdBy: req.user._id,
    });

    return res
      .status(201)
      .json({ message: "Transaction created successfully", transaction });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// List transactions
const listTransactions = async (req, res) => {
  try {
    const { type, startDate, endDate } = req.query;
    let filter = {};

    if (type) filter.transactionType = type;
    if (startDate && endDate) {
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const transactions = await Transaction.find(filter)
      .sort({ date: -1 })
      .populate("account", "accountName accountCode")
      .populate("contraAccount", "accountName accountCode")
      .populate("candidate", "name")
      .populate("paymentAgent", "name")
      .populate("travelAgent", "name")
      .populate("createdBy", "username");

    return res.json({ transactions });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update transaction
const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedTransaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    return res.json({
      message: "Transaction updated successfully",
      transaction: updatedTransaction,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Delete transaction
const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findByIdAndDelete(id);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    return res.json({ message: "Transaction deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get transactions by type
const getTransactionsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const transactions = await Transaction.find({ transactionType: type })
      .sort({ date: -1 })
      .populate("account", "accountName accountCode")
      .populate("contraAccount", "accountName accountCode");

    return res.json({ transactions });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createTransaction,
  listTransactions,
  updateTransaction,
  deleteTransaction,
  getTransactionsByType,
};
