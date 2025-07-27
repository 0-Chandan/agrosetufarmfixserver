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
exports.deleteMandiPrice = exports.updateMandiPrice = exports.getMandiPriceById = exports.getAllMandiPrices = exports.createMandiPrice = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const error_middleware_1 = require("../middleware/error.middleware");
const response_utils_1 = require("../utils/response.utils");
const mandiPrice_1 = require("../validators/mandiPrice");
const createMandiPrice = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const validatedData = mandiPrice_1.MandiPriceSchema.parse(req.body);
    const mandiPrice = yield prisma_1.default.mandiPrice.create({
        data: validatedData,
    });
    return (0, response_utils_1.SuccessResponse)(res, "Mandi price created successfully", mandiPrice, 201);
}));
exports.createMandiPrice = createMandiPrice;
const getAllMandiPrices = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { page = "1", limit = "10", search = "", } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where = {};
    if (search) {
        where.OR = [
            { cropName: { contains: search } },
        ];
    }
    const [mandiPrices, total] = yield Promise.all([
        prisma_1.default.mandiPrice.findMany({
            where,
            skip: Number(skip),
            take: Number(limit),
        }),
        prisma_1.default.mandiPrice.count({ where }),
    ]);
    const totalPages = Math.ceil(total / Number(limit));
    return (0, response_utils_1.SuccessResponse)(res, "Mandi prices fetched successfully", {
        mandiPrices,
        totalItems: total,
        totalPages,
        currentPage: Number(page),
        count: mandiPrices.length
    });
}));
exports.getAllMandiPrices = getAllMandiPrices;
const getMandiPriceById = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const mandiPrice = yield prisma_1.default.mandiPrice.findUnique({
        where: {
            id: Number(id),
        },
    });
    if (!mandiPrice) {
        return next(new response_utils_1.ErrorResponse("Mandi price not found", 404));
    }
    return (0, response_utils_1.SuccessResponse)(res, "Mandi price fetched successfully", mandiPrice);
}));
exports.getMandiPriceById = getMandiPriceById;
const updateMandiPrice = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const validatedData = mandiPrice_1.MandiPriceSchema.partial().parse(req.body);
    const mandiPrice = yield prisma_1.default.mandiPrice.update({
        where: {
            id: Number(id),
        },
        data: {
            cropName: validatedData.cropName,
            currentPrice: validatedData.currentPrice,
            lastPrice: validatedData.lastPrice,
        },
    });
    return (0, response_utils_1.SuccessResponse)(res, "Mandi price updated successfully", mandiPrice);
}));
exports.updateMandiPrice = updateMandiPrice;
const deleteMandiPrice = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id) {
        return next(new response_utils_1.ErrorResponse("Mandi price id is required", 400));
    }
    const mandiPrice = yield prisma_1.default.mandiPrice.delete({
        where: {
            id: Number(id),
        },
    });
    if (!mandiPrice) {
        return next(new response_utils_1.ErrorResponse("Mandi price not found", 404));
    }
    return (0, response_utils_1.SuccessResponse)(res, "Mandi price deleted successfully", mandiPrice);
}));
exports.deleteMandiPrice = deleteMandiPrice;
