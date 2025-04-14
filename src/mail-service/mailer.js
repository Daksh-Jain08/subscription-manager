require("dotenv").config()
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST,
	port: process.env.SMTP_PORT,
	secure: false,
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASS,
	},
});

const loadTemplate = (templateName) => {
	const templatePath = path.join(__dirname, "templates", templateName);
	return fs.readFileSync(templatePath, "utf-8");
};

const sendEmail = async (to, subject, html) => {
	await transporter.sendMail({
		from: `"Task Manager" <${process.env.MAIL_USER}>`,
		to,
		subject,
		html,
	});
};

module.exports = { loadTemplate, sendEmail };
