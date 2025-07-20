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
exports.Authnticateuser = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const types_1 = require("../types/types");
const jwt_utils_1 = require("../utils/jwt.utils");
const response_utils_1 = require("../utils/response.utils");
const error_middleware_1 = require("./error.middleware");
exports.Authnticateuser = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    const tokenFromCookie = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.token;
    const tokenFromHeader = ((_c = (_b = req.headers["authorization"]) === null || _b === void 0 ? void 0 : _b.split("Bearer ")[1]) === null || _c === void 0 ? void 0 : _c.trim()) ||
        ((_e = (_d = req.headers.cookie) === null || _d === void 0 ? void 0 : _d.split("=")[1]) === null || _e === void 0 ? void 0 : _e.trim());
    const tokenFromHeader2 = (_g = (_f = req.headers["authorization"]) === null || _f === void 0 ? void 0 : _f.split("Bearer ")[1]) === null || _g === void 0 ? void 0 : _g.trim();
    const token = tokenFromCookie || tokenFromHeader || tokenFromHeader2;
    if (!token) {
        return next(new response_utils_1.ErrorResponse("Not authorized, token missing", types_1.statusCode.Unauthorized));
    }
    let decoded;
    try {
        decoded = (0, jwt_utils_1.verifyToken)(token);
    }
    catch (error) {
        return next(new response_utils_1.ErrorResponse("Invalid or expired token", types_1.statusCode.Unauthorized));
    }
    const user = yield prisma_1.default.user.findUnique({
        where: { id: decoded.id },
        select: {
            id: true,
            name: true,
            email: true
        },
    });
    if (!user) {
        return next(new response_utils_1.ErrorResponse("User not found", types_1.statusCode.Unauthorized));
    }
    // Only assign the required user fields to req.user
    req.user = {
        id: user.id,
        name: (_h = user.name) !== null && _h !== void 0 ? _h : undefined,
        email: (_j = user.email) !== null && _j !== void 0 ? _j : undefined,
    };
    next();
}));
