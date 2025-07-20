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
exports.addCartItem = void 0;
const error_middleware_1 = require("../middleware/error.middleware");
const response_utils_1 = require("../utils/response.utils");
const types_1 = require("../types/types");
const prisma_1 = __importDefault(require("../config/prisma"));
exports.addCartItem = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { productId, quantity } = req.body;
    if (!productId || !quantity) {
        return next(new response_utils_1.ErrorResponse("Product ID and quantity are required", types_1.statusCode.Bad_Request));
    }
    if (!req.user || !req.user.id) {
        return next(new response_utils_1.ErrorResponse("Unauthorized", types_1.statusCode.Unauthorized));
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
