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
exports.getOrderById = exports.getAllOrders = exports.createOrder = void 0;
const error_middleware_1 = require("../middleware/error.middleware");
const response_utils_1 = require("../utils/response.utils");
const prisma_1 = __importDefault(require("../config/prisma"));
const types_1 = require("../types/types");
exports.createOrder = (0, error_middleware_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, productId, quantity, addressId, couponId } = req.body;
    // Validate required fields
    if (!userId || !productId || !quantity || !addressId) {
        throw new response_utils_1.ErrorResponse("userId, productId, quantity, and addressId are required", types_1.statusCode.Bad_Request);
    }
    try {
        // Verify product exists and get price
        const product = yield prisma_1.default.product.findUnique({
            where: { id: productId },
            select: { price: true, stock: true }
        });
        if (!product) {
            throw new response_utils_1.ErrorResponse("Product not found", types_1.statusCode.Not_Found);
        }
        // Check stock availability
        if (product.stock < quantity) {
            throw new response_utils_1.ErrorResponse("Insufficient stock available", types_1.statusCode.Bad_Request);
        }
        // Calculate total price
        let totalPrice = product.price * quantity;
        let discount = 0;
        // Apply coupon if provided
        if (couponId) {
            const coupon = yield prisma_1.default.coupon.findUnique({
                where: { id: couponId }
            });
            if (coupon) {
                discount = coupon.discount || 0;
                totalPrice -= discount;
            }
        }
        // Create the order
        const order = yield prisma_1.default.order.create({
            data: {
                userId,
                addressId,
                couponId: couponId || undefined, // Only set if couponId exists
                totalPrice,
                discount,
                status: "PENDING", // Initial status
                items: {
                    create: {
                        productId,
                        quantity,
                        price: product.price // Store price at time of order
                    }
                }
            },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                price: true
                            }
                        }
                    }
                },
                address: true,
                coupon: true
            }
        });
        // Update product stock
        yield prisma_1.default.product.update({
            where: { id: productId },
            data: { stock: { decrement: quantity } }
        });
        return (0, response_utils_1.SuccessResponse)(res, "Order created successfully", order, types_1.statusCode.Created);
    }
    catch (error) {
        console.error("Error creating order:", error);
        throw new response_utils_1.ErrorResponse("Failed to create order", types_1.statusCode.Internal_Server_Error);
    }
}));
exports.getAllOrders = (0, error_middleware_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orders = yield prisma_1.default.order.findMany();
        return (0, response_utils_1.SuccessResponse)(res, "All orders retrieved successfully", orders);
    }
    catch (error) {
        console.error("Error fetching orders:", error);
        throw new response_utils_1.ErrorResponse("Failed to retrieve orders", types_1.statusCode.Internal_Server_Error);
    }
}));
exports.getOrderById = (0, error_middleware_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const orderId = parseInt(req.params.id);
    if (isNaN(orderId)) {
        throw new response_utils_1.ErrorResponse("Invalid order ID", types_1.statusCode.Bad_Request);
    }
    try {
        const order = yield prisma_1.default.order.findUnique({
            where: { id: orderId },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                price: true
                            }
                        }
                    }
                },
                address: true,
                coupon: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
        if (!order) {
            return new response_utils_1.ErrorResponse("Order not found", types_1.statusCode.Not_Found);
        }
        return (0, response_utils_1.SuccessResponse)(res, "Order retrieved successfully", order);
    }
    catch (error) {
        console.error("Error fetching order:", error);
        throw new response_utils_1.ErrorResponse("Failed to retrieve order", types_1.statusCode.Internal_Server_Error);
    }
}));
// Add more order-related controllers as needed (update, cancel, etc.)
