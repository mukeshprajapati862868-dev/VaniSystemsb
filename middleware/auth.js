const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ===============================
// Protect Routes Middleware
// ===============================
const protect = async (req, res, next) => {
  try {
    let token = null;

    // Read token from Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Not authorized, no token",
      });
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");

    // Find user in MongoDB
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User not found",
      });
    }

    // Validation Status Rules
    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        error: "User account is deactivated",
      });
    }

    if (user.isBlocked === true) {
      return res.status(403).json({
        success: false,
        error: "User account is blocked",
      });
    }

    req.user = {
      id: user._id,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      isBlocked: user.isBlocked
    };

    next();
  } catch (err) {
    console.error("Auth Error:", err);

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: "Token expired",
      });
    }

    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        error: "Invalid token",
      });
    }

    return res.status(500).json({
      success: false,
      error: "Authentication failed",
    });
  }
};

// ===============================
// Admin Authorization Check
// ===============================
const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized",
    });
  }

  if (req.user.role !== "admin" && req.user.role !== "Admin") {
    return res.status(403).json({
      success: false,
      error: "Admin access required",
    });
  }

  next();
};

// ===============================
// Token Creation Helpers
// ===============================
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || "fallback_secret",
    {
      expiresIn: process.env.JWT_EXPIRE || "7d",
    }
  );
};

const generateRefreshToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_REFRESH_SECRET || "fallback_refresh_secret",
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRE || "30d",
    }
  );
};

module.exports = {
  protect,
  adminOnly,
  generateToken,
  generateRefreshToken,
};
