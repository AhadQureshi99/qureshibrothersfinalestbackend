const mongoose = require("mongoose");
const Expense = require("./models/expenseModel");
const User = require("./models/userModel");
require("dotenv").config();

async function fixExpenses() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Get all expenses
    const expenses = await Expense.find();
    console.log(`Found ${expenses.length} expenses`);

    let fixed = 0;
    let orphaned = 0;

    // Check each expense
    for (const expense of expenses) {
      if (expense.createdBy) {
        const user = await User.findById(expense.createdBy);
        if (!user) {
          console.log(
            `Orphaned expense: ${expense._id} - createdBy user not found`
          );
          // Set createdBy to null for orphaned references
          await Expense.findByIdAndUpdate(expense._id, { createdBy: null });
          orphaned++;
        }
      }
    }

    console.log(`Fixed ${orphaned} orphaned expenses`);
    console.log("Done!");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

fixExpenses();
