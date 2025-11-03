const Transaction = require("../../models/accounting/transactionModel");
const Account = require("../../models/accounting/accountModel");
const OpeningBalance = require("../../models/accounting/openingBalanceModel");

// General Ledger
const getGeneralLedger = async (req, res) => {
  try {
    const { accountId, startDate, endDate } = req.query;

    let filter = {};
    if (accountId)
      filter.$or = [{ account: accountId }, { contraAccount: accountId }];
    if (startDate && endDate) {
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const transactions = await Transaction.find(filter)
      .sort({ date: 1 })
      .populate("account", "accountName accountCode")
      .populate("contraAccount", "accountName accountCode");

    // Build general ledger entries with running balance
    const ledgerEntries = [];
    let runningBalance = 0;

    // If accountId is specified, calculate opening balance
    if (accountId && startDate) {
      const openingBalances = await OpeningBalance.find({
        account: accountId,
        date: { $lt: new Date(startDate) },
      });

      let openingDebit = 0;
      let openingCredit = 0;
      openingBalances.forEach((ob) => {
        openingDebit += ob.debit;
        openingCredit += ob.credit;
      });

      runningBalance = openingDebit - openingCredit;

      if (Math.abs(runningBalance) > 0.01) {
        ledgerEntries.push({
          date: new Date(startDate).toISOString().split("T")[0],
          voucherType: "Opening Balance",
          voucherNumber: "-",
          description: "Opening Balance",
          debit: runningBalance > 0 ? runningBalance : 0,
          credit: runningBalance < 0 ? Math.abs(runningBalance) : 0,
          balance: runningBalance,
        });
      }
    }

    // Add transaction entries
    transactions.forEach((transaction) => {
      const isDebit = transaction.account._id.toString() === accountId;
      const contraAccount = isDebit
        ? transaction.contraAccount
        : transaction.account;

      runningBalance += isDebit ? transaction.amount : -transaction.amount;

      ledgerEntries.push({
        date: transaction.date.toISOString().split("T")[0],
        voucherType: transaction.voucherType || "JV",
        voucherNumber:
          transaction.voucherNumber || transaction._id.toString().slice(-6),
        description:
          transaction.description ||
          `Transaction with ${contraAccount.accountName}`,
        debit: isDebit ? transaction.amount : 0,
        credit: !isDebit ? transaction.amount : 0,
        balance: runningBalance,
      });
    });

    return res.json({ generalLedger: ledgerEntries });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Trial Balance
const getTrialBalance = async (req, res) => {
  try {
    const { fromDate, toDate, filterZeroBalance } = req.query;
    const startDate = fromDate
      ? new Date(fromDate)
      : new Date(new Date().getFullYear(), 0, 1);
    const endDate = toDate ? new Date(toDate) : new Date();

    // Get all accounts
    const accounts = await Account.find({ isActive: true }).sort({
      accountCode: 1,
    });

    const trialBalance = [];

    for (const account of accounts) {
      // Calculate opening balance up to start date
      const openingBalances = await OpeningBalance.find({
        account: account._id,
        date: { $lt: startDate },
      });

      let openingDebit = 0;
      let openingCredit = 0;
      openingBalances.forEach((ob) => {
        openingDebit += ob.debit;
        openingCredit += ob.credit;
      });

      const openingBalance = openingDebit - openingCredit;

      // Calculate transactions within the date range
      const transactions = await Transaction.find({
        $or: [{ account: account._id }, { contraAccount: account._id }],
        date: { $gte: startDate, $lte: endDate },
      });

      let periodDebit = 0;
      let periodCredit = 0;

      transactions.forEach((transaction) => {
        if (transaction.account.toString() === account._id.toString()) {
          periodDebit += transaction.amount;
        } else {
          periodCredit += transaction.amount;
        }
      });

      const balance = openingBalance + periodDebit - periodCredit;

      // Filter zero balance if requested
      if (filterZeroBalance === "true" && Math.abs(balance) < 0.01) {
        continue;
      }

      trialBalance.push({
        code: account.accountCode,
        accountName: account.accountName,
        openingBalance: openingBalance.toFixed(2),
        debit: periodDebit.toFixed(2),
        credit: periodCredit.toFixed(2),
        balance: balance.toFixed(2),
      });
    }

    return res.json({ trialBalance });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Balance Sheet
const getBalanceSheet = async (req, res) => {
  try {
    const { date } = req.query;
    const endDate = date ? new Date(date) : new Date();

    const assets = await Account.find({ accountType: "Asset", isActive: true });
    const liabilities = await Account.find({
      accountType: "Liability",
      isActive: true,
    });
    const equity = await Account.find({
      accountType: "Equity",
      isActive: true,
    });

    const calculateBalance = async (accounts) => {
      let total = 0;
      for (const account of accounts) {
        const openingBalances = await OpeningBalance.find({
          account: account._id,
          date: { $lte: endDate },
        });
        let balance = 0;
        openingBalances.forEach((ob) => (balance += ob.debit - ob.credit));

        const transactions = await Transaction.find({
          $or: [{ account: account._id }, { contraAccount: account._id }],
          date: { $lte: endDate },
        });
        transactions.forEach((transaction) => {
          if (transaction.account.toString() === account._id.toString()) {
            balance += transaction.amount;
          } else {
            balance -= transaction.amount;
          }
        });
        total += balance;
      }
      return total;
    };

    const totalAssets = await calculateBalance(assets);
    const totalLiabilities = await calculateBalance(liabilities);
    const totalEquity = await calculateBalance(equity);

    return res.json({
      balanceSheet: {
        assets: totalAssets,
        liabilities: totalLiabilities,
        equity: totalEquity,
        totalLiabilitiesAndEquity: totalLiabilities + totalEquity,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Income Statement
const getIncomeStatement = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate
      ? new Date(startDate)
      : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate) : new Date();

    const revenueAccounts = await Account.find({
      accountType: "Revenue",
      isActive: true,
    });
    const expenseAccounts = await Account.find({
      accountType: "Expense",
      isActive: true,
    });

    const calculateTotal = async (accounts) => {
      let total = 0;
      for (const account of accounts) {
        const transactions = await Transaction.find({
          $or: [{ account: account._id }, { contraAccount: account._id }],
          date: { $gte: start, $lte: end },
        });
        transactions.forEach((transaction) => {
          if (transaction.account.toString() === account._id.toString()) {
            total += transaction.amount;
          } else {
            total -= transaction.amount;
          }
        });
      }
      return total;
    };

    const totalRevenue = await calculateTotal(revenueAccounts);
    const totalExpenses = await calculateTotal(expenseAccounts);
    const netIncome = totalRevenue - totalExpenses;

    return res.json({
      incomeStatement: {
        revenue: totalRevenue,
        expenses: totalExpenses,
        netIncome,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Cash Book
const getCashBook = async (req, res) => {
  try {
    const { startDate, endDate, accountId } = req.query;
    const start = startDate
      ? new Date(startDate)
      : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate) : new Date();

    let cashAccount;
    if (accountId) {
      cashAccount = await Account.findById(accountId);
    } else {
      // Default to cash account with code "1001"
      cashAccount = await Account.findOne({ accountCode: "1001" });
    }

    if (!cashAccount) {
      return res.json({ cashBook: [] });
    }

    // Get opening balance
    const openingBalances = await OpeningBalance.find({
      account: cashAccount._id,
      date: { $lt: start },
    });

    let openingBalance = 0;
    openingBalances.forEach((ob) => {
      openingBalance += ob.debit - ob.credit;
    });

    // Get transactions
    const transactions = await Transaction.find({
      $or: [{ account: cashAccount._id }, { contraAccount: cashAccount._id }],
      date: { $gte: start, $lte: end },
    })
      .sort({ date: 1 })
      .populate("account", "accountName accountCode")
      .populate("contraAccount", "accountName accountCode");

    // Build cash book entries with running balance
    const cashBookEntries = [];
    let runningBalance = openingBalance;

    // Add opening balance entry if exists
    if (Math.abs(openingBalance) > 0.01) {
      cashBookEntries.push({
        date: start.toISOString().split("T")[0],
        voucherType: "Opening Balance",
        voucherNumber: "-",
        description: "Opening Balance",
        debit: openingBalance > 0 ? openingBalance : 0,
        credit: openingBalance < 0 ? Math.abs(openingBalance) : 0,
        balance: runningBalance,
      });
    }

    // Add transaction entries
    transactions.forEach((transaction) => {
      const isDebit =
        transaction.account.toString() === cashAccount._id.toString();
      const contraAccount = isDebit
        ? transaction.contraAccount
        : transaction.account;

      runningBalance += isDebit ? transaction.amount : -transaction.amount;

      cashBookEntries.push({
        date: transaction.date.toISOString().split("T")[0],
        voucherType: transaction.voucherType || "JV",
        voucherNumber:
          transaction.voucherNumber || transaction._id.toString().slice(-6),
        description:
          transaction.description ||
          `Transaction with ${contraAccount.accountName}`,
        debit: isDebit ? transaction.amount : 0,
        credit: !isDebit ? transaction.amount : 0,
        balance: runningBalance,
      });
    });

    return res.json({ cashBook: cashBookEntries });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Bank Book
const getBankBook = async (req, res) => {
  try {
    const { startDate, endDate, accountId } = req.query;
    const start = startDate
      ? new Date(startDate)
      : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate) : new Date();

    let bankAccount;
    if (accountId) {
      bankAccount = await Account.findById(accountId);
    } else {
      // Default to bank account with code "1002"
      bankAccount = await Account.findOne({ accountCode: "1002" });
    }

    if (!bankAccount) {
      return res.json({ bankBook: [] });
    }

    // Get opening balance
    const openingBalances = await OpeningBalance.find({
      account: bankAccount._id,
      date: { $lt: start },
    });

    let openingBalance = 0;
    openingBalances.forEach((ob) => {
      openingBalance += ob.debit - ob.credit;
    });

    // Get transactions
    const transactions = await Transaction.find({
      $or: [{ account: bankAccount._id }, { contraAccount: bankAccount._id }],
      date: { $gte: start, $lte: end },
    })
      .sort({ date: 1 })
      .populate("account", "accountName accountCode")
      .populate("contraAccount", "accountName accountCode");

    // Build bank book entries with running balance
    const bankBookEntries = [];
    let runningBalance = openingBalance;

    // Add opening balance entry if exists
    if (Math.abs(openingBalance) > 0.01) {
      bankBookEntries.push({
        date: start.toISOString().split("T")[0],
        voucherType: "Opening Balance",
        voucherNumber: "-",
        description: "Opening Balance",
        debit: openingBalance > 0 ? openingBalance : 0,
        credit: openingBalance < 0 ? Math.abs(openingBalance) : 0,
        balance: runningBalance,
      });
    }

    // Add transaction entries
    transactions.forEach((transaction) => {
      const isDebit =
        transaction.account.toString() === bankAccount._id.toString();
      const contraAccount = isDebit
        ? transaction.contraAccount
        : transaction.account;

      runningBalance += isDebit ? transaction.amount : -transaction.amount;

      bankBookEntries.push({
        date: transaction.date.toISOString().split("T")[0],
        voucherType: transaction.voucherType || "JV",
        voucherNumber:
          transaction.voucherNumber || transaction._id.toString().slice(-6),
        description:
          transaction.description ||
          `Transaction with ${contraAccount.accountName}`,
        debit: isDebit ? transaction.amount : 0,
        credit: !isDebit ? transaction.amount : 0,
        balance: runningBalance,
      });
    });

    return res.json({ bankBook: bankBookEntries });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Chart of Accounts with Balances
const getChartOfAccountsBalances = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;
    const startDate = fromDate
      ? new Date(fromDate)
      : new Date(new Date().getFullYear(), 0, 1);
    const endDate = toDate ? new Date(toDate) : new Date();

    // Get all active accounts
    const accounts = await Account.find({ isActive: true }).sort({
      accountCode: 1,
    });

    const balances = [];

    for (const account of accounts) {
      // Calculate opening balance up to start date
      const openingBalances = await OpeningBalance.find({
        account: account._id,
        date: { $lt: startDate },
      });

      let openingDebit = 0;
      let openingCredit = 0;
      openingBalances.forEach((ob) => {
        openingDebit += ob.debit;
        openingCredit += ob.credit;
      });

      // Calculate transactions within the date range
      const transactions = await Transaction.find({
        $or: [{ account: account._id }, { contraAccount: account._id }],
        date: { $gte: startDate, $lte: endDate },
      });

      let periodDebit = 0;
      let periodCredit = 0;

      transactions.forEach((transaction) => {
        if (transaction.account.toString() === account._id.toString()) {
          periodDebit += transaction.amount;
        } else {
          periodCredit += transaction.amount;
        }
      });

      // Calculate net balance
      const netBalance =
        openingDebit - openingCredit + (periodDebit - periodCredit);

      balances.push({
        accountCode: account.accountCode,
        accountName: account.accountName,
        accountType: account.accountType,
        debitBalance: netBalance > 0 ? netBalance : 0,
        creditBalance: netBalance < 0 ? Math.abs(netBalance) : 0,
        netBalance: netBalance,
      });
    }

    return res.json({ balances });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Account Balances
const getAccountBalances = async (req, res) => {
  try {
    const { fromDate, toDate, accountId } = req.query;
    const startDate = fromDate
      ? new Date(fromDate)
      : new Date(new Date().getFullYear(), 0, 1);
    const endDate = toDate ? new Date(toDate) : new Date();

    let accountsQuery = { isActive: true };
    if (accountId) {
      accountsQuery._id = accountId;
    }

    // Get accounts (all or specific)
    const accounts = await Account.find(accountsQuery).sort({
      accountCode: 1,
    });

    const balances = [];

    for (const account of accounts) {
      // Calculate opening balance up to start date
      const openingBalances = await OpeningBalance.find({
        account: account._id,
        date: { $lt: startDate },
      });

      let openingDebit = 0;
      let openingCredit = 0;
      openingBalances.forEach((ob) => {
        openingDebit += ob.debit;
        openingCredit += ob.credit;
      });

      // Calculate transactions within the date range
      const transactions = await Transaction.find({
        $or: [{ account: account._id }, { contraAccount: account._id }],
        date: { $gte: startDate, $lte: endDate },
      });

      let periodDebit = 0;
      let periodCredit = 0;

      transactions.forEach((transaction) => {
        if (transaction.account.toString() === account._id.toString()) {
          periodDebit += transaction.amount;
        } else {
          periodCredit += transaction.amount;
        }
      });

      // Calculate net balance
      const netBalance =
        openingDebit - openingCredit + (periodDebit - periodCredit);

      balances.push({
        accountCode: account.accountCode,
        accountName: account.accountName,
        accountType: account.accountType,
        debitBalance: netBalance > 0 ? netBalance : 0,
        creditBalance: netBalance < 0 ? Math.abs(netBalance) : 0,
        netBalance: netBalance,
      });
    }

    return res.json({ balances });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Cash Flow Statement
const getCashFlowStatement = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate
      ? new Date(startDate)
      : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate) : new Date();

    // Get cash and bank accounts for net cash flow
    const cashAccounts = await Account.find({
      accountType: "Asset",
      accountName: { $regex: /cash|bank/i },
      isActive: true,
    });

    // Calculate operating activities (simplified - revenue minus expenses)
    const revenueAccounts = await Account.find({
      accountType: "Revenue",
      isActive: true,
    });
    const expenseAccounts = await Account.find({
      accountType: "Expense",
      isActive: true,
    });

    const calculateTotal = async (accounts) => {
      let total = 0;
      for (const account of accounts) {
        const transactions = await Transaction.find({
          $or: [{ account: account._id }, { contraAccount: account._id }],
          date: { $gte: start, $lte: end },
        });
        transactions.forEach((transaction) => {
          if (transaction.account.toString() === account._id.toString()) {
            total += transaction.amount;
          } else {
            total -= transaction.amount;
          }
        });
      }
      return total;
    };

    const totalRevenue = await calculateTotal(revenueAccounts);
    const totalExpenses = await calculateTotal(expenseAccounts);
    const operatingCashFlow = totalRevenue - totalExpenses;

    // Investing activities (simplified - assume fixed asset transactions)
    const fixedAssetAccounts = await Account.find({
      accountType: "Asset",
      accountName: { $regex: /fixed|property|equipment/i },
      isActive: true,
    });
    const investingCashFlow = await calculateTotal(fixedAssetAccounts);

    // Financing activities (simplified - equity and liability changes)
    const equityAccounts = await Account.find({
      accountType: "Equity",
      isActive: true,
    });
    const liabilityAccounts = await Account.find({
      accountType: "Liability",
      isActive: true,
    });
    const financingCashFlow =
      (await calculateTotal(equityAccounts)) +
      (await calculateTotal(liabilityAccounts));

    const netCashFlow =
      operatingCashFlow + investingCashFlow + financingCashFlow;

    return res.json({
      cashFlowStatement: {
        operatingCashFlow,
        investingCashFlow,
        financingCashFlow,
        netCashFlow,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Statement of Owners Equity
const getStatementOfOwnersEquity = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate
      ? new Date(startDate)
      : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate) : new Date();

    // Get equity accounts
    const equityAccounts = await Account.find({
      accountType: "Equity",
      isActive: true,
    });

    // Calculate opening equity
    let openingEquity = 0;
    for (const account of equityAccounts) {
      const openingBalances = await OpeningBalance.find({
        account: account._id,
        date: { $lt: start },
      });
      openingBalances.forEach((ob) => {
        openingEquity += ob.debit - ob.credit;
      });
    }

    // Calculate equity changes during the period
    let equityChanges = 0;
    for (const account of equityAccounts) {
      const transactions = await Transaction.find({
        $or: [{ account: account._id }, { contraAccount: account._id }],
        date: { $gte: start, $lte: end },
      });
      transactions.forEach((transaction) => {
        if (transaction.account.toString() === account._id.toString()) {
          equityChanges += transaction.amount;
        } else {
          equityChanges -= transaction.amount;
        }
      });
    }

    // Calculate net income for the period (from income statement)
    const revenueAccounts = await Account.find({
      accountType: "Revenue",
      isActive: true,
    });
    const expenseAccounts = await Account.find({
      accountType: "Expense",
      isActive: true,
    });

    const calculateTotal = async (accounts) => {
      let total = 0;
      for (const account of accounts) {
        const transactions = await Transaction.find({
          $or: [{ account: account._id }, { contraAccount: account._id }],
          date: { $gte: start, $lte: end },
        });
        transactions.forEach((transaction) => {
          if (transaction.account.toString() === account._id.toString()) {
            total += transaction.amount;
          } else {
            total -= transaction.amount;
          }
        });
      }
      return total;
    };

    const totalRevenue = await calculateTotal(revenueAccounts);
    const totalExpenses = await calculateTotal(expenseAccounts);
    const netIncome = totalRevenue - totalExpenses;

    // Calculate closing equity
    const closingEquity = openingEquity + equityChanges + netIncome;

    return res.json({
      statementOfOwnersEquity: {
        openingEquity,
        netIncome,
        equityChanges,
        closingEquity,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getGeneralLedger,
  getTrialBalance,
  getBalanceSheet,
  getIncomeStatement,
  getCashBook,
  getBankBook,
  getChartOfAccountsBalances,
  getAccountBalances,
  getCashFlowStatement,
  getStatementOfOwnersEquity,
};
