const ChartOfAccount = require("../../models/accounting/chartOfAccountModel");

// Create a new Chart of Account node
const createAccount = async (req, res) => {
  try {
    const { code, name, type, parent } = req.body;

    if (!name || !type) {
      return res.status(400).json({ message: "Name and type are required" });
    }

    // Auto-generate 5-digit code for "Account" type
    let finalCode = code || "";
    if (type === "Account") {
      const lastAccount = await ChartOfAccount.findOne({
        type: "Account",
        isActive: true,
      })
        .sort({ code: -1 })
        .select("code");

      if (lastAccount && lastAccount.code) {
        const lastNum = parseInt(lastAccount.code, 10);
        finalCode = String(lastNum + 1).padStart(5, "0");
      } else {
        finalCode = "00001";
      }
    }

    const account = await ChartOfAccount.create({
      code: finalCode,
      name,
      type,
      parent: parent || null,
      createdBy: req.user._id,
    });

    // Populate parent if exists
    const populated = await ChartOfAccount.findById(account._id).populate(
      "parent",
      "name code type",
    );

    return res
      .status(201)
      .json({ message: "Account created successfully", account: populated });
  } catch (err) {
    console.error("createAccount error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// List all active Chart of Accounts (flat list)
const listAccounts = async (req, res) => {
  try {
    const accounts = await ChartOfAccount.find({ isActive: true })
      .sort({ createdAt: 1 })
      .populate("parent", "name code type")
      .populate("createdBy", "username");
    return res.json({ accounts });
  } catch (err) {
    console.error("listAccounts error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update a Chart of Account node
const updateAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, type, parent } = req.body;

    const updated = await ChartOfAccount.findByIdAndUpdate(
      id,
      { code, name, type, parent },
      { new: true },
    )
      .populate("parent", "name code type")
      .populate("createdBy", "username");

    if (!updated) {
      return res.status(404).json({ message: "Account not found" });
    }

    return res.json({
      message: "Account updated successfully",
      account: updated,
    });
  } catch (err) {
    console.error("updateAccount error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Delete (soft delete) a Chart of Account node
const deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;

    // Also soft-delete all children recursively
    const deleteChildren = async (parentId) => {
      const children = await ChartOfAccount.find({
        parent: parentId,
        isActive: true,
      });
      for (const child of children) {
        await deleteChildren(child._id);
        child.isActive = false;
        await child.save();
      }
    };

    const account = await ChartOfAccount.findById(id);
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    await deleteChildren(account._id);
    account.isActive = false;
    await account.save();

    return res.json({
      message: "Account and all children deleted successfully",
    });
  } catch (err) {
    console.error("deleteAccount error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get next available 5-digit code for Account type
const getNextCode = async (req, res) => {
  try {
    const lastAccount = await ChartOfAccount.findOne({
      type: "Account",
      isActive: true,
    })
      .sort({ code: -1 })
      .select("code");

    let nextCode;
    if (lastAccount && lastAccount.code) {
      const lastNum = parseInt(lastAccount.code, 10);
      nextCode = String(lastNum + 1).padStart(5, "0");
    } else {
      nextCode = "00001";
    }

    return res.json({ nextCode });
  } catch (err) {
    console.error("getNextCode error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createAccount,
  listAccounts,
  updateAccount,
  deleteAccount,
  getNextCode,
};
