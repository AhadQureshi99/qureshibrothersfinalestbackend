const City = require("../models/cityModel");

// Create city
const createCity = async (req, res) => {
  try {
    const { name } = req.body;

    const city = await City.create({
      name,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      message: "City created successfully",
      city,
    });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "City name already exists" });
    }
    return res.status(500).json({ message: "Server error" });
  }
};

// List cities
const listCities = async (req, res) => {
  try {
    const cities = await City.find()
      .sort({ createdAt: -1 })
      .populate("createdBy", "username email");
    return res.json({ cities });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update city
const updateCity = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, isActive } = req.body;

    const updatedCity = await City.findByIdAndUpdate(
      id,
      { name, isActive },
      { new: true }
    );

    if (!updatedCity) {
      return res.status(404).json({ message: "City not found" });
    }

    return res.json({
      message: "City updated successfully",
      city: updatedCity,
    });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "City name already exists" });
    }
    return res.status(500).json({ message: "Server error" });
  }
};

// Delete city
const deleteCity = async (req, res) => {
  try {
    const { id } = req.params;
    const city = await City.findById(id);

    if (!city) {
      return res.status(404).json({ message: "City not found" });
    }

    await City.findByIdAndDelete(id);
    return res.json({ message: "City deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Toggle active status
const toggleCityStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const city = await City.findById(id);

    if (!city) {
      return res.status(404).json({ message: "City not found" });
    }

    city.isActive = !city.isActive;
    await city.save();

    return res.json({
      message: `City ${
        city.isActive ? "activated" : "deactivated"
      } successfully`,
      city,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createCity,
  listCities,
  updateCity,
  deleteCity,
  toggleCityStatus,
};
