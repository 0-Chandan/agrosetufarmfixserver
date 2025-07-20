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
exports.loginAdmin = exports.createAdmin = void 0;
const response_utils_1 = require("../utils/response.utils");
const types_1 = require("../types/types");
const prisma_1 = __importDefault(require("../config/prisma"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = __importDefault(require("../config/env"));
const error_middleware_1 = require("../middleware/error.middleware");
const bcrypt_1 = __importDefault(require("bcrypt"));
// Create Admin
exports.createAdmin = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return next(new response_utils_1.ErrorResponse("All fields are required", types_1.statusCode.Bad_Request));
    }
    const existingAdmin = yield prisma_1.default.admin.findUnique({
        where: { email },
    });
    if (existingAdmin) {
        return next(new response_utils_1.ErrorResponse("Admin already exists", types_1.statusCode.Conflict));
    }
    const hashedPassword = yield bcrypt_1.default.hash(password, 10); // Hashing password
    const admin = yield prisma_1.default.admin.create({
        data: {
            name,
            email,
            password: hashedPassword,
        },
    });
    (0, response_utils_1.SuccessResponse)(res, "Admin created successfully", { admin });
}));
// Login Admin
exports.loginAdmin = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new response_utils_1.ErrorResponse("Email and password are required", types_1.statusCode.Bad_Request));
    }
    const admin = yield prisma_1.default.admin.findMany({
        where: { email },
    });
    if (!admin || admin.length === 0) {
        return next(new response_utils_1.ErrorResponse("Invalid email or password", types_1.statusCode.Unauthorized));
    }
    const isPasswordValid = yield bcrypt_1.default.compare(password, admin[0].password);
    if (!isPasswordValid) {
        return next(new response_utils_1.ErrorResponse("Invalid email or password", types_1.statusCode.Unauthorized));
    }
    if (!env_1.default.JWT_SECRET) {
        return next(new response_utils_1.ErrorResponse("JWT secret is not defined", types_1.statusCode.Internal_Server_Error));
    }
    const token = jsonwebtoken_1.default.sign({ id: admin[0].id }, env_1.default.JWT_SECRET, {
        expiresIn: "30d",
    });
    (0, response_utils_1.SuccessResponse)(res, "Login successful", { admin: admin[0], token });
}));
