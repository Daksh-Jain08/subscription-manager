const express = require("express");
const dotenv = require("dotenv");
const { isAuthenticated } = require("./middleware/authMiddleware");


const subsRoutes = require("./routes/subsRoutes");

dotenv.config();

const app = express();
const cookieParser = require("cookie-parser");

const startApp = async () => {
	try {
		app.use(express.json());
		app.use(cookieParser());

		// Health Check
		app.get("/", (req, res) => {
			res.send("Subs Service is running");
		});

		// Routes
		app.use("/api/subscription", isAuthenticated, subsRoutes);

		// Start Server
		const PORT = process.env.PORT || 5003;
		app.listen(PORT, () => {
			console.log(`Subs Service listening on port ${PORT}`);
		});
	} catch (err) {
		console.log(`Something went wrong:\n${err}`);
	}
};

startApp();
