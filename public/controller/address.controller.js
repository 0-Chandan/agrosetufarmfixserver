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
exports.updateAddress = exports.getAddressById = exports.getAllAddresses = exports.addAddress = void 0;
const error_middleware_1 = require("../middleware/error.middleware");
const response_utils_1 = require("../utils/response.utils");
const prisma_1 = __importDefault(require("../config/prisma"));
exports.addAddress = (0, error_middleware_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { addressLine1, city, state, name, pinCode, phone, addressLine2, country } = req.body;
    console.log("data:", addressLine1, city, state, name, pinCode, phone, addressLine2, country);
    if (!addressLine1 || !city || !state || !name || !pinCode || !phone || !country) {
        return res.status(400).json({ message: "All fields are required" });
    }
    // ✅ Check that req.user.id exists
    if (!req.user || typeof req.user.id !== "number") {
        return res.status(401).json({ message: "Unauthorized or invalid user" });
    }
    const address = yield prisma_1.default.address.create({
        data: {
            userId: req.user.id, // ✅ Guaranteed to be a number now
            name,
            phone,
            addressLine1,
            addressLine2: addressLine2 || "",
            city,
            state,
            pinCode,
            country,
        },
    });
    return (0, response_utils_1.SuccessResponse)(res, "Address added successfully", address, 201);
}));
exports.getAllAddresses = (0, error_middleware_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // ✅ Ensure user is authenticated
    if (!req.user || typeof req.user.id !== "number") {
        return res.status(401).json({ message: "Unauthorized or invalid user" });
    }
    const { page = "1", limit = "10", city, state, country, pinCode, } = req.query;
    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);
    // ✅ Build filter object
    const filters = {
        userId: req.user.id,
    };
    if (city)
        filters.city = { contains: city, mode: "insensitive" };
    if (state)
        filters.state = { contains: state, mode: "insensitive" };
    if (country)
        filters.country = { contains: country, mode: "insensitive" };
    if (pinCode)
        filters.pinCode = pinCode;
    // ✅ Query addresses with pagination and filters
    const addresses = yield prisma_1.default.address.findMany({
        where: filters,
        skip: (pageInt - 1) * limitInt,
        take: limitInt,
        orderBy: {
            createdAt: "desc",
        },
    });
    // ✅ Count total matching records
    const total = yield prisma_1.default.address.count({ where: filters });
    return (0, response_utils_1.SuccessResponse)(res, "Addresses retrieved successfully", {
        data: addresses,
        total,
        page: pageInt,
        limit: limitInt,
        totalPages: Math.ceil(total / limitInt),
    });
}));
exports.getAddressById = (0, error_middleware_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const addressId = parseInt(req.params.id);
    if (isNaN(addressId)) {
        return res.status(400).json({ message: "Invalid address ID" });
    }
    // ✅ Ensure user is authenticated
    if (!req.user || typeof req.user.id !== "number") {
        return res.status(401).json({ message: "Unauthorized or invalid user" });
    }
    const address = yield prisma_1.default.address.findUnique({
        where: { id: addressId, userId: req.user.id },
    });
    if (!address) {
        return res.status(404).json({ message: "Address not found" });
    }
    return (0, response_utils_1.SuccessResponse)(res, "Address retrieved successfully", address);
}));
exports.updateAddress = (0, error_middleware_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const addressId = parseInt(req.params.id);
    if (isNaN(addressId)) {
        return res.status(400).json({ message: "Invalid address ID" });
    }
    // ✅ Ensure user is authenticated
    if (!req.user || typeof req.user.id !== "number") {
        return res.status(401).json({ message: "Unauthorized or invalid user" });
    }
    const address = yield prisma_1.default.address.update({
        where: { id: addressId, userId: req.user.id },
        data: req.body,
    });
    return (0, response_utils_1.SuccessResponse)(res, "Address updated successfully", address);
}));
