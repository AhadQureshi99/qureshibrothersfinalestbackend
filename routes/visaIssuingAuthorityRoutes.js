const express = require("express");
const router = express.Router();
const verifyJWT = require("../middelwares/authMiddleware");
const ctrl = require("../Controllers/visaIssuingAuthorityController");

// Visa Issuing Authority routes
router.post("/", verifyJWT, ctrl.createVisaIssuingAuthority);
router.get("/", verifyJWT, ctrl.listVisaIssuingAuthorities);
router.put("/:id", verifyJWT, ctrl.updateVisaIssuingAuthority);
router.delete("/:id", verifyJWT, ctrl.deleteVisaIssuingAuthority);
router.patch(
  "/:id/toggle-status",
  verifyJWT,
  ctrl.toggleVisaIssuingAuthorityStatus
);

module.exports = router;
