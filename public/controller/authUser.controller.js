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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.createUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const error_middleware_1 = require("../middleware/error.middleware");
const response_utils_1 = require("../utils/response.utils");
const types_1 = require("../types/types");
const env_1 = __importDefault(require("../config/env"));
const prisma_1 = __importDefault(require("../config/prisma"));
const bcrypt_1 = __importDefault(require("bcrypt"));
exports.createUser = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return next(new response_utils_1.ErrorResponse("All fields are required", types_1.statusCode.Bad_Request));
    }
    const existingUser = yield prisma_1.default.user.findUnique({
        where: { email },
    });
    if (existingUser) {
        return next(new response_utils_1.ErrorResponse("User already exists", types_1.statusCode.Conflict));
    }
    const hashedPassword = yield bcrypt_1.default.hash(password, 10);
    const user = yield prisma_1.default.user.create({
        data: {
            name,
            email,
            password: hashedPassword, // Store the hashed password
        },
    });
    (0, response_utils_1.SuccessResponse)(res, "User created successfully", { user });
}));
exports.loginUser = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new response_utils_1.ErrorResponse("Email and password are required", types_1.statusCode.Bad_Request));
    }
    const user = yield prisma_1.default.user.findUnique({
        where: { email },
    });
    if (!user) {
        return next(new response_utils_1.ErrorResponse("Invalid email or password", types_1.statusCode.Unauthorized));
    }
    // ✅ Compare hashed password
    const isMatch = yield bcrypt_1.default.compare(password, user.password);
    if (!isMatch) {
        return next(new response_utils_1.ErrorResponse("Invalid email or password", types_1.statusCode.Unauthorized));
    }
    // ✅ Generate JWT token
    if (!env_1.default.JWT_SECRET) {
        return next(new response_utils_1.ErrorResponse("JWT secret is not defined", types_1.statusCode.Internal_Server_Error));
    }
    const token = jsonwebtoken_1.default.sign({ id: user.id }, env_1.default.JWT_SECRET, { expiresIn: '30d' });
    // ✅ Never send password in response
    const { password: _ } = user, userWithoutPassword = __rest(user, ["password"]);
    (0, response_utils_1.SuccessResponse)(res, "Login successful", {
        user: userWithoutPassword,
        token,
    });
}));
