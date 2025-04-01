const mongoose = require("mongoose");

const AuthData = mongoose.model(
  "AdminUsers",
  new mongoose.Schema({
    email: String,
    password: String,
    createdAt: { type: Date, default: Date.now },
  })
);

module.exports = AuthData;
