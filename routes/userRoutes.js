const express = require("express");
const {
  registerUser,
  loginUser,
  verifyOTP,
  resendOTP,
  forgotPassword,
  resetPassword,
  uploadProfilePicture,
  multerErrorHandler,
  upload,
  createAdmin,
  updateUserPermissions,
  listAllUsers,
  normalizePermissionsForAllUsers,
  updateUser,
  deleteUser,
  toggleUserStatus,
  getUserLogs,
} = require("../Controllers/userController");
const verifyJWT = require("../middelwares/authMiddleware");

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/me", verifyJWT, (req, res) => {
  res.status(200).json({
    message: "User is authenticated",
    user: req.user,
  });
});
userRouter.post("/verify-otp", verifyOTP);
userRouter.post("/resend-otp", resendOTP);
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/reset-password", resetPassword);
userRouter.post(
  "/upload-profile-picture",
  verifyJWT,
  upload,
  uploadProfilePicture,
  multerErrorHandler
);

// Superadmin routes
userRouter.post("/create-admin", verifyJWT, createAdmin);
userRouter.put("/users/:id/permissions", verifyJWT, updateUserPermissions);
userRouter.put("/users/:id", verifyJWT, updateUser);
userRouter.delete("/users/:id", verifyJWT, deleteUser);
userRouter.patch("/users/:id/status", verifyJWT, toggleUserStatus);

// List all users (superadmin only)
userRouter.get("/", verifyJWT, listAllUsers);
// Utility: normalize permissions for all users (superadmin only)
userRouter.post(
  "/normalize-permissions",
  verifyJWT,
  normalizePermissionsForAllUsers
);

// Get user logs report
userRouter.get("/logs", verifyJWT, getUserLogs);

module.exports = userRouter;
