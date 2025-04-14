const express = require("express");
const passport = require("passport");

const router = express.Router();

const authControllers = require("../controllers/authController");
const { isAuthenticated } = require("../middlewares/authMiddleware");

router.get(
	"/google",
	passport.authenticate("google", {
		scope: ["profile", "email"],
		session: false,
	}),
);
router.route("/login").post(authControllers.loginUser);
router.route("/register").post(authControllers.registerUser);
router.route("/profile").get(isAuthenticated, authControllers.getProfile);
router.route("/refresh").post(authControllers.refreshAccessToken);
router.route("/logout").post(isAuthenticated, authControllers.logoutUser);
router.get(
	"/google/callback",
	passport.authenticate("google", {
		failureRedirect: "/login",
		session: false,
	}),
	authControllers.googleCallback,
);
router.get("/verify", authControllers.verifyEmail);
router.get("/get-reset-password-link", authControllers.resetPasswordLink);
router.post("/reset-password", authControllers.resetPassword);


module.exports = router;
