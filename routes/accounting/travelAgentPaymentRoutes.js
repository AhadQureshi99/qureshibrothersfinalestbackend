const express = require("express");
const router = express.Router();
const {
  getTravelAgentPayments,
  createTravelAgentPayment,
  updateTravelAgentPayment,
  deleteTravelAgentPayment,
  getNextVouNumber,
} = require("../../Controllers/accounting/travelAgentPaymentController");
const verifyJWT = require("../../middelwares/authMiddleware");

router
  .route("/")
  .get(verifyJWT, getTravelAgentPayments)
  .post(verifyJWT, createTravelAgentPayment);
router.route("/next-vou-number").get(verifyJWT, getNextVouNumber);
router
  .route("/:id")
  .put(verifyJWT, updateTravelAgentPayment)
  .delete(verifyJWT, deleteTravelAgentPayment);

module.exports = router;
