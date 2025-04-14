const bcrypt = require("bcryptjs");

const hashPasswordMiddleware = async (params, next) => {
	if (params.model === "User") {
		if (params.action === "create" || params.action === "update") {
			const password = params.args.data?.password;
			if (password) {
				const saltRounds = 10;
				params.args.data.password = await bcrypt.hash(password, saltRounds);
			}
		}

		if (params.action === "updateMany" || params.action === "upsert"){
			const password = params.args.data?.password;
			if (password) {
				const saltRounds = 10;
				params.args.data.password = await bcrypt.hash(password, saltRounds);
			}
		}
	}
	
	return next(params);
};

module.exports = hashPasswordMiddleware;
