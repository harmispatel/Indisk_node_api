const bcrypt = require("bcryptjs");
const Admin = require("../models/adminCreate");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

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

  if (!name || !email || !password || !req.file) {
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    const uniqueId = crypto.randomBytes(2).toString("hex");
    const fileName = `${uniqueId}${path.extname(req.file.originalname)}`;
    const uploadDir = path.join(__dirname, "../uploads/admins");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, req.file.buffer);

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({
      name,
      email,
      password,
      image: `${process.env.FRONTEND_URL}/uploads/admins/${fileName}`,
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

    if (!name && !email && !password && !req.file) {
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

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: "Invalid email format",
        });
      }

      const duplicate = await Admin.findOne({
        _id: { $ne: id },
        email,
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: "Email already in use",
        });
      }

      admin.email = email;
    }

    if (req.file) {
      const oldFileName = path.basename(admin.image || "");
      const oldFilePath = path.join(
        __dirname,
        "../uploads/admins",
        oldFileName
      );

      // Delete old image if exists
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }

      const uniqueId = crypto.randomBytes(2).toString("hex");
      const fileName = `${uniqueId}${path.extname(req.file.originalname)}`;
      const uploadDir = path.join(__dirname, "../uploads/admins");

      // Ensure the uploads folder exists
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, fileName);
      fs.writeFileSync(filePath, req.file.buffer);

      admin.image = `${process.env.FRONTEND_URL}/uploads/admins/${fileName}`;
    }

    if (name) admin.name = name;
    if (password) admin.password = password;

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
      const filePath = path.join(__dirname, "../uploads/admins", fileName);
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
