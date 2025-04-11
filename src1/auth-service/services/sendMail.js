const axios = require("axios");

const sendMail = async (type, data) => {
	try {
		await axios.post(`${process.env.MAILER_URL}/send`, { type, data });
	} catch (err) {
		throw new Error(`Mailing error: ${err}`);
	}
};

module.exports = { sendMail };
