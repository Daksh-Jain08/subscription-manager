const bcrypt = require("bcryptjs");

async function matchPassword(rawPassword, hashedPassword) {
	return bcrypt.compare(rawPassword, hashedPassword);
}

module.exports = { matchPassword };
