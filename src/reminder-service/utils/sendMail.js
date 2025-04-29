const axios = require("axios");

const sendMail = async (queue, type, data) => {
	try {
		await axios.post(`${process.env.QUEUE_URL}/enqueue/${queue}`, { type, data });
	} catch (err) {
		throw new Error(`Mailing error: ${err}`);
	}
};

module.exports = { sendMail };