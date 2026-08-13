const mongoose = require("mongoose");
const Candidate = require("../models/candidateModel");

// GET /api/debug/health
const healthCheck = async (req, res) => {
  try {
    // optional debug key protection
    const debugKey = process.env.DEBUG_KEY;
    if (debugKey) {
      const provided = req.headers["x-debug-key"] || req.query.key;
      if (!provided || provided !== debugKey) {
        return res
          .status(403)
          .json({ message: "Forbidden: invalid debug key" });
      }
    }

    const readyState = mongoose.connection.readyState; // 0 disconnected,1 connected
    let candidateCount = null;
    try {
      candidateCount = await Candidate.countDocuments();
    } catch (e) {
      candidateCount = `error: ${e.message}`;
    }

    return res.json({ dbReadyState: readyState, candidateCount });
  } catch (err) {
    console.error("healthCheck error", err);
    return res.status(500).json({ message: err.message });
  }
};

module.exports = {
  healthCheck,
};
