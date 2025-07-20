import { Request, Response } from "express";
import { asyncHandler } from "../middleware/error.middleware";
import { SuccessResponse } from "../utils/response.utils";
import prisma from "../config/prisma";


interface PaymentQuery {
  page?: string;
  limit?: string;
  status?: string;
  paymentMethod?: string;
  userId?: string;
  orderId?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  order?: "asc" | "desc";
}


export const addpayment = asyncHandler(
  async (req: Request, res: Response) => {
    const { orderId, paymentMethod, amount } = req.body;

    // Validate required fields
    if (!orderId || !paymentMethod || !amount) {
      return res.status(400).json({ message: "orderId, paymentMethod, and amount are required" });
    }

    try {
      // Check if the order exists
      const order = await prisma.order.findUnique({
        where: { id: orderId }
      });

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Create the payment record
      const payment = await prisma.payment.create({
        data: {
          orderId,
          method:"CASH", // Assuming payment method is cash
          status: "PENDING", // Initial status
          transactionId: `txn_${Date.now()}`, // Example transaction ID
          paidAt: new Date(),
        }
      });

      return SuccessResponse(res, "Payment created successfully", payment, 201);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error", error });
    }
  }
);  


export const getpaymentall = asyncHandler(
  async (req: Request<{}, {}, {}, PaymentQuery>, res: Response) => {
    try {
      const {
        page = "1",
        limit = "10",
        status,
        paymentMethod,
        userId,
        orderId,
        dateFrom,
        dateTo,
        sortBy = "createdAt",
        order = "desc",
      } = req.query;

      const pageInt = parseInt(page);
      const limitInt = parseInt(limit);

      // Build filters for Prisma
      const filters: any = {};

      if (status) filters.status = status;
      if (paymentMethod) filters.paymentMethod = paymentMethod;
      if (orderId) filters.orderId = parseInt(orderId);

      if (userId) {
        filters.order = {
          userId: parseInt(userId),
        };
      }

      if (dateFrom || dateTo) {
        filters.createdAt = {};
        if (dateFrom) filters.createdAt.gte = new Date(dateFrom);
        if (dateTo) filters.createdAt.lte = new Date(dateTo);
      }

      // Fetch payments with pagination and filters
      const payments = await prisma.payment.findMany({
        where: filters,
        include: {
          order: true,
        },
        orderBy: {
          [sortBy]: order,
        },
        skip: (pageInt - 1) * limitInt,
        take: limitInt,
      });

      // Count total matching records
      const total = await prisma.payment.count({
        where: filters,
      });

      return SuccessResponse(
        res,
        "Payments retrieved successfully",
        {
          data: payments,
          total,
          page: pageInt,
          limit: limitInt,
          totalPages: Math.ceil(total / limitInt),
        },
        200
      );
    } catch (error) {
      return res.status(500).json({ message: "Internal server error", error });
    }
  }
);

export const getPaymentById = asyncHandler(
  async (req: Request, res: Response) => {      
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Payment ID is required" });
    }
    const payment = await prisma.payment.findUnique({
      where: { id: parseInt(id) },
    });
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    return SuccessResponse(res, "Payment fetched successfully", payment);
  }
);
