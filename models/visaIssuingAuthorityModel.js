const mongoose = require("mongoose");

const visaIssuingAuthoritySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.VisaIssuingAuthority ||
  mongoose.model("VisaIssuingAuthority", visaIssuingAuthoritySchema);
