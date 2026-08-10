const express = require("express");
const router = express.Router();
const verifyJWT = require("../middelwares/authMiddleware");
const ctrl = require("../Controllers/airlineController");

// Airline routes
router.post("/", verifyJWT, ctrl.createAirline);
router.get("/", verifyJWT, ctrl.listAirlines);
router.put("/:id", verifyJWT, ctrl.updateAirline);
router.delete("/:id", verifyJWT, ctrl.deleteAirline);
router.patch("/:id/toggle-status", verifyJWT, ctrl.toggleAirlineStatus);

module.exports = router;
