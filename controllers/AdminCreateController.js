const bcrypt = require("bcryptjs");
const Admin = require("../models/adminCreate");

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
  const { id, name, email, password } = req.body;

  const image = req.file
    ? `${process.env.FRONTEND_URL}/uploads/${req.file.filename}`
    : null;

  if (!name && !email && !password && !image) {
    return res.status(400).json({
      message: "Please provide at least one field to update",
      success: false,
    });
  }

  try {
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

    if (name) admin.name = name;
    if (email) admin.email = email;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      admin.password = hashedPassword;
    }
    if (image) admin.image = image;

    await admin.save();

    res.status(200).json({
      message: "Admin updated successfully",
      success: true,
      data: {
        name: admin.name,
        email: admin.email,
        image: admin.image,
      },
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
  const { id } = req.body;

  try {
    const admin = await Admin.findByIdAndDelete(id);
    if (!admin) {
      return res.status(404).json({
        message: "Admin not found",
        success: false,
      });
    }
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
