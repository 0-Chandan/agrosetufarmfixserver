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
exports.updateProduct = exports.getProductById = exports.getAllProducts = exports.addproduct = void 0;
const error_middleware_1 = require("../middleware/error.middleware");
const response_utils_1 = require("../utils/response.utils");
const prisma_1 = __importDefault(require("../config/prisma"));
const cloudinary_1 = require("../config/cloudinary");
const env_1 = __importDefault(require("../config/env"));
exports.addproduct = (0, error_middleware_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, description, price, originalPrice, unit, brand, stock, seller, rating, discount, category, shopId } = req.body;
    if (!name || !description || !price || !originalPrice || !unit || !brand || !stock) {
        return res.status(400).json({ message: "All fields are required" });
    }
    let image = null;
    if (req.file) {
        const cloudinaryImage = yield (0, cloudinary_1.uploadToCloudinary)(req.file.buffer, env_1.default.cloud_name);
        image = cloudinaryImage;
    }
    const product = yield prisma_1.default.product.create({
        data: {
            name,
            description,
            price: parseFloat(price),
            originalPrice: Number(originalPrice),
            unit,
            brand,
            stock: Number(stock),
            image: image ? image : null,
            shopId,
            seller,
            rating: Number(rating),
            discount: Number(discount),
            category,
        },
    });
    return (0, response_utils_1.SuccessResponse)(res, "Product added successfully", product, 201);
}));
exports.getAllProducts = (0, error_middleware_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { search = "", minPrice, maxPrice, page = "1", limit = "9", sort = "newest", } = req.query;
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;
    const filters = { AND: [] };
    if (search) {
        filters.AND.push({
            OR: [
                { name: { contains: search } },
                { description: { contains: search } },
            ],
        });
    }
    if (minPrice) {
        filters.AND.push({ price: { gte: parseFloat(minPrice) } });
    }
    if (maxPrice) {
        filters.AND.push({ price: { lte: parseFloat(maxPrice) } });
    }
    const orderBy = sort === "low"
        ? { price: "asc" }
        : sort === "high"
            ? { price: "desc" }
            : { createdAt: "desc" };
    const [products, total] = yield Promise.all([
        prisma_1.default.product.findMany({
            where: filters.AND.length > 0 ? filters : undefined,
            skip,
            take: pageSize,
        }),
        prisma_1.default.product.count({
            where: filters.AND.length > 0 ? filters : undefined,
        }),
    ]);
    const pagination = {
        total,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
    };
    (0, response_utils_1.SuccessResponse)(res, "Products fetched successfully", { products, pagination });
}));
exports.getProductById = (0, error_middleware_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: "Product ID is required" });
    }
    const product = yield prisma_1.default.product.findUnique({
        where: { id: parseInt(id) },
    });
    if (!product) {
        return res.status(404).json({ message: "Product not found" });
    }
    (0, response_utils_1.SuccessResponse)(res, "Product fetched successfully", product);
}));
exports.updateProduct = (0, error_middleware_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: "Product ID is required" });
    }
    const updatedata = {};
    if (req.body.name)
        updatedata.name = req.body.name;
    if (req.body.description)
        updatedata.description = req.body.description;
    if (req.body.price)
        updatedata.price = parseFloat(req.body.price);
    if (req.body.originalPrice)
        updatedata.originalPrice = Number(req.body.originalPrice);
    if (req.body.unit)
        updatedata.unit = req.body.unit;
    if (req.body.brand)
        updatedata.brand = req.body.brand;
    if (req.body.stock)
        updatedata.stock = Number(req.body.stock);
    if (req.body.seller)
        updatedata.seller = req.body.seller;
    if (req.body.rating)
        updatedata.rating = Number(req.body.rating);
    if (req.body.discount)
        updatedata.discount = Number(req.body.discount);
    if (req.body.category)
        updatedata.category = req.body.category;
    if (req.file) {
        // Fetch the existing product to get the current imageUrl
        const existingProduct = yield prisma_1.default.product.findUnique({
            where: { id: parseInt(id) },
            select: { imageUrl: true },
        });
        // Delete the previous image from Cloudinary if it exists
        if (existingProduct === null || existingProduct === void 0 ? void 0 : existingProduct.imageUrl) {
            const publicId = (_a = existingProduct.imageUrl.split('/').pop()) === null || _a === void 0 ? void 0 : _a.split('.')[0]; // Extract public_id from URL
            if (publicId) {
                yield (0, cloudinary_1.deleteFromCloudinary)(publicId);
            }
        }
        // Upload new image to Cloudinary
        const cloudinaryImage = yield (0, cloudinary_1.uploadToCloudinary)(req.file.buffer, "products");
        updatedata.imageUrl = cloudinaryImage;
    }
    const product = yield prisma_1.default.product.update({
        where: { id: parseInt(id) },
        data: updatedata,
    });
    (0, response_utils_1.SuccessResponse)(res, "Product updated successfully", product);
}));
