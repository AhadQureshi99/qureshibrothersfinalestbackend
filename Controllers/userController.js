const User = require("../models/userModel");
const nodemailer = require("nodemailer");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure Uploads directory exists
const uploadDir = path.join(__dirname, "../Uploads/profilePictures");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    console.log("File rejected:", file.originalname, file.mimetype);
    cb(new Error("Only JPEG and PNG images are allowed"));
  },
}).single("profilePicture");

// Multer error handler
const multerErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.log("Multer error:", err.message);
    return res.status(400).json({ message: `Multer error: ${err.message}` });
  } else if (err) {
    console.log("File filter error:", err.message);
    return res.status(400).json({ message: err.message });
  }
  next();
};

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send verification email
const sendVerificationEmail = async (email, otp) => {
  await transporter.sendMail({
    from: `"QureshiBrothers" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify Your Email - QureshiBrothers",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
          .header { text-align: center; padding: 10px 0; }
          .header img { max-width: 150px; }
          .content { padding: 20px; text-align: center; }
          .otp { font-size: 24px; font-weight: bold; color: #2e7d32; margin: 20px 0; }
          .footer { text-align: center; padding: 10px 0; color: #666666; font-size: 12px; }
          .button { display: inline-block; padding: 10px 20px; background-color: #2e7d32; color: #ffffff; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div className="container">
          <div className="header">
            <img src="https://via.placeholder.com/150x50?text=QureshiBrothers+Logo" alt="QureshiBrothers Logo" />
            <h2>Welcome to QureshiBrothers!</h2>
          </div>
          <div className="content">
            <p>Thank you for registering with QureshiBrothers, your trusted partner for job visa services.</p>
            <p>Please use the following OTP to verify your email address:</p>
            <div className="otp">${otp}</div>
            <p>This OTP is valid for 10 minutes.</p>
            <a href="http://localhost:5173/verify-otp" className="button">Verify Now</a>
          </div>
          <div className="footer">
            <p>&copy; 2025 QureshiBrothers. All rights reserved.</p>
            <p>Contact us at support@qureshibrothers.com | +92-123-456-7890</p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
};

// Send forgot password email
const sendForgotPasswordEmail = async (email, otp) => {
  await transporter.sendMail({
    from: `"QureshiBrothers" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Password Reset Request - QureshiBrothers",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
          .header { text-align: center; padding: 10px 0; }
          .header img { max-width: 150px; }
          .content { padding: 20px; text-align: center; }
          .otp { font-size: 24px; font-weight: bold; color: #2e7d32; margin: 20px 0; }
          .footer { text-align: center; padding: 10px 0; color: #666666; font-size: 12px; }
          .button { display: inline-block; padding: 10px 20px; background-color: #2e7d32; color: #ffffff; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div className="container">
          <div className="header">
            <img src="https://via.placeholder.com/150x50?text=QureshiBrothers+Logo" alt="QureshiBrothers Logo" />
            <h2>Password Reset Request</h2>
          </div>
          <div className="content">
            <p>We received a request to reset your password for your QureshiBrothers account.</p>
            <p>Please use the following OTP to reset your password:</p>
            <div className="otp">${otp}</div>
            <p>This OTP is valid for 10 minutes.</p>
            <a href="http://localhost:5173/reset-password" className="button">Reset Password</a>
          </div>
          <div className="footer">
            <p>&copy; 2025 QureshiBrothers. All rights reserved.</p>
            <p>Contact us at support@qureshibrothers.com | +92-123-456-7890</p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
};

// Register User
const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide username, email, and password" });
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters, including uppercase, lowercase, number, and special character",
      });
    }

    const findUser = await User.findOne({ email });
    if (findUser && findUser.verified) {
      return res
        .status(400)
        .json({ message: "Email already exists, please proceed to login" });
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

    let user;
    if (findUser && !findUser.verified) {
      findUser.username = username;
      findUser.password = password;
      findUser.otp = otp;
      findUser.otpExpires = otpExpires;
      await findUser.save();
      user = findUser;
    } else {
      user = await User.create({
        username,
        email,
        password,
        otp,
        otpExpires,
        verified: false,
      });
    }

    await sendVerificationEmail(email, otp);

    const createdUser = await User.findById(user._id).select(
      "-password -otp -otpExpires"
    );
    res.status(200).json({
      message: "User registered, please verify OTP sent to your email",
      user: createdUser,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Resend OTP
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.verified) {
      return res.status(400).json({ message: "User already verified" });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendVerificationEmail(email, otp);

    res.status(200).json({
      message: "OTP resent successfully to your email",
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Verify OTP
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.verified) {
      return res.status(400).json({ message: "User already verified" });
    }

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.verified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const accessToken = user.generateAccessToken();
    const verifiedUser = await User.findById(user._id).select(
      "-password -otp -otpExpires"
    );

    res.status(200).json({
      message: "OTP verified successfully",
      user: verifiedUser,
      token: accessToken,
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: !email ? "Email is required" : "Password is required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User does not exist" });
    }

    console.log(`[DEBUG] Login attempt for user ${email}:`, {
      isActive: user.isActive,
      verified: user.verified,
    });

    if (!user.isActive) {
      console.log(`[DEBUG] User ${email} is inactive, blocking login`);
      return res.status(403).json({
        message: "User account is inactive. Please contact administrator.",
      });
    }

    if (!user.verified) {
      return res
        .status(403)
        .json({ message: "Please verify your email first" });
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    console.log(`[DEBUG] Login successful for user ${email}`);
    const accessToken = user.generateAccessToken();
    const loggedInUser = await User.findById(user._id).select(
      "-password -otp -otpExpires"
    );

    res.status(200).json({
      message: "Login successful",
      user: loggedInUser,
      token: accessToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Forgot Password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendForgotPasswordEmail(email, otp);

    res.status(200).json({
      message: "Password reset OTP sent to your email",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res
        .status(400)
        .json({ message: "Email, OTP, and new password are required" });
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          "New password must be at least 8 characters, including uppercase, lowercase, number, and special character",
      });
    }

    const user = await User.findOne({
      email,
      otp,
      otpExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.password = newPassword;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Upload Profile Picture
const uploadProfilePicture = async (req, res) => {
  try {
    console.log("Request headers:", req.headers);
    console.log("Request body:", req.body);
    console.log("Request file:", req.file);
    const userId = req.user.id;
    console.log("Authenticated user:", req.user);
    if (!req.file) {
      console.log("No file uploaded in request");
      return res.status(400).json({ message: "No file uploaded" });
    }

    const filename = req.file.filename;
    console.log("File uploaded:", filename);

    const user = await User.findById(userId);
    if (!user) {
      console.log("User not found for ID:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    user.profilePicture = filename;
    await user.save();
    console.log(
      "User updated with profile picture filename:",
      user.profilePicture
    );

    const updatedUser = await User.findById(user._id).select(
      "-password -otp -otpExpires"
    );

    res.status(200).json({
      message: "Profile picture uploaded successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  verifyOTP,
  resendOTP,
  forgotPassword,
  resetPassword,
  uploadProfilePicture,
  multerErrorHandler,
  // Export multer upload middleware so routes can apply it before the handler
  upload,
};

// ---------- Superadmin utilities ----------
// Create an admin user (only accessible by superadmin)
const createAdmin = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      role,
      firstName,
      lastName,
      fatherName,
      contactNo,
      cnic,
    } = req.body;
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "username, email and password are required" });
    }
    // Only superadmin can create admins - middleware should enforce but re-check here
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already in use" });
    const admin = await User.create({
      username,
      email,
      password,
      role: role || "admin",
      verified: true,
      firstName,
      lastName,
      fatherName,
      contactNo,
      cnic,
    });
    const safe = await User.findById(admin._id).select(
      "-password -otp -otpExpires"
    );
    res.status(201).json({ message: "Admin created", user: safe });
  } catch (error) {
    console.error("createAdmin error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Update user's permissions (accessible only by superadmin)
const updateUserPermissions = async (req, res) => {
  try {
    const { id } = req.params; // user id
    const { permissions } = req.body; // permissions object
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    // Update permissions object
    user.permissions = permissions || {};
    await user.save();
    const safe = await User.findById(user._id).select(
      "-password -otp -otpExpires"
    );
    res.status(200).json({ message: "Permissions updated", user: safe });
  } catch (error) {
    console.error("updateUserPermissions error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Export new controllers
module.exports.createAdmin = createAdmin;
module.exports.updateUserPermissions = updateUserPermissions;

// List all users (superadmin only)
const listAllUsers = async (req, res) => {
  try {
    if (req.user.role !== "superadmin")
      return res.status(403).json({ message: "Forbidden" });
    const users = await User.find()
      .select("-password -otp -otpExpires")
      .populate("roleId", "name permissions");
    res.status(200).json({ users });
  } catch (error) {
    console.error("listAllUsers error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports.listAllUsers = listAllUsers;

// Normalize permittedPages for all users (superadmin only)
const normalizePermissionsForAllUsers = async (req, res) => {
  try {
    if (req.user.role !== "superadmin")
      return res.status(403).json({ message: "Forbidden" });
    const users = await User.find();
    const updates = [];
    for (const u of users) {
      const perms = Array.isArray(u.permittedPages) ? u.permittedPages : [];
      const normalized = perms
        .map((p) => {
          if (!p) return "";
          let s = String(p).trim().toLowerCase();
          if (!s.startsWith("/")) s = "/" + s;
          return s;
        })
        .filter(Boolean);
      u.permittedPages = normalized;
      updates.push(u.save());
    }
    await Promise.all(updates);
    res.status(200).json({ message: "Permissions normalized for all users" });
  } catch (error) {
    console.error("normalizePermissionsForAllUsers error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports.normalizePermissionsForAllUsers =
  normalizePermissionsForAllUsers;

// Update user details (superadmin only)
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      username,
      email,
      role,
      roleId,
      permissions,
      firstName,
      lastName,
      fatherName,
      contactNo,
      cnic,
    } = req.body;
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (username) user.username = username;
    if (email) user.email = email;
    if (role) user.role = role;
    if (roleId) user.roleId = roleId;
    if (permissions) user.permissions = permissions;
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (fatherName !== undefined) user.fatherName = fatherName;
    if (contactNo !== undefined) user.contactNo = contactNo;
    if (cnic !== undefined) user.cnic = cnic;
    await user.save();
    const safe = await User.findById(user._id)
      .select("-password -otp -otpExpires")
      .populate("roleId");
    res.status(200).json({ message: "User updated", user: safe });
  } catch (error) {
    console.error("updateUser error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports.updateUser = updateUser;

// Delete user (superadmin only)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    await User.findByIdAndDelete(id);
    res.status(200).json({ message: "User deleted" });
  } catch (error) {
    console.error("deleteUser error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports.deleteUser = deleteUser;

// Toggle user status (superadmin only)
const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    let { isActive } = req.body;

    // Ensure isActive is a boolean
    isActive = Boolean(isActive);

    console.log(
      `[DEBUG] Toggle request received - ID: ${id}, isActive param: ${isActive}`
    );

    if (req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Fetch the user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log(`[DEBUG] Current user status: isActive=${user.isActive}`);
    console.log(`[DEBUG] Setting new status to: isActive=${isActive}`);

    // Update the isActive field
    user.isActive = isActive;

    // Save to database
    await user.save();

    console.log(`[DEBUG] After save: isActive=${user.isActive}`);

    // Fetch fresh from DB to confirm
    const updatedUser = await User.findById(id).select(
      "-password -otp -otpExpires"
    );
    console.log(
      `[DEBUG] Fresh from DB: email=${updatedUser.email}, isActive=${updatedUser.isActive}`
    );

    res.status(200).json({
      message: "Status updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("[ERROR] toggleUserStatus error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports.toggleUserStatus = toggleUserStatus;

// Get user logs report
const getUserLogs = async (req, res) => {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res
        .status(400)
        .json({ message: "From and To dates are required" });
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999); // Include the entire toDate

    const users = await User.find({
      createdAt: { $gte: fromDate, $lte: toDate },
    }).select("-password -otp -otpExpires");

    res.status(200).json(users);
  } catch (error) {
    console.error("getUserLogs error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports.getUserLogs = getUserLogs;
