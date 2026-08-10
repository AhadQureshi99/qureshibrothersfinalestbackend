const OpeningBalance = require("../../models/accounting/openingBalanceModel");

// Create opening balance
const createOpeningBalance = async (req, res) => {
  try {
    const { account, date, debit, credit, description } = req.body;

    const openingBalance = await OpeningBalance.create({
      account,
      date: date || new Date(),
      debit: Number(debit) || 0,
      credit: Number(credit) || 0,
      description,
      createdBy: req.user._id,
    });

    return res
      .status(201)
      .json({
        message: "Opening balance created successfully",
        openingBalance,
      });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// List opening balances
const listOpeningBalances = async (req, res) => {
  try {
    const openingBalances = await OpeningBalance.find()
      .sort({ date: -1 })
      .populate("account", "accountName accountCode accountType")
      .populate("createdBy", "username");

    return res.json({ openingBalances });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update opening balance
const updateOpeningBalance = async (req, res) => {
  try {
    const { id } = req.params;
    const { account, date, debit, credit, description } = req.body;

    const updatedBalance = await OpeningBalance.findByIdAndUpdate(
      id,
      {
        account,
        date,
        debit: Number(debit) || 0,
        credit: Number(credit) || 0,
        description,
      },
      { new: true }
    );

    if (!updatedBalance) {
      return res.status(404).json({ message: "Opening balance not found" });
    }

    return res.json({
      message: "Opening balance updated successfully",
      openingBalance: updatedBalance,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Delete opening balance
const deleteOpeningBalance = async (req, res) => {
  try {
    const { id } = req.params;
    const balance = await OpeningBalance.findByIdAndDelete(id);

    if (!balance) {
      return res.status(404).json({ message: "Opening balance not found" });
    }

    return res.json({ message: "Opening balance deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createOpeningBalance,
  listOpeningBalances,
  updateOpeningBalance,
  deleteOpeningBalance,
};
