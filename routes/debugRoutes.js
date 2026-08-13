const express = require("express");
const router = express.Router();
const ctrl = require("../Controllers/debugController");

router.get("/health", ctrl.healthCheck);

module.exports = router;
