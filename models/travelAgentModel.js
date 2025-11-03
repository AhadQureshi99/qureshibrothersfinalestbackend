const mongoose = require("mongoose");

const travelAgentSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    location: { type: String, required: true },
    airlinesDealsWith: { type: String, required: true },
    primaryEmail: { type: String },
    secondaryEmail: { type: String },
    primaryPhone: { type: String },
    secondaryPhone: { type: String },
    address: { type: String },
    files: [{ type: String }], // Array of file paths
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.TravelAgent ||
  mongoose.model("TravelAgent", travelAgentSchema);
