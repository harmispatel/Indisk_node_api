const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://vanshpatel:qwertyu12345@cluster0.hbl8o.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed", error);
    process.exit(1);
  }
};

module.exports = connectDB;
