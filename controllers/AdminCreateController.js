const bcrypt = require("bcryptjs");
const Admin = require("../models/adminCreate");
const fs = require("fs");
const path = require("path");

const getAdmin = async (req, res) => {
  try {
    const admins = await Admin.find();
    res.status(200).json({
      message: "Admins fetched successfully",
      success: true,
      data: admins,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to retrieve admins",
      success: false,
      error: err.message,
    });
  }
};

const createAdmin = async (req, res) => {
  const { name, email, password } = req.body;

  const image = req.file ? req.file.filename : null;

  if (!name || !email || !password || !image) {
    return res.status(400).json({
      message:
        "Please provide name, email, password, and image (either file or URL)",
      success: false,
    });
  }

  try {
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(201).json({
        message: "Admin with this email already exists",
        success: false,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({
      name,
      email,
      password,
      image: `${process.env.FRONTEND_URL}/uploads/${image}`,
    });

    await newAdmin.save();

    res.status(201).json({
      message: "Admin created successfully",
      success: true,
      data: newAdmin,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to create admin",
      success: false,
      error: err.message,
    });
  }
};

const updateAdmin = async (req, res) => {
  try {
    const { id, name, email, password } = req.body;

    if (!name && !email && !password && !image) {
      return res.status(400).json({
        message: "Please provide at least one field to update",
        success: false,
      });
    }

    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({
        message: "Admin not found",
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

    const duplicate = await Admin.findOne({
      _id: { $ne: id },
      $or: [{ email }],
    });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "Email already in use",
      });
    }

    let profile_photo = admin.image;
    if (req.file) {
      const oldFileName = path.basename(admin.image || "");
      const oldFilePath = path.join(__dirname, "../uploads", oldFileName);

      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }

      profile_photo = `${process.env.FRONTEND_URL}/uploads/${req.file.filename}`;
    }

    if (name) admin.name = name;
    if (email) admin.email = email;
    if (password) admin.password = password;
    if (profile_photo) admin.image = profile_photo;

    await admin.save();

    res.status(200).json({
      message: "Admin updated successfully",
      success: true,
      data: admin,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to update admin",
      success: false,
      error: err.message,
    });
  }
};

const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID is required",
      });
    }

    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({
        message: "Admin not found",
        success: false,
      });
    }

    if (admin.image) {
      const fileName = path.basename(admin.image);
      const filePath = path.join(__dirname, "../uploads", fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Admin.findByIdAndDelete(id);

    res.status(200).json({
      message: "Admin deleted successfully",
      success: true,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to delete admin",
      success: false,
      error: err.message,
    });
  }
};

module.exports = {
  getAdmin,
  createAdmin,
  updateAdmin,
  deleteAdmin,
};
