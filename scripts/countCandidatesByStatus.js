require("dotenv").config();
const connectDB = require("../config/connectDB");
const mongoose = require("mongoose");
const Candidate = require("../models/candidateModel");

async function run() {
  await connectDB();
  console.log("Connected. Counting candidates by status...");
  const agg = await Candidate.aggregate([
    {
      $group: { _id: { $ifNull: ["$status", "Unknown"] }, count: { $sum: 1 } },
    },
    { $sort: { count: -1 } },
  ]);
  const total = await Candidate.countDocuments();
  console.log("Total candidates:", total);
  agg.forEach((r) => console.log(`${r._id}: ${r.count}`));
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error("Counting failed", e);
  process.exit(1);
});
