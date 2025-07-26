import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../middleware/error.middleware";
import { ErrorResponse , SuccessResponse } from "../utils/response.utils";
import { statusCode } from "../types/types";
import ENV from "../config/env";
import prisma from "../config/prisma";
import bcrypt from "bcrypt";  

export const createUser = asyncHandler(
    async (req: Request, res: Response, next) => {
        const { name, email, password} = req.body;

        if (!name || !email || !password) {
            return next(
                new ErrorResponse("All fields are required", statusCode.Bad_Request)
            );
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return next(
                new ErrorResponse("User already exists", statusCode.Conflict)
            );
        }
    const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword, // Store the hashed password
            },
        });

        SuccessResponse(res, "User created successfully", { user });
    }
);

export const loginUser = asyncHandler(
  async (req: Request, res: Response, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(
        new ErrorResponse("Email and password are required", statusCode.Bad_Request)
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return next(
        new ErrorResponse("Invalid email or password", statusCode.Unauthorized)
      );
    }

    // ✅ Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return next(
        new ErrorResponse("Invalid email or password", statusCode.Unauthorized)
      );
    }

    // ✅ Generate JWT token
    if (!ENV.JWT_SECRET) {
      return next(
        new ErrorResponse("JWT secret is not defined", statusCode.Internal_Server_Error)
      );
    }

    const token = jwt.sign({ id: user.id }, ENV.JWT_SECRET, { expiresIn: '30d' });

    // ✅ Never send password in response
    const { password: _, ...userWithoutPassword } = user;

    SuccessResponse(res, "Login successful", {
      user: userWithoutPassword,
      token,
    });
  }
);


export const logoutUser = asyncHandler(
  async (req: Request, res: Response) => {
    res.clearCookie("token");
    SuccessResponse(res, "Logout successful");
  }
);


