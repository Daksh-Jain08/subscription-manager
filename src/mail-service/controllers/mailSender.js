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
			return sendreminderemail(data.email, data.username, data.task);

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

const sendreminderemail = async (email, username, task) => {
	const template = loadTemplate("reminder.html");
	const html = template
		.replace(/{{username}}/g, username)
		.replace(/{{tasktitle}}/g, task.title)
		.replace(/{{duedate}}/g, task.duedate);

	await sendEmail(email, "task reminder", html);
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
	}, 2000); // poll every 2 seconds
};

module.exports = { consumeMails };
