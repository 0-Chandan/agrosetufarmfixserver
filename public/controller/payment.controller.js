"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaymentById = exports.getpaymentall = exports.addpayment = void 0;
const error_middleware_1 = require("../middleware/error.middleware");
const response_utils_1 = require("../utils/response.utils");
const prisma_1 = __importDefault(require("../config/prisma"));
exports.addpayment = (0, error_middleware_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { orderId, paymentMethod, amount } = req.body;
    // Validate required fields
    if (!orderId || !paymentMethod || !amount) {
        return res.status(400).json({ message: "orderId, paymentMethod, and amount are required" });
    }
    try {
        // Check if the order exists
        const order = yield prisma_1.default.order.findUnique({
            where: { id: orderId }
        });
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        // Create the payment record
        const payment = yield prisma_1.default.payment.create({
            data: {
                orderId,
                method: "CASH", // Assuming payment method is cash
                status: "PENDING", // Initial status
                transactionId: `txn_${Date.now()}`, // Example transaction ID
                paidAt: new Date(),
            }
        });
        return (0, response_utils_1.SuccessResponse)(res, "Payment created successfully", payment, 201);
    }
    catch (error) {
        return res.status(500).json({ message: "Internal server error", error });
    }
}));
exports.getpaymentall = (0, error_middleware_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = "1", limit = "10", status, paymentMethod, userId, orderId, dateFrom, dateTo, sortBy = "createdAt", order = "desc", } = req.query;
        const pageInt = parseInt(page);
        const limitInt = parseInt(limit);
        // Build filters for Prisma
        const filters = {};
        if (status)
            filters.status = status;
        if (paymentMethod)
            filters.paymentMethod = paymentMethod;
        if (orderId)
            filters.orderId = parseInt(orderId);
        if (userId) {
            filters.order = {
                userId: parseInt(userId),
            };
        }
        if (dateFrom || dateTo) {
            filters.createdAt = {};
            if (dateFrom)
                filters.createdAt.gte = new Date(dateFrom);
            if (dateTo)
                filters.createdAt.lte = new Date(dateTo);
        }
        // Fetch payments with pagination and filters
        const payments = yield prisma_1.default.payment.findMany({
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
        const total = yield prisma_1.default.payment.count({
            where: filters,
        });
        return (0, response_utils_1.SuccessResponse)(res, "Payments retrieved successfully", {
            data: payments,
            total,
            page: pageInt,
            limit: limitInt,
            totalPages: Math.ceil(total / limitInt),
        }, 200);
    }
    catch (error) {
        return res.status(500).json({ message: "Internal server error", error });
    }
}));
exports.getPaymentById = (0, error_middleware_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: "Payment ID is required" });
    }
    const payment = yield prisma_1.default.payment.findUnique({
        where: { id: parseInt(id) },
    });
    if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
    }
    return (0, response_utils_1.SuccessResponse)(res, "Payment fetched successfully", payment);
}));
