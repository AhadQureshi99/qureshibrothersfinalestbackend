const express = require("express");
const router = express.Router();
const {
  listCities,
  createCity,
  updateCity,
  deleteCity,
  toggleCityStatus,
} = require("../Controllers/cityController");
const protect = require("../middelwares/authMiddleware");

router.use(protect);

router.route("/").get(listCities).post(createCity);

router.route("/:id").put(updateCity).delete(deleteCity);

router.patch("/:id/toggle-status", toggleCityStatus);

module.exports = router;
