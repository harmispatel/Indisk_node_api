const mongoose = require("mongoose");

const restaurantOwnerSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AdminUsers",
    required: true,
  },
  restaurant_name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  contact: {
    type: Number,
    required: true,
  },
  logo: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  tagLine: {
    type: String,
  },
  isActive: {
    type: String,
    required: true,
  },
  website_link: {
    type: String,
  },
});

const RestaurantOwner = mongoose.model(
  "restaurantOwner",
  restaurantOwnerSchema
);

module.exports = RestaurantOwner;
