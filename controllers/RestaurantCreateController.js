const Restaurant = require("../models/RestaurantCreate");
const UserAuth = require("../models/authLogin");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const getRestaurant = async (req, res) => {
  try {
    const { user_id } = req.body;

    const userExists = await UserAuth.findById(user_id);
    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const restaurants = await Restaurant.find({ user_id });
    res.status(200).json({
      message: "Restaurants fetched successfully",
      success: true,
      data: restaurants,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to retrieve restaurants",
      success: false,
      error: err.message,
    });
  }
};

const createRestaurant = async (req, res) => {
  try {
    const {
      user_id,
      restaurant_name,
      email,
      contact,
      description,
      tagLine,
      isActive,
      website_link,
    } = req.body;

    const userExists = await UserAuth.findById(user_id);
    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const emailExists = await Restaurant.findOne({ email });
    if (emailExists) {
      return res.status(400).json({
        message: "Restaurant with this email already exists",
        success: false,
      });
    }

    const contactExists = await Restaurant.findOne({ contact });
    if (contactExists) {
      return res.status(400).json({
        message: "Restaurant with this contact already exists",
        success: false,
      });
    }

    const uniqueId = crypto.randomBytes(2).toString("hex");
    const fileName = `${uniqueId}${path.extname(req.file.originalname)}`;
    const uploadDir = path.join(__dirname, "../uploads");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, req.file.buffer);

    const newRestaurant = new Restaurant({
      user_id,
      restaurant_name,
      email,
      contact,
      logo: `${process.env.FRONTEND_URL}/uploads/${fileName}`,
      description,
      tagLine,
      isActive,
      website_link,
    });

    await newRestaurant.save();

    res.status(201).json({
      message: "Restaurant created successfully",
      success: true,
      data: newRestaurant,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to create restaurant",
      success: false,
      error: err.message,
    });
  }
};

const updateRestaurant = async (req, res) => {
  try {
    const {
      user_id,
      id,
      restaurant_name,
      email,
      contact,
      description,
      tagLine,
      website_link,
      isActive,
    } = req.body;

    if (!id || !user_id) {
      return res.status(400).json({
        message: "Both admin ID and user_id are required",
        success: false,
      });
    }

    const restaurant = await Restaurant.findOne({ _id: id, user_id });

    if (!restaurant) {
      return res.status(404).json({
        message: "Restaurant not found",
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

    const duplicatePhone = await Restaurant.findOne({
      _id: { $ne: id },
      $or: [{ contact }],
    });

    if (duplicatePhone) {
      return res.status(409).json({
        success: false,
        message: "Contact already in use",
      });
    }

    if (req.file) {
      const oldFileName = path.basename(restaurant.logo || "");
      const oldFilePath = path.join(__dirname, "../uploads", oldFileName);

      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }

      const uniqueId = crypto.randomBytes(2).toString("hex");
      const fileName = `${uniqueId}${path.extname(req.file.originalname)}`;
      const uploadDir = path.join(__dirname, "../uploads");

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, fileName);
      fs.writeFileSync(filePath, req.file.buffer);

      restaurant.logo = `${process.env.FRONTEND_URL}/uploads/${fileName}`;
    }

    if (restaurant_name !== undefined) restaurant.restaurant_name = restaurant_name;
    if (email !== undefined) restaurant.email = email;
    if (contact !== undefined) restaurant.contact = contact;
    if (description !== undefined) restaurant.description = description;
    if (tagLine !== undefined) restaurant.tagLine = tagLine;
    if (website_link !== undefined) restaurant.website_link = website_link;
    if (isActive !== undefined) restaurant.isActive = isActive;

    await restaurant.save();

    res.status(200).json({
      message: "Restaurant updated successfully",
      success: true,
      data: restaurant,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to update restaurant",
      success: false,
      error: err.message,
    });
  }
};

const deleteRestaurant = async (req, res) => {
  try {
    const { id, user_id } = req.body;

    if (!id || !user_id) {
      return res.status(400).json({
        success: false,
        message: "Both ID and user_id are required",
      });
    }

    const restaurant = await Restaurant.findOne({ _id: id, user_id });

    if (!restaurant) {
      return res.status(404).json({
        message: "Restaurant not found for the given user_id",
        success: false,
      });
    }

    if (restaurant.logo) {
      const fileName = path.basename(restaurant.logo);
      const filePath = path.join(__dirname, "../uploads", fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Restaurant.findByIdAndDelete(id);

    res.status(200).json({
      message: "Restaurant deleted successfully",
      success: true,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to delete restaurant",
      success: false,
      error: err.message,
    });
  }
};

module.exports = {
  getRestaurant,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
};
