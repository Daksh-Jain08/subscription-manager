const express = require("express");
const passport = require("passport");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");

dotenv.config();

const app = express();
const cookieParser = require("cookie-parser");
const session = require("express-session");
require("./config/passport");

app.use(express.json());

// MongoDB Connection
const startApp = async () => {
	try {
		await connectDB();
		app.use(express.json());
		app.use(cookieParser());
		app.use(
			session({
				secret: process.env.SESSION_SECRET,
				resave: false,
				saveUninitialized: true,
			}),
		);
		app.use(passport.initialize());
		// app.use(passport.session());

		// Health Check
		app.get("/", (req, res) => {
			res.send("Auth Service is running");
		});

		// Routes
		app.use("/api/auth", authRoutes);

		// Start Server
		const PORT = process.env.PORT || 5000;
		app.listen(PORT, () => {
			console.log(`Auth Service listening on port ${PORT}`);
		});
	} catch (err) {
		console.log(`Something went wrong:\n${err}`);
	}
};

startApp();
