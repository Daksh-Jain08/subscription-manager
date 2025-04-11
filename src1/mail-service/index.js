// mailer-service/index.js
const express = require("express");
const dotenv = require("dotenv");
const { consumeMails } = require("./controllers/mailSender");

dotenv.config();

const app = express();
app.use(express.json());

console.log(process.env.SMTP_USER);
console.log(process.env.SMTP_HOST);
// Health check
app.get("/", (req, res) => {
	res.send("Mailer Service is up and running");
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
	console.log(`Mailer Service listening on port ${PORT}`);
	consumeMails();
});
