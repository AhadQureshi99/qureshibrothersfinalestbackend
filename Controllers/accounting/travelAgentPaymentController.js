const TravelAgentPayment = require("../../models/accounting/travelAgentPaymentModel");
const TravelAgent = require("../../models/travelAgentModel");
const asyncHandler = require("express-async-handler");

// @desc    Get all travel agent payments
// @route   GET /api/accounting/travel-agent-payments
// @access  Private
const getTravelAgentPayments = asyncHandler(async (req, res) => {
  const travelAgentPayments = await TravelAgentPayment.find()
    .populate("payments.agent", "name code")
    .populate("createdBy", "name")
    .sort({ createdAt: -1 });

  res.status(200).json(travelAgentPayments);
});

// @desc    Create a new travel agent payment
// @route   POST /api/accounting/travel-agent-payments
// @access  Private
const createTravelAgentPayment = asyncHandler(async (req, res) => {
  const { vouNumber, date, accountCode, payments } = req.body;

  if (
    !vouNumber ||
    !date ||
    !accountCode ||
    !payments ||
    payments.length === 0
  ) {
    res.status(400);
    throw new Error("Please provide all required fields");
  }

  // Validate that all agents exist
  for (const payment of payments) {
    const agent = await TravelAgent.findById(payment.agent);
    if (!agent) {
      res.status(400);
      throw new Error(`Travel agent with ID ${payment.agent} not found`);
    }
  }

  const travelAgentPayment = await TravelAgentPayment.create({
    vouNumber,
    date,
    accountCode,
    payments,
    createdBy: req.user.id,
  });

  const populatedPayment = await TravelAgentPayment.findById(
    travelAgentPayment._id
  )
    .populate("payments.agent", "name code")
    .populate("createdBy", "name");

  res.status(201).json(populatedPayment);
});

// @desc    Update a travel agent payment
// @route   PUT /api/accounting/travel-agent-payments/:id
// @access  Private
const updateTravelAgentPayment = asyncHandler(async (req, res) => {
  const { vouNumber, date, accountCode, payments } = req.body;

  const travelAgentPayment = await TravelAgentPayment.findById(req.params.id);

  if (!travelAgentPayment) {
    res.status(404);
    throw new Error("Travel agent payment not found");
  }

  // Check if user owns the payment or is admin
  if (
    travelAgentPayment.createdBy.toString() !== req.user.id &&
    req.user.role !== "admin"
  ) {
    res.status(401);
    throw new Error("Not authorized to update this payment");
  }

  // Validate that all agents exist
  for (const payment of payments) {
    const agent = await TravelAgent.findById(payment.agent);
    if (!agent) {
      res.status(400);
      throw new Error(`Travel agent with ID ${payment.agent} not found`);
    }
  }

  travelAgentPayment.vouNumber = vouNumber || travelAgentPayment.vouNumber;
  travelAgentPayment.date = date || travelAgentPayment.date;
  travelAgentPayment.accountCode =
    accountCode || travelAgentPayment.accountCode;
  travelAgentPayment.payments = payments || travelAgentPayment.payments;
  travelAgentPayment.updatedAt = Date.now();

  const updatedPayment = await travelAgentPayment.save();

  const populatedPayment = await TravelAgentPayment.findById(updatedPayment._id)
    .populate("payments.agent", "name code")
    .populate("createdBy", "name");

  res.status(200).json(populatedPayment);
});

// @desc    Delete a travel agent payment
// @route   DELETE /api/accounting/travel-agent-payments/:id
// @access  Private
const deleteTravelAgentPayment = asyncHandler(async (req, res) => {
  const travelAgentPayment = await TravelAgentPayment.findById(req.params.id);

  if (!travelAgentPayment) {
    res.status(404);
    throw new Error("Travel agent payment not found");
  }

  // Check if user owns the payment or is admin
  if (
    travelAgentPayment.createdBy.toString() !== req.user.id &&
    req.user.role !== "admin"
  ) {
    res.status(401);
    throw new Error("Not authorized to delete this payment");
  }

  await TravelAgentPayment.findByIdAndDelete(req.params.id);

  res
    .status(200)
    .json({ message: "Travel agent payment deleted successfully" });
});

// @desc    Get next voucher number
// @route   GET /api/accounting/travel-agent-payments/next-vou-number
// @access  Private
const getNextVouNumber = asyncHandler(async (req, res) => {
  const lastPayment = await TravelAgentPayment.findOne().sort({
    vouNumber: -1,
  });

  let nextNumber = 1;
  if (lastPayment && lastPayment.vouNumber) {
    const lastNumber = parseInt(lastPayment.vouNumber);
    nextNumber = lastNumber + 1;
  }

  res.status(200).json({ nextVouNumber: nextNumber.toString() });
});

module.exports = {
  getTravelAgentPayments,
  createTravelAgentPayment,
  updateTravelAgentPayment,
  deleteTravelAgentPayment,
  getNextVouNumber,
};
