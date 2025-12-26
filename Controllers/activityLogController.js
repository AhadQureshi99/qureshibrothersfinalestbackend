const ActivityLog = require("../models/activityLogModel");

// Create a new activity log entry
exports.createLog = async ({
  action,
  entityType,
  entityId,
  entityName,
  description,
  performedBy,
  performedById,
  meta,
}) => {
  try {
    await ActivityLog.create({
      action,
      entityType,
      entityId,
      entityName,
      description,
      performedBy,
      performedById,
      meta,
    });
  } catch (err) {
    // Optionally log error to a file or monitoring system
    console.error("Failed to create activity log:", err);
  }
};

// Get recent activity logs (optionally filter by entityType, limit, etc.)
exports.getRecentLogs = async (req, res) => {
  try {
    const { limit = 30, entityType } = req.query;
    const filter = entityType ? { entityType } : {};
    const logs = await ActivityLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit));
    res.status(200).json(logs);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch activity logs", error: err.message });
  }
};
