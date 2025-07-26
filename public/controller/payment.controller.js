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
const types_1 = require("../types/types");
const prisma_1 = __importDefault(require("../config/prisma"));
exports.addpayment = (0, error_middleware_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { orderId, method, amount, status } = req.body;
    console.log("data:", orderId, method, amount, status);
    // Validate required fields
    if (!orderId || !method || !amount) {
        throw new response_utils_1.ErrorResponse("orderId, method, and amount are required", types_1.statusCode.Bad_Request);
    }
    // Validate payment method
    const validPaymentMethods = ["CASH", "CREDIT_CARD", "UPI"];
    if (!validPaymentMethods.includes(method.toUpperCase())) {
        throw new response_utils_1.ErrorResponse("Invalid payment method", types_1.statusCode.Bad_Request);
    }
    // Validate amount
    const amountFloat = parseFloat(amount);
    if (isNaN(amountFloat) || amountFloat <= 0) {
        throw new response_utils_1.ErrorResponse("Amount must be a valid positive number", types_1.statusCode.Bad_Request);
    }
    try {
        // Check if the order exists
        const order = yield prisma_1.default.order.findUnique({
            where: { id: orderId },
        });
        if (!order) {
            throw new response_utils_1.ErrorResponse("Order not found", types_1.statusCode.Not_Found);
        }
        // Check if a payment already exists
        const existingPayment = yield prisma_1.default.payment.findUnique({
            where: { orderId },
        });
        if (existingPayment) {
            throw new response_utils_1.ErrorResponse("A payment already exists for this order", types_1.statusCode.Bad_Request);
        }
        // Create the payment record
        const payment = yield prisma_1.default.payment.create({
            data: {
                orderId,
                amount: amountFloat,
                method: method.toUpperCase(),
                status: (status === null || status === void 0 ? void 0 : status.toUpperCase()) || "PENDING",
                transactionId: `txn_${Date.now()}`,
                paidAt: new Date(),
                isActive: true,
            },
        });
        return (0, response_utils_1.SuccessResponse)(res, "Payment created successfully", payment, types_1.statusCode.Created);
    }
    catch (error) {
        console.error("Error creating payment:", error);
        throw new response_utils_1.ErrorResponse("Internal server error", types_1.statusCode.Internal_Server_Error);
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
