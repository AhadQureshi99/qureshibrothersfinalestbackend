const Role = require("../models/roleModel");
const asyncHandler = require("express-async-handler");

// Get all roles
const getAllRoles = asyncHandler(async (req, res) => {
  const roles = await Role.find({});
  res.status(200).json(roles);
});

// Create a new role
const createRole = asyncHandler(async (req, res) => {
  const { name, permissions } = req.body;

  if (!name) {
    res.status(400);
    throw new Error("Role name is required");
  }

  const roleExists = await Role.findOne({ name: name.toLowerCase() });
  if (roleExists) {
    res.status(400);
    throw new Error("Role already exists");
  }

  const role = await Role.create({
    name: name.toLowerCase(),
    permissions: permissions || {},
  });

  res.status(201).json(role);
});

// Update a role
const updateRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, permissions } = req.body;

  const role = await Role.findById(id);
  if (!role) {
    res.status(404);
    throw new Error("Role not found");
  }

  if (name) {
    const roleExists = await Role.findOne({
      name: name.toLowerCase(),
      _id: { $ne: id },
    });
    if (roleExists) {
      res.status(400);
      throw new Error("Role name already exists");
    }
    role.name = name.toLowerCase();
  }

  if (permissions) {
    role.permissions = permissions;
  }

  await role.save();
  res.status(200).json(role);
});

// Delete a role
const deleteRole = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const role = await Role.findById(id);
  if (!role) {
    res.status(404);
    throw new Error("Role not found");
  }

  await Role.findByIdAndDelete(id);
  res.status(200).json({ message: "Role deleted successfully" });
});

module.exports = {
  getAllRoles,
  createRole,
  updateRole,
  deleteRole,
};
