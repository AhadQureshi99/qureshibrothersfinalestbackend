const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const travelAgentSchema = new mongoose.Schema(
  {
    // Auto-generated agent code kept for existing integrations (payments/ledgers)
    code: { type: String, unique: true, sparse: true },
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    logo: { type: String }, // Path to logo image
    password: {
      type: String,
      required: true,
      select: false, // never returned by default in queries
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Pre-save hook to hash password
travelAgentSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to check password
travelAgentSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports =
  mongoose.models.TravelAgent ||
  mongoose.model("TravelAgent", travelAgentSchema);

