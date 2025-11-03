const Airline = require("../models/airlineModel");

// Create airline
const createAirline = async (req, res) => {
  try {
    const { name, description } = req.body;

    const airline = await Airline.create({
      name,
      description,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      message: "Airline created successfully",
      airline,
    });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "Airline name already exists" });
    }
    return res.status(500).json({ message: "Server error" });
  }
};

// List airlines
const listAirlines = async (req, res) => {
  try {
    const airlines = await Airline.find()
      .sort({ createdAt: -1 })
      .populate("createdBy", "username email");
    return res.json({ airlines });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update airline
const updateAirline = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;

    const updatedAirline = await Airline.findByIdAndUpdate(
      id,
      { name, description, isActive },
      { new: true }
    );

    if (!updatedAirline) {
      return res.status(404).json({ message: "Airline not found" });
    }

    return res.json({
      message: "Airline updated successfully",
      airline: updatedAirline,
    });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "Airline name already exists" });
    }
    return res.status(500).json({ message: "Server error" });
  }
};

// Delete airline
const deleteAirline = async (req, res) => {
  try {
    const { id } = req.params;
    const airline = await Airline.findById(id);

    if (!airline) {
      return res.status(404).json({ message: "Airline not found" });
    }

    await Airline.findByIdAndDelete(id);
    return res.json({ message: "Airline deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Toggle active status
const toggleAirlineStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const airline = await Airline.findById(id);

    if (!airline) {
      return res.status(404).json({ message: "Airline not found" });
    }

    airline.isActive = !airline.isActive;
    await airline.save();

    return res.json({
      message: `Airline ${
        airline.isActive ? "activated" : "deactivated"
      } successfully`,
      airline,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createAirline,
  listAirlines,
  updateAirline,
  deleteAirline,
  toggleAirlineStatus,
};
