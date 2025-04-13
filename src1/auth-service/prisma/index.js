const {PrismaClient} = require("@prisma/client");
const hashPasswordMiddleware = require("./middleware/hashPassword");

const prisma = new PrismaClient();

// Register the middleware
prisma.$use(hashPasswordMiddleware);

module.exports = prisma;
