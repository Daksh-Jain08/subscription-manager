const express = require("express");

const router = express.Router();

const {loginUser, registerUser, refreshAccessToken, logoutUser, getProfile} = require("../controllers/authController");
const {isAuthenticated, hasPermission} = require("../middleware/authMiddleware");

router.route("/login").post(loginUser);
router.route("/register").post(registerUser);
router.route("/profile").get(isAuthenticated, getProfile);
router.route("/refresh").post(refreshAccessToken);
router.route("/logout").post(isAuthenticated, logoutUser);

module.exports = router;