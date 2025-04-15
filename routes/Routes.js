const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");

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

router.get("/admin-list", upload.none(), getAdmin);
router.post("/admin-create", upload.single("image"), createAdmin);
router.put("/admin-update", upload.single("image"), updateAdmin);
router.delete("/admin-delete", deleteAdmin);

router.get("/restaurant-list", getRestaurant);
router.post("/restaurant-create", upload.single("logo"), createRestaurant);
router.put("/restaurant-update", upload.single("logo"), updateRestaurant);
router.delete("/restaurant-delete", deleteRestaurant);

router.get("/restaurant-owner-list", getRestaurantOwner);
router.post("/restaurant-owner-create",  upload.single("logo"),createRestaurantOwner);
router.put("/restaurant-owner-update", upload.single("logo"), updateRestaurantOwner);
router.delete("/restaurant-owner-delete", deleteRestaurantOwner);

module.exports = router;
