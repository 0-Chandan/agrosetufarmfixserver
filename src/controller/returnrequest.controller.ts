import { Request, Response } from "express";
import { asyncHandler } from "../middleware/error.middleware";
import { SuccessResponse } from "../utils/response.utils";
import prisma from "../config/prisma";

interface ReturnRequestFilterOptions {
  status?: string;
  userId?: number;
  orderId?: number;
  startDate?: string;
  endDate?: string;
}

export const createReturnRequest = asyncHandler(
  async (req: Request, res: Response) => {
    const { orderId,reason,status } = req.body;
    if (!orderId || !reason || !status) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const returnRequest = await prisma.returnRequest.create({
      data: {
        orderId,
        reason,
        status,
      },
    });
    return SuccessResponse(res, "Return request created successfully", returnRequest, 201);
    }
);




export const getAllReturnRequests = asyncHandler(
  async (req: Request, res: Response) => {
    // Pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Filter parameters
    const filters: ReturnRequestFilterOptions = {};
    
    if (req.query.status) filters.status = req.query.status as string;
    if (req.query.userId) filters.userId = parseInt(req.query.userId as string);
    if (req.query.orderId) filters.orderId = parseInt(req.query.orderId as string);
    if (req.query.startDate) filters.startDate = req.query.startDate as string;
    if (req.query.endDate) filters.endDate = req.query.endDate as string;

    // Build the where clause for Prisma
    const where: any = {};
    
    if (filters.status) where.status = filters.status;
    if (filters.userId) where.userId = filters.userId;
    if (filters.orderId) where.orderId = filters.orderId;
    
    // Date range filtering
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
    }

    // Get return requests with pagination and filtering
    const [returnRequests, totalCount] = await Promise.all([
      prisma.returnRequest.findMany({
        where,
        skip,
        take: limit,
        include: {
          order: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.returnRequest.count({ where })
    ]);

    return SuccessResponse(res, "Return requests retrieved successfully", {
      data: returnRequests,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page * limit < totalCount,
        hasPreviousPage: page > 1
      }
    });
  }
);

export const getReturnRequestbyId = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const returnRequest = await prisma.returnRequest.findUnique({
      where: { id: parseInt(id) },
      include: {
        order: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!returnRequest) {
      return res.status(404).json({ message: "Return request not found" });
    }

    return SuccessResponse(res, "Return request retrieved successfully", returnRequest);
  }
);

