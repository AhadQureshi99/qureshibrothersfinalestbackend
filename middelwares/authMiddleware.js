const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const verifyJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select(
      "-password -otp -otpExpires"
    );

    if (!user) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    console.log(`[DEBUG] Auth check for user ${user.email}:`, {
      isActive: user.isActive,
      verified: user.verified,
    });

    if (!user.isActive) {
      console.log(`[DEBUG] User ${user.email} is inactive, blocking request`);
      return res
        .status(403)
        .json({
          message: "User account is inactive. Please contact administrator.",
        });
    }

    if (!user.verified) {
      return res
        .status(403)
        .json({ message: "Please verify your email first" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

module.exports = verifyJWT;
