const Account = require("../../models/accounting/accountModel");

// Create account
const createAccount = async (req, res) => {
  try {
    const {
      accountCode,
      accountName,
      accountType,
      subType,
      parentAccount,
      description,
    } = req.body;

    const account = await Account.create({
      accountCode,
      accountName,
      accountType,
      subType,
      parentAccount,
      description,
      createdBy: req.user._id,
    });

    return res
      .status(201)
      .json({ message: "Account created successfully", account });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "Account code already exists" });
    }
    return res.status(500).json({ message: "Server error" });
  }
};

// List accounts
const listAccounts = async (req, res) => {
  try {
    const accounts = await Account.find({ isActive: true })
      .sort({ accountCode: 1 })
      .populate("parentAccount", "accountName accountCode")
      .populate("createdBy", "username");
    return res.json({ accounts });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update account
const updateAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      accountCode,
      accountName,
      accountType,
      subType,
      parentAccount,
      description,
    } = req.body;

    const updatedAccount = await Account.findByIdAndUpdate(
      id,
      {
        accountCode,
        accountName,
        accountType,
        subType,
        parentAccount,
        description,
      },
      { new: true }
    );

    if (!updatedAccount) {
      return res.status(404).json({ message: "Account not found" });
    }

    return res.json({
      message: "Account updated successfully",
      account: updatedAccount,
    });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "Account code already exists" });
    }
    return res.status(500).json({ message: "Server error" });
  }
};

// Delete account (soft delete)
const deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const account = await Account.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    return res.json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get account balance
const getAccountBalance = async (req, res) => {
  try {
    const { id } = req.params;
    // This would typically involve complex queries to calculate balance
    // For now, return a placeholder
    return res.json({ balance: 0, debit: 0, credit: 0 });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createAccount,
  listAccounts,
  updateAccount,
  deleteAccount,
  getAccountBalance,
};
