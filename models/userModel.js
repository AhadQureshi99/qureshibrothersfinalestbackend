const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin", "hr", "accountant", "superadmin"],
      default: "user",
    },
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      default: null,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
    },
    otpExpires: {
      type: Date,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
    profilePicture: {
      type: String,
      default: "https://via.placeholder.com/150?text=Default+Profile",
    },
    // Pages this user is allowed to access in the sidebar (e.g. ['/dashboard','/expense'])
    permittedPages: {
      type: [String],
      default: [],
    },
    // Detailed permissions object for granular access control
    permissions: {
      type: Object,
      default: {},
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    fatherName: {
      type: String,
    },
    contactNo: {
      type: String,
    },
    cnic: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to check password
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Method to generate JWT token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      username: this.username,
      role: this.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "15d" }
  );
};

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
