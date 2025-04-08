const User = require("../models/User");
const jwt = require("jsonwebtoken");

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
		const user = await User.create({ username, email, password });
		if (user) {
			return loginUser(req, res);
		}
	} catch (error) {
		res.status(500).json({ message: error.message });
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

module.exports = {
	registerUser,
	loginUser,
	refreshAccessToken,
	logoutUser,
	getProfile,
	googleCallback,
};
