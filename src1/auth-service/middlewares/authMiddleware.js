const jwt = require('jsonwebtoken');
//const User = require('../models/User');
const prisma = require('../prisma');
const userSelect = require("../utils/userSelect");

const isAuthenticated = async (req, res, next) => {
    let token;

    // check if token is provided
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1]; // Get the token from "Bearer <token>"

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Fetch user data without password
            req.user = await prisma.user.findUnique({
                where: {
                    id: decoded.id,
                },
								select: userSelect
            });

            next(); // Proceed to the next middleware/controller
        } catch (error) {
						console.log(error);
            return res.status(401).json({ message: 'Not authorized, invalid token' });
        }
    } else {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const hasPermission = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)) {
            return res.status(403).json({message: "Not authorized to access this route"});
        }
        next();
    }
}

module.exports = {isAuthenticated, hasPermission};
