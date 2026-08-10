const hasPermission = (user, module, item, action = "view") =>
  user?.role === "superadmin" ||
  user?.permissions?.[module]?.[item]?.[action] === true;

const requirePermission = (module, item, action) => (req, res, next) => {
  if (hasPermission(req.user, module, item, action)) return next();
  return res.status(403).json({ message: "You don't have permission for this action" });
};

const requireAnyEmployeeView = (req, res, next) => {
  if (req.user?.role === "superadmin") return next();
  const permissions = req.user?.permissions?.employeeManagement || {};
  if (Object.values(permissions).some((permission) => permission?.view === true)) {
    return next();
  }
  return res.status(403).json({ message: "You don't have permission to view employee data" });
};

const requireEitherPermission = (module, item, actions) => (req, res, next) => {
  if (actions.some((action) => hasPermission(req.user, module, item, action))) return next();
  return res.status(403).json({ message: "You don't have permission for this action" });
};

module.exports = { requirePermission, requireAnyEmployeeView, requireEitherPermission };
