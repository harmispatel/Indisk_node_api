const express = require("express");
const router = express.Router();

const {
  getAuthUsers,
  loginUser,
  registerUser,
  forgotPassword,
  resetPassword,
} = require("../controllers/AuthLoginController");

const {
  getAdmin,
  createAdmin,
  updateAdmin,
  deleteAdmin,
} = require("../controllers/AdminCreateController");

router.get("/auth-users-list", getAuthUsers);
router.post("/login", loginUser);
router.post("/signup", registerUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.get("/admin-list", getAdmin);
router.post("/admin-create", createAdmin);
router.put("/admin-update/:id", updateAdmin);
router.delete("/admin-delete/:id", deleteAdmin);

module.exports = router;
