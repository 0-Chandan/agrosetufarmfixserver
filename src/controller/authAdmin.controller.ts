import { Response, Request } from "express";
import { ErrorResponse, SuccessResponse } from "../utils/response.utils";
import { statusCode } from "../types/types";
import prisma from "../config/prisma";
import jwt from "jsonwebtoken";
import ENV from "../config/env";
import { asyncHandler } from "../middleware/error.middleware";
import bcrypt from "bcrypt";

// Create Admin
export const createAdmin = asyncHandler(
  async (req: Request, res: Response, next) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return next(
        new ErrorResponse("All fields are required", statusCode.Bad_Request)
      );
    }

    const existingAdmin = await prisma.admin.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      return next(
        new ErrorResponse("Admin already exists", statusCode.Conflict)
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10); // Hashing password

    const admin = await prisma.admin.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    SuccessResponse(res, "Admin created successfully", { admin });
  }
);

// Login Admin
export const loginAdmin = asyncHandler(
  async (req: Request, res: Response, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(
        new ErrorResponse("Email and password are required", statusCode.Bad_Request)
      );
    }

    const admin = await prisma.admin.findMany({
      where: { email },
    });

    if (!admin || admin.length === 0) {
      return next(
        new ErrorResponse("Invalid email or password", statusCode.Unauthorized)
      );
    }

    const isPasswordValid = await bcrypt.compare(password, admin[0].password);

    if (!isPasswordValid) {
      return next(
        new ErrorResponse("Invalid email or password", statusCode.Unauthorized)
      );
    }

    if (!ENV.JWT_SECRET) {
      return next(
        new ErrorResponse("JWT secret is not defined", statusCode.Internal_Server_Error)
      );
    }

    const token = jwt.sign({ id: admin[0].id }, ENV.JWT_SECRET, {
      expiresIn: "30d",
    });

    SuccessResponse(res, "Login successful", { admin: admin[0], token });
  }
);


export const getAllAdmin = asyncHandler(async (req: Request, res: Response, next) => {
  const admins = await prisma.admin.findMany();

  SuccessResponse(res, "Admins fetched successfully", { admins });
})