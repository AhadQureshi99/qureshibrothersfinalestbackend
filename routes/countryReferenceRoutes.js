const express = require("express");
const verifyJWT = require("../middelwares/authMiddleware");
const {
  getCountriesAndNationalities,
} = require("../Controllers/countryReferenceController");

const router = express.Router();

router.get("/", verifyJWT, getCountriesAndNationalities);

module.exports = router;
