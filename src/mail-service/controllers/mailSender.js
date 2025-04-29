const { loadTemplate, sendEmail } = require("../mailer.js");
const axios = require("axios");

const mail = (type, data) => {
	console.log(type);
	switch (type) {
		case "welcome":
			return sendwelcomeemail(data.email, data.username);

		case "verify":
			return sendverificationemail(data.email, data.username, data.link);

		case "reset":
			return sendpasswordresetemail(data.email, data.username, data.link);

		case "reminder":
			return sendreminderemail(data.subject, data.email, data.username, data.sub);

		default:
			throw new Error(`unsupported mail type: ${type}`);
	}
};

const sendverificationemail = async (email, username, link) => {
	const template = loadTemplate("verification.html");
	const html = template
		.replace(/{{username}}/g, username)
		.replace(/{{link}}/g, link);

	await sendEmail(email, "verify your account", html);
};

const sendwelcomeemail = async (email, username) => {
	const template = loadTemplate("welcome.html");
	const html = template.replace(/{{username}}/g, username);
	await sendEmail(email, "welcome to task manager!", html);
};

const sendpasswordresetemail = async (email, username, link) => {
	const template = loadTemplate("reset_password.html");
	const html = template
		.replace(/{{username}}/g, username)
		.replace(/{{link}}/g, link);

	await sendEmail(email, "reset your password", html);
};

const sendreminderemail = async (subject, email, username, sub) => {
	console.log("sending reminder email");
	try{
	const template = loadTemplate("reminder.html");
	const html = template
		.replace(/{{username}}/g, username)
		.replace(/{{serviceName}}/g, sub.serviceName)
		.replace(/{{renewalDate}}/g, sub.renewalDate);

	await sendEmail(email, subject, html);
	console.log(`Reminder email sent to ${email} for ${sub.serviceName}`);
	} catch (error) {
		console.error("Error sending reminder email:", error);
	}
};

const consumeMails = () => {
	setInterval(async () => {
		try {
			const res = await axios.get(`${process.env.QUEUE_URL}/dequeue/sendMail`);
			const message = res.data.message;
			await mail(message.type, message.data);
		} catch (err) {
			console.error("Queue polling error:", err.message);
		}
	}, 6000); // poll every 1 minute
};

module.exports = { consumeMails };
