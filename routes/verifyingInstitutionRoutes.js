const express = require("express");
const router = express.Router();
const verifyJWT = require("../middelwares/authMiddleware");
const ctrl = require("../Controllers/verifyingInstitutionController");

// Verifying Institution routes
router.post("/", verifyJWT, ctrl.createVerifyingInstitution);
router.get("/", verifyJWT, ctrl.listVerifyingInstitutions);
router.put("/:id", verifyJWT, ctrl.updateVerifyingInstitution);
router.delete("/:id", verifyJWT, ctrl.deleteVerifyingInstitution);
router.patch(
  "/:id/toggle-status",
  verifyJWT,
  ctrl.toggleVerifyingInstitutionStatus
);

module.exports = router;
