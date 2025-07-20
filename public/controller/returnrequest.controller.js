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
exports.getReturnRequestbyId = exports.getAllReturnRequests = exports.createReturnRequest = void 0;
const error_middleware_1 = require("../middleware/error.middleware");
const response_utils_1 = require("../utils/response.utils");
const prisma_1 = __importDefault(require("../config/prisma"));
exports.createReturnRequest = (0, error_middleware_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { orderId, reason, status } = req.body;
    if (!orderId || !reason || !status) {
        return res.status(400).json({ message: "All fields are required" });
    }
    const returnRequest = yield prisma_1.default.returnRequest.create({
        data: {
            orderId,
            reason,
            status,
        },
    });
    return (0, response_utils_1.SuccessResponse)(res, "Return request created successfully", returnRequest, 201);
}));
exports.getAllReturnRequests = (0, error_middleware_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    // Filter parameters
    const filters = {};
    if (req.query.status)
        filters.status = req.query.status;
    if (req.query.userId)
        filters.userId = parseInt(req.query.userId);
    if (req.query.orderId)
        filters.orderId = parseInt(req.query.orderId);
    if (req.query.startDate)
        filters.startDate = req.query.startDate;
    if (req.query.endDate)
        filters.endDate = req.query.endDate;
    // Build the where clause for Prisma
    const where = {};
    if (filters.status)
        where.status = filters.status;
    if (filters.userId)
        where.userId = filters.userId;
    if (filters.orderId)
        where.orderId = filters.orderId;
    // Date range filtering
    if (filters.startDate || filters.endDate) {
        where.createdAt = {};
        if (filters.startDate)
            where.createdAt.gte = new Date(filters.startDate);
        if (filters.endDate)
            where.createdAt.lte = new Date(filters.endDate);
    }
    // Get return requests with pagination and filtering
    const [returnRequests, totalCount] = yield Promise.all([
        prisma_1.default.returnRequest.findMany({
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
        prisma_1.default.returnRequest.count({ where })
    ]);
    return (0, response_utils_1.SuccessResponse)(res, "Return requests retrieved successfully", {
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
}));
exports.getReturnRequestbyId = (0, error_middleware_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const returnRequest = yield prisma_1.default.returnRequest.findUnique({
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
    return (0, response_utils_1.SuccessResponse)(res, "Return request retrieved successfully", returnRequest);
}));
