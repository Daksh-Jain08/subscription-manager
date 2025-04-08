const express = require("express");
const passport = require("passport");

const router = express.Router();

const {loginUser, registerUser, refreshAccessToken, logoutUser, getProfile, googleCallback, verifyEmail} = require("../controllers/authController");
const {isAuthenticated, hasPermission} = require("../middleware/authMiddleware");

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"], session: false }));
router.route("/login").post(loginUser);
router.route("/register").post(registerUser);
router.route("/profile").get(isAuthenticated, getProfile);
router.route("/refresh").post(refreshAccessToken);
router.route("/logout").post(isAuthenticated, logoutUser);
router.get("/google/callback", 
	passport.authenticate("google", {failureRedirect: '/login', session: false}),
	googleCallback
)
router.get("/verify", verifyEmail);

module.exports = router;
