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

const {
  getRestaurant,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
} = require("../controllers/RestaurantCreateController");

const {
  getRestaurantOwner,
  createRestaurantOwner,
  updateRestaurantOwner,
  deleteRestaurantOwner,
} = require("../controllers/RestaurantOwnerController");

router.get("/auth-users-list", getAuthUsers);
router.post("/login", loginUser);
router.post("/signup", registerUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.get("/admin-list", getAdmin);
router.post("/admin-create", createAdmin);
router.put("/admin-update/:id", updateAdmin);
router.delete("/admin-delete/:id", deleteAdmin);

router.get("/restaurant-list", getRestaurant);
router.post("/restaurant-create", createRestaurant);
router.put("/restaurant-update/:id", updateRestaurant);
router.delete("/restaurant-delete/:id", deleteRestaurant);

router.get("/restaurant-owner-list", getRestaurantOwner);
router.post("/restaurant-owner-create", createRestaurantOwner);
router.put("/restaurant-owner-update/:id", updateRestaurantOwner);
router.delete("/restaurant-owner-delete/:id", deleteRestaurantOwner);

module.exports = router;
