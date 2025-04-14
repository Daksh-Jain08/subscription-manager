const jwt = require("jsonwebtoken");

const isAuthenticated = async (req, res, next) => {
	let token;

	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith("Bearer")
	) {
		try {
			token = req.headers.authorization.split(" ")[1]; // Get the token from "Bearer <token>"

			// Verify token
			console.log(process.env.JWT_SECRET);

			const decoded = jwt.verify(token, process.env.JWT_SECRET);

			// Fetch user data without password
			req.user = {id: decoded.id}; 

			next(); // Proceed to the next middleware/controller
		} catch (error) {
			console.log(error);
			return res.status(401).json({ message: "Not authorized, invalid token" });
		}
	} else {
		return res.status(401).json({ message: "Not authorized, no token" });
	}
};

module.exports = { isAuthenticated };
