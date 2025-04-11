const dotenv = require("dotenv");

const express = require("express");
const envFile = process.env.ENV_MODE === "docker" ? ".env" : ".env1";
console.log(envFile);
dotenv.config({ path: envFile });
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const session = require("express-session");
require("./config/passport");

const startServer = async () => {
	await connectDB(); // wait for DB to connect

	const app = express();

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

	const authRouter = require("./routes/authRoutes");
	const taskRouter = require("./routes/taskRoutes");

	app.use("/api/auth", authRouter);
	app.use("/api/tasks", taskRouter);

	app.get("/", (req, res) => {
		res.send(`<a href="api/auth/google">Login with Google</a>`);
	});

	const PORT = process.env.PORT;
	app.listen(PORT, () => {
		console.log(`Server running at http://localhost:${PORT}`);
	});
};

startServer(); // kick off the app
