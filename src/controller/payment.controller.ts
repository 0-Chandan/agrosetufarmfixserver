import { Request, Response } from "express";
import { asyncHandler } from "../middleware/error.middleware";
import { SuccessResponse, ErrorResponse } from "../utils/response.utils";
import { statusCode } from "../types/types";
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

export const addpayment = asyncHandler(async (req: Request, res: Response) => {
  const { orderId, method, amount, status } = req.body;
  console.log("data:", orderId, method, amount, status);

  // Validate required fields
  if (!orderId || !method || !amount) {
    throw new ErrorResponse("orderId, method, and amount are required", statusCode.Bad_Request);
  }

  // Validate payment method
  const validPaymentMethods = ["CASH", "CREDIT_CARD", "UPI"];
  if (!validPaymentMethods.includes(method.toUpperCase())) {
    throw new ErrorResponse("Invalid payment method", statusCode.Bad_Request);
  }

  // Validate orderId
  const orderIdInt = parseInt(orderId);
  if (isNaN(orderIdInt)) {
    throw new ErrorResponse("Invalid orderId", statusCode.Bad_Request);
  }

  // Validate amount
  const amountFloat = parseFloat(amount);
  if (isNaN(amountFloat) || amountFloat <= 0) {
    throw new ErrorResponse("Amount must be a valid positive number", statusCode.Bad_Request);
  }

  try {
    // Check if the order exists
    const order = await prisma.order.findUnique({
      where: { id: orderIdInt },
    });

    if (!order) {
      throw new ErrorResponse("Order not found", statusCode.Not_Found);
    }

    // Check if a payment already exists
    const existingPayment = await prisma.payment.findUnique({
      where: { orderId: orderIdInt },
    });

    if (existingPayment) {
      throw new ErrorResponse("A payment already exists for this order", statusCode.Bad_Request);
    }

    // Create the payment record
    const payment = await prisma.payment.create({
      data: {
        orderId: orderIdInt,
        amount: amountFloat,
        method: method.toUpperCase(),
        status: status?.toUpperCase() || "PENDING",
        transactionId: `txn_${Date.now()}`,
        paidAt: new Date(),
        isActive: true,
      },
    });

    return SuccessResponse(res, "Payment created successfully", payment, statusCode.Created);
  } catch (error) {
    console.error("Error creating payment:", error);
    throw new ErrorResponse("Internal server error", statusCode.Internal_Server_Error);
  }
});

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

      if (status) filters.status = status.toUpperCase();
      if (paymentMethod) filters.method = paymentMethod.toUpperCase();
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
      console.error("Error fetching payments:", error);
      throw new ErrorResponse("Internal server error", statusCode.Internal_Server_Error);
    }
  }
);

export const getPaymentById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    throw new ErrorResponse("Payment ID is required", statusCode.Bad_Request);
  }

  const paymentId = parseInt(id);
  if (isNaN(paymentId)) {
    throw new ErrorResponse("Invalid payment ID", statusCode.Bad_Request);
  }

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { order: true }, // Include order details for better context
  });

  if (!payment) {
    throw new ErrorResponse("Payment not found", statusCode.Not_Found);
  }

  return SuccessResponse(res, "Payment fetched successfully", payment);
});