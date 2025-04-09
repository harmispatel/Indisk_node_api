const Restaurant = require("../models/RestaurantOwner");

const getRestaurantOwner = async (req, res) => {
  try {
    const restaurants = await Restaurant.find();
    res.status(200).json({
      message: "Restaurants owner fetched successfully",
      success: true,
      data: restaurants,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to retrieve restaurants owner",
      success: false,
      error: err.message,
    });
  }
};

const createRestaurantOwner = async (req, res) => {
  const {
    restaurant_name,
    email,
    contact,
    description,
    tagLine,
    isActive,
    website_link,
  } = req.body;

  const logo = req.file ? req.file.filename : null;

  if ((!restaurant_name, !email, !contact, !logo, !isActive)) {
    return res.status(400).json({
      message: "Please provide restaurant_name, email, contact, logo, isActive",
      success: false,
    });
  }

  try {
    const existingRestaurant = await Restaurant.findOne({ email });
    if (existingRestaurant) {
      return res.status(400).json({
        message: "Restaurant owner with this email already exists",
        success: false,
      });
    }

    const existingRestaurantNumber = await Restaurant.findOne({ contact });
    if (existingRestaurantNumber) {
      return res.status(400).json({
        message: "Restaurant owner with this contact already exists",
        success: false,
      });
    }

    const newRestaurant = new Restaurant({
      restaurant_name,
      email,
      contact,
      logo: `${process.env.FRONTEND_URL}/uploads/${logo}`,
      description,
      tagLine,
      isActive,
      website_link,
    });

    await newRestaurant.save();

    res.status(201).json({
      message: "Restaurant owner created successfully",
      success: true,
      data: newRestaurant,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to create restaurant owner",
      success: false,
      error: err.message,
    });
  }
};

const updateRestaurantOwner = async (req, res) => {
  const {
    id,
    restaurant_name,
    email,
    contact,
    description,
    tagLine,
    website_link,
    isActive,
  } = req.body;

  const logo = req.file
    ? `${process.env.FRONTEND_URL}/uploads/${req.file.filename}`
    : null;

  if ((!restaurant_name, !email, !contact, !logo, !isActive)) {
    return res.status(400).json({
      message: "Please provide restaurant_name, email, contact, logo, isActive",
      success: false,
    });
  }

  try {
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res.status(404).json({
        message: "Restaurant owner not found",
        success: false,
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    const duplicate = await Restaurant.findOne({
      _id: { $ne: id },
      $or: [{ email }],
    });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "Email already in use",
      });
    }

    if (restaurant_name) restaurant.restaurant_name = restaurant_name;
    if (email) restaurant.email = email;
    if (contact) restaurant.contact = contact;
    if (logo) restaurant.logo = logo;
    if (description) restaurant.description = description;
    if (tagLine) restaurant.tagLine = tagLine;
    if (website_link) restaurant.website_link = website_link;
    if (isActive) restaurant.isActive = isActive;

    await restaurant.save();

    res.status(200).json({
      message: "Restaurant owner updated successfully",
      success: true,
      data: {
        restaurant_name: restaurant.restaurant_name,
        email: restaurant.email,
        contact: restaurant.contact,
        logo: restaurant.logo,
        description: restaurant.description,
        tagLine: restaurant.tagLine,
        isActive: restaurant.isActive,
        website_link: restaurant.website_link,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to update restaurant owner",
      success: false,
      error: err.message,
    });
  }
};

const deleteRestaurantOwner = async (req, res) => {
  const { id } = req.body;

  try {
    const restaurant = await Restaurant.findByIdAndDelete(id);

    if (!restaurant) {
      return res.status(404).json({
        message: "Restaurant owner not found",
        success: false,
      });
    }
    res.status(200).json({
      message: "Restaurant owner deleted successfully",
      success: true,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to delete restaurant owner",
      success: false,
      error: err.message,
    });
  }
};

module.exports = {
  getRestaurantOwner,
  createRestaurantOwner,
  updateRestaurantOwner,
  deleteRestaurantOwner,
};
