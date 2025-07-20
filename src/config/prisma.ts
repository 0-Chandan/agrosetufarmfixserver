import { PrismaClient } from "../../generated/prisma";

const globalPrisma = global as unknown as { prisma?: PrismaClient };

const prisma = globalPrisma.prisma || new PrismaClient();

export default prisma;