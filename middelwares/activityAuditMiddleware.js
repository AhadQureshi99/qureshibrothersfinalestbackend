const { createLog } = require("../Controllers/activityLogController");

// Used on modules that do not create their own detailed activity records.
// It writes only after a successful request, so failed requests never appear in the report.
const activityAudit = (moduleName) => (req, res, next) => {
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) return next();

  res.on("finish", () => {
    if (res.statusCode < 200 || res.statusCode >= 300 || !req.user) return;

    const actions = { POST: "created", PUT: "updated", PATCH: "updated", DELETE: "deleted" };
    const action = actions[req.method];
    const body = req.body || {};
    const recordName =
      body.name || body.accountName || body.description || body.reference ||
      body.voucherNo || body.vouNumber || body.code || req.params.id || "record";
    const performedBy = req.user.username || req.user.email || "System";

    createLog({
      action,
      entityType: moduleName,
      entityId: req.params.id,
      entityName: String(recordName),
      description: `${performedBy} ${action} ${moduleName}: ${recordName}`,
      performedBy,
      performedById: req.user._id,
      meta: { method: req.method, route: req.originalUrl, amount: body.amount },
    });
  });

  next();
};

module.exports = activityAudit;
