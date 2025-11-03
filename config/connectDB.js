const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoUrl = process.env.MONGO_URL;
  if (!mongoUrl) {
    console.error(
      "MONGO_URL is not set in environment variables. Cannot connect to database."
    );
    process.exit(1);
  }
  await mongoose.connect(mongoUrl);
  console.log(`Database connected on host: ${mongoose.connection.host}`);
};

module.exports = connectDB;
