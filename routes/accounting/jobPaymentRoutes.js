const express = require("express");
const router = express.Router();
const {
  getJobPayments,
  createJobPayment,
  updateJobPayment,
  deleteJobPayment,
} = require("../../Controllers/accounting/jobPaymentController");
const verifyJWT = require("../../middelwares/authMiddleware");

router
  .route("/")
  .get(verifyJWT, getJobPayments)
  .post(verifyJWT, createJobPayment);
router
  .route("/:id")
  .put(verifyJWT, updateJobPayment)
  .delete(verifyJWT, deleteJobPayment);

module.exports = router;
