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
exports.AuthnticateAdmin = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const types_1 = require("../types/types");
const jwt_utils_1 = require("../utils/jwt.utils");
const response_utils_1 = require("../utils/response.utils");
const error_middleware_1 = require("./error.middleware");
exports.AuthnticateAdmin = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    // Get token from various sources
    const token = ((_a = req.cookies) === null || _a === void 0 ? void 0 : _a.token) ||
        ((_c = (_b = req.headers.authorization) === null || _b === void 0 ? void 0 : _b.split('Bearer ')[1]) === null || _c === void 0 ? void 0 : _c.trim()) ||
        ((_e = (_d = req.headers.cookie) === null || _d === void 0 ? void 0 : _d.split('token=')[1]) === null || _e === void 0 ? void 0 : _e.trim());
    if (!token) {
        return next(new response_utils_1.ErrorResponse("Authorization token required", types_1.statusCode.Unauthorized));
    }
    // Verify and decode token
    let decoded;
    try {
        decoded = (0, jwt_utils_1.verifyToken)(token);
        // Additional validation for decoded payload
        if (!(decoded === null || decoded === void 0 ? void 0 : decoded.id) || typeof decoded.id !== 'number') {
            return next(new response_utils_1.ErrorResponse("Invalid token payload", types_1.statusCode.Unauthorized));
        }
    }
    catch (error) {
        console.error("Token verification error:", error);
        return next(new response_utils_1.ErrorResponse("Invalid or expired token", types_1.statusCode.Unauthorized));
    }
    // Find admin in database
    try {
        const admin = yield prisma_1.default.admin.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                name: true,
                email: true
            },
        });
        if (!admin) {
            return next(new response_utils_1.ErrorResponse("Admin account not found", types_1.statusCode.Unauthorized));
        }
        // Attach admin to request
        req.admin = {
            id: admin.id,
            name: (_f = admin.name) !== null && _f !== void 0 ? _f : undefined,
            email: (_g = admin.email) !== null && _g !== void 0 ? _g : undefined,
        };
        next();
    }
    catch (error) {
        console.error("Database error during authentication:", error);
        return next(new response_utils_1.ErrorResponse("Authentication failed", types_1.statusCode.Internal_Server_Error));
    }
}));
