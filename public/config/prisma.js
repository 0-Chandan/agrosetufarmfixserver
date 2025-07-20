"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../../generated/prisma");
const globalPrisma = global;
const prisma = globalPrisma.prisma || new prisma_1.PrismaClient();
exports.default = prisma;
