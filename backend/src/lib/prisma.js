const { PrismaClient } = require("@prisma/client");

// Reuse one client for the whole process. Creating a client in every
// controller can exhaust the database connection pool in development.
const prisma = new PrismaClient();

module.exports = prisma;
