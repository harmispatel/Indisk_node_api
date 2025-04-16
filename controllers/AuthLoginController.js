const UserAuth = require("../models/authLogin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const randomstring = require("randomstring");
const crypto = require("crypto");
const config = require("../config/nodemailer");

const getAuthUsers = async (req, res) => {
  try {
    const users = await UserAuth.find();
    res.status(200).json({
      message: "Login Users fetched successfully",
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching  users",
      success: false,
      error: error.message,
    });
  }
};

const registerUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "All fields are required", success: false });
  }

  const emailRegex = /\S+@\S+\.\S+/;
  if (!emailRegex.test(email)) {
    return res
      .status(400)
      .json({ message: "Invalid email format", success: false });
  }

  try {
    const existingUser = await UserAuth.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email is already registered", success: false });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new UserAuth({
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json([
      {
        message: "User registered successfully",
        success: true,
        data: newUser,
      },
    ]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "email and password are required",
      success: false,
    });
  }

  try {
    let user;
    const emailRegex = /\S+@\S+\.\S+/;
    if (emailRegex.test(email)) {
      user = await UserAuth.findOne({ email: email });
    }

    if (!user) {
      return res.status(400).json({ message: "Invalid email", success: false });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Invalid password", success: false });
    }

    // const token = jwt.sign({ userId: user._id }, "your_jwt_secret", {
    //   expiresIn: "1h",
    // });

    res.status(200).json({
      message: "Login successful",
      success: true,
      data: user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", success: false });
  }
};

const sendResetEmail = async (email, token) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: config.emailUser,
        pass: config.emailPassword,
      },
    });

    const mailOptions = {
      from: config.emailUser,
      to: email,
      subject: "Password Reset Request",
      html: `
  <div style="font-family: Arial, sans-serif; font-size: 14px;">
    <h3>Password Reset Request</h3>
    <p>You have requested to reset your password. Please click the link below to reset your password:</p>
    <p>
      <a href="http://192.168.1.87:3000/reset-password/${token}" style="color: #1a73e8; text-decoration: underline;">
        Reset Password
      </a>
    </p>
    <p>If you did not request this, please ignore this email.</p>
  </div>
`,
    };
    transporter.sendMail(mailOptions, function (error) {
      if (error) {
        console.log(error);
      } else {
        console.log("Mail has been sent to your email");
      }
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      msg: error.message,
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ message: "Email is required", success: false });
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: "Invalid email format",
        });
      }
    }

    const user = await UserAuth.findOne({ email });
    if (user) {
      const randomString = randomstring.generate();
      const data = await UserAuth.updateOne(
        { email: email },
        { $set: { token: randomString } }
      );
      sendResetEmail(user.email, randomString);
      return res.status(200).json({
        message:
          "Password reset email sent successfully. Please check your inbox.",
        success: true,
      });
    } else {
      return res.status(400).json({
        message: "User with this email does not exist",
        success: false,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", success: false });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token) {
      return res
        .status(200)
        .json({ message: "Token required", success: false });
    }

    if (!password) {
      return res
        .status(200)
        .json({ message: "New password required", success: false });
    }

    const user = await UserAuth.findOne({ token });

    if (!user) {
      return res
        .status(200)
        .json({ message: "Invalid or expired token", success: false });
    }

    user.token = "";
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      message: "Password reset successfully",
      success: true,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", success: false });
  }
};

module.exports = {
  getAuthUsers,
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
};
