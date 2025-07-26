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
exports.clearCart = exports.deleteCartItem = exports.updateCartItem = exports.getCartItems = exports.addCartItem = void 0;
const error_middleware_1 = require("../middleware/error.middleware");
const response_utils_1 = require("../utils/response.utils");
const types_1 = require("../types/types");
const prisma_1 = __importDefault(require("../config/prisma"));
exports.addCartItem = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { productId, quantity } = req.body;
    if (!productId || !quantity) {
        return next(new response_utils_1.ErrorResponse("Product ID and quantity are required", types_1.statusCode.Bad_Request));
    }
    console.log(req.user);
    if (!req.user || !((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
        return next(new response_utils_1.ErrorResponse("Unauthorized", types_1.statusCode.Unauthorized));
    }
    // Validate product existence
    const product = yield prisma_1.default.product.findUnique({
        where: { id: productId },
    });
    if (!product) {
        return next(new response_utils_1.ErrorResponse("Product not found", types_1.statusCode.Not_Found));
    }
    // Validate quantity
    if (quantity < 1 || !Number.isInteger(quantity)) {
        return next(new response_utils_1.ErrorResponse("Quantity must be a positive integer", types_1.statusCode.Bad_Request));
    }
    // Check if product is in stock
    if (product.stock < quantity) {
        return next(new response_utils_1.ErrorResponse(`Insufficient stock: only ${product.stock} available`, types_1.statusCode.Bad_Request));
    }
    // Check if item already exists in cart
    const existingCartItem = yield prisma_1.default.cartItem.findFirst({
        where: {
            userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.id,
            productId,
        },
    });
    if (existingCartItem) {
        return next(new response_utils_1.ErrorResponse("Product already exists in cart. Use update to modify quantity", types_1.statusCode.Bad_Request));
    }
    const cartItem = yield prisma_1.default.cartItem.create({
        data: {
            userId: req.user.id,
            productId,
            quantity,
        },
    });
    (0, response_utils_1.SuccessResponse)(res, "Cart item added successfully", { cartItem });
}));
exports.getCartItems = (0, error_middleware_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user || !req.user.id) {
        return new response_utils_1.ErrorResponse("Unauthorized", types_1.statusCode.Unauthorized);
    }
    const cartItems = yield prisma_1.default.cartItem.findMany({
        where: {
            userId: req.user.id,
        },
        include: {
            product: true,
        },
    });
    (0, response_utils_1.SuccessResponse)(res, "Cart items retrieved successfully", { cartItems });
}));
exports.updateCartItem = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { quantity } = req.body;
    if (!id || !quantity) {
        return next(new response_utils_1.ErrorResponse("Cart item ID and quantity are required", types_1.statusCode.Bad_Request));
    }
    if (!req.user || !req.user.id) {
        return next(new response_utils_1.ErrorResponse("Unauthorized", types_1.statusCode.Unauthorized));
    }
    // Validate quantity
    if (quantity < 1 || !Number.isInteger(quantity)) {
        return next(new response_utils_1.ErrorResponse("Quantity must be a positive integer", types_1.statusCode.Bad_Request));
    }
    // Find cart item
    const cartItem = yield prisma_1.default.cartItem.findUnique({
        where: { id: parseInt(id) },
        include: {
            product: {
                select: { stock: true },
            },
        },
    });
    if (!cartItem) {
        return next(new response_utils_1.ErrorResponse("Cart item not found", types_1.statusCode.Not_Found));
    }
    if (cartItem.userId !== req.user.id) {
        return next(new response_utils_1.ErrorResponse("Unauthorized access to cart item", types_1.statusCode.Unauthorized));
    }
    // Check stock availability
    if (cartItem.product.stock < quantity) {
        return next(new response_utils_1.ErrorResponse(`Insufficient stock: only ${cartItem.product.stock} available`, types_1.statusCode.Bad_Request));
    }
    const updatedCartItem = yield prisma_1.default.cartItem.update({
        where: { id: parseInt(id) },
        data: { quantity },
        include: {
            product: true,
        },
    });
    (0, response_utils_1.SuccessResponse)(res, "Cart item updated successfully", { cartItem: updatedCartItem });
}));
exports.deleteCartItem = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id) {
        return next(new response_utils_1.ErrorResponse("Cart item ID is required", types_1.statusCode.Bad_Request));
    }
    if (!req.user || !req.user.id) {
        return next(new response_utils_1.ErrorResponse("Unauthorized", types_1.statusCode.Unauthorized));
    }
    const cartItem = yield prisma_1.default.cartItem.findUnique({
        where: { id: parseInt(id) },
    });
    if (!cartItem) {
        return next(new response_utils_1.ErrorResponse("Cart item not found", types_1.statusCode.Not_Found));
    }
    if (cartItem.userId !== req.user.id) {
        return next(new response_utils_1.ErrorResponse("Unauthorized access to cart item", types_1.statusCode.Unauthorized));
    }
    // Soft delete by updating isActive to false
    yield prisma_1.default.cartItem.delete({
        where: { id: parseInt(id) },
        //data: { isActive: false },
    });
    (0, response_utils_1.SuccessResponse)(res, "Cart item deactivated successfully", {});
}));
exports.clearCart = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user || !req.user.id) {
        return next(new response_utils_1.ErrorResponse("Unauthorized", types_1.statusCode.Unauthorized));
    }
    yield prisma_1.default.cartItem.deleteMany({
        where: { userId: req.user.id },
    });
    (0, response_utils_1.SuccessResponse)(res, "Cart cleared successfully", {});
}));
