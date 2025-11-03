const mongoose = require("mongoose");

const verifyingInstitutionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.VerifyingInstitution ||
  mongoose.model("VerifyingInstitution", verifyingInstitutionSchema);
