// mailer-service/index.js
const express = require("express");
const dotenv = require("dotenv");
const mail = require("./controllers/mailSender.js");

dotenv.config();

const app = express();
app.use(express.json());

console.log(process.env.SMTP_USER);
console.log(process.env.SMTP_HOST);
// Health check
app.get("/", (req, res) => {
	res.send("Mailer Service is up and running");
});

// POST /send => expects { type, data }
app.post("/send", async (req, res) => {
	try {
		const { type, data } = req.body;

		await mail(type, data);
		res.status(200).json({ message: "Email sent successfully" });
	} catch (err) {
		console.error("Error sending mail:", err);
		res.status(500).json({ message: "Internal Server Error" });
	}
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
	console.log(`Mailer Service listening on port ${PORT}`);
});
