const User = require("../models/User");
const jwt = require("jsonwebtoken");
//sendMail can throw errors
const { sendMail } = require("../services/sendMail");

const generateToken = (id) => {
	access_token = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "15m" });
	refresh_token = jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
		expiresIn: "7d",
	});
	return { access_token, refresh_token };
};

// @desc Register a new user
// @route POST /api/auth/register
// @access Public
const registerUser = async (req, res) => {
	const { username, email, password } = req.body;

	if (!username || !email || !password) {
		return res.status(400).json({
			message: "Please enter all the fields {username, email, password}",
		});
	}

	try {
		const emailUsed = await User.findOne({ email });
		const usernameUsed = await User.findOne({ username });
		if (emailUsed) {
			return res.status(400).json({ message: "Email already used" });
		}
		if (usernameUsed) {
			return res.status(400).json({ message: "Username already used" });
		}
		const payload = { username, email, password };
		const token = jwt.sign(payload, process.env.EMAIL_TOKEN_SECRET, {
			expiresIn: "15m",
		});

		console.log(token);
		const verificationLink = `http://localhost:${process.env.PORT}/api/auth/verify?token=${token}`;
		console.log(verificationLink);

		await sendMail("verify", { email, username, link: verificationLink });
		return res.status(200).json({ message: "Verification email sent" });
	} catch (error) {
		console.log(`Error registering user: ${error}`);
		res.status(500).json({ message: error.message });
	}
};

//@desc Verify the email and create user
//@route GET /api/auth/verify?token=${token}
//@access Public
const verifyEmail = async (req, res) => {
	const token = req.query.token;
	if (!token) {
		return res.status(400).json({ message: "no token provided" });
	}
	try {
		const { username, email, password } = jwt.verify(
			token,
			process.env.EMAIL_TOKEN_SECRET,
		);
		const newUser = User.create({
			username: username,
			email: email,
			password: password,
		});

		await sendMail("welcome", { email, username });

		return res.status(200).json({ message: "account created" });
	} catch (err) {
		console.log(err);
		return res.status(400).json({ message: `${err} something went wrong` });
	}
};

// @desc Login a user
// @route POST /api/auth/login
// @access Public
const loginUser = async (req, res) => {
	const { email, password } = req.body;
	if (!email || !password) {
		return res
			.status(400)
			.json({ message: "Please enter all the fields {email, password}" });
	}
	try {
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(400).json({ message: "User not found" });
		}
		const isMatch = await user.matchPassword(password);
		if (!isMatch) {
			return res.status(400).json({ message: "Invalid credentials" });
		}
		const { access_token, refresh_token } = generateToken(user._id);
		res.cookie("refresh_token", refresh_token, {
			http_only: true,
			secure: true,
			same_site: "strict",
		});
		return res.status(200).json({
			access_token,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

// @desc Refresh access token
// @route POST /api/auth/refresh
// @access Private
const refreshAccessToken = (req, res) => {
	try {
		const refresh_token = req.cookies.refresh_token;
		if (!refresh_token) {
			return res.status(400).json({ message: "No refresh token provided" });
		}
		jwt.verify(
			refresh_token,
			process.env.JWT_REFRESH_SECRET,
			(err, decoded) => {
				if (err) {
					return res.status(403).json({ message: "Invalid refresh token" });
				}
				const newAccessToken = jwt.sign(
					{ id: decoded.id },
					process.env.JWT_SECRET,
					{ expiresIn: "3h" },
				);
				res.json({ access_token: newAccessToken });
			},
		);
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

//@desc Logout a user
//@route POST /api/auth/logout
//@access Private
const logoutUser = (req, res) => {
	res.clearCookie("refresh_token", {
		http_only: true,
		secure: true,
		same_site: "strict",
	});
	res.json({ message: "Logged out successfully" });
};

//@desc Google Callback
//@route selfcalled
//@access Private
const googleCallback = (req, res) => {
	const { access_token, refresh_token } = generateToken(req.user._id);
	res.cookie("refresh_token", refresh_token, {
		httpOnly: true,
		secure: true,
		sameSite: "strict",
	});
	return res.status(200).json({ access_token });
};

const getProfile = async (req, res) => {
	res.status(200).json(req.user);
};

//@desc Get Reset Password Link
//@route /api/auth/reset-passowrd-link
//@access public
const resetPasswordLink = async (req, res) => {
	try {
		const { email, username } = req.body;
		if (!email || !username) {
			return res
				.status(400)
				.json({ message: "Email or/and Username not provided" });
		}
		const user = User.findOne({ email: email, username: username });

		if (!user) {
			return res.status(400).json({ message: "User does not exist" });
		}

		const token = jwt.sign({ id: user._id }, process.env.EMAIL_TOKEN_SECRET, {
			expiresIn: "15m",
		});

		const resetLink = `http://localhost:${process.env.PORT}/api/auth/reset-password?token=${token}`;
		await sendMail("reset", { email, username, link: resetLink });

		return res.status(200).json({ message: "Reset Link sent" });
	} catch (err) {
		return res.status(500).json({ message: `${err} something went wrong` });
	}
};

//@desc Reset Password
//@route /api/auth/reset-passowrd
//@access public
const resetPassword = async (req, res) => {
	try {
		const token = req.query.token;

		const id = jwt.verify(token, process.env.EMAIL_TOKEN_SECRET).id;

		const newPassword = req.body.password;
		const user = await User.findOne({ id: id });
		if (!user) return res.status(400).json({ message: "User does not exist" });
		user.password = newPassword;
		await user.save();
		return res.status(200).json({ message: "Password updated successfully" });
	} catch (err) {
		res.status(500).json({ message: `${err}` });
	}
};

module.exports = {
	registerUser,
	loginUser,
	refreshAccessToken,
	logoutUser,
	getProfile,
	googleCallback,
	verifyEmail,
	resetPasswordLink,
	resetPassword,
};
