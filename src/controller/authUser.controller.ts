import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../middleware/error.middleware";
import { ErrorResponse, SuccessResponse } from "../utils/response.utils";
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
                password: hashedPassword, 
            },
        });

        SuccessResponse(res, "User created successfully", { user });
    }
);

export const getAllUsers = asyncHandler(
    async (req: Request, res: Response) => {
        // Get pagination parameters
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        // Get search and filter parameters
        const search = req.query.search as string;
        const filter = req.query.filter as string;

        // Build where clause for filtering and searching
        const where: any = {};

        // Search by name or email
        if (search) {
            where.OR = [
                { name: { contains: search } },
                { email: { contains: search } },
                {fullAdress: { contains: search }},
                {totalLand: { contains: search }},  
                {isActive: { contains: search }},
            ];
        }

        // Filter by specific fields (example: status, role, etc.)
        // Add more filter conditions as needed
        if (filter) {
            // Assuming filter is a JSON string with key-value pairs
            try {
                const filterObj = JSON.parse(filter);
                Object.entries(filterObj).forEach(([key, value]) => {
                    where[key] = value;
                });
            } catch (error) {
               
                 return  new ErrorResponse("Invalid filter format", statusCode.Bad_Request)
              
            }
        }

        // Get total count of users with applied filters
        const totalUsers = await prisma.user.count({ where });

        // Get paginated and filtered users
        const users = await prisma.user.findMany({
            skip,
            take: limit,
            where,
            select: {
                id: true,
                name: true,
                email: true,
                fullAdress: true,
                totalLand: true,
                expagriculture: true,
                specialCrop: true,
                isActive: true
                 
                // Exclude password
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Calculate pagination metadata
        const totalPages = Math.ceil(totalUsers / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        SuccessResponse(res, "Users retrieved successfully", {
            users,
            pagination: {
                currentPage: page,
                totalPages,
                totalUsers,
                limit,
                hasNextPage,
                hasPrevPage
            }
        });
    }
);

export const getuserbyid = asyncHandler(
    async (req: Request, res: Response, next) => {
        if (!req.user?.id) {
            return next(
                new ErrorResponse("User not authenticated", statusCode.Unauthorized)
            );
        }

        const user = await prisma.user.findUnique({
            where: { id: req.user.id || parseInt(req.params.id) },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                fullAdress: true,
                totalLand: true,
                specialCrop: true,
                expagriculture: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            return next(
                new ErrorResponse("User not found", statusCode.Not_Found)
            );
        }

        SuccessResponse(res, "User retrieved successfully", { user });
    }
);

export const updateUser = asyncHandler(
    async (req: Request, res: Response) => {
        const { userid } = req.params;
        const { name, email,phone,fullAdress,totalLand,expagriculture,specialCrop,isActive} = req.body;
        const updatedUser = await prisma.user.update({
            where: { id: req.user?.id || parseInt(userid) },
            data: { name, email,phone,fullAdress,totalLand,expagriculture,specialCrop,isActive},
        });
        SuccessResponse(res, "User updated successfully", updatedUser);
    }
)
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

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return next(
        new ErrorResponse("Invalid email or password", statusCode.Unauthorized)
      );
    }

    if (!ENV.JWT_SECRET) {
      return next(
        new ErrorResponse("JWT secret is not defined", statusCode.Internal_Server_Error)
      );
    }

    const token = jwt.sign({ id: user.id }, ENV.JWT_SECRET, { expiresIn: '30d' });

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