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
exports.updateShop = exports.getShopById = exports.getAllShops = exports.createShop = void 0;
const zod_1 = require("zod");
const cloudinary_1 = require("../config/cloudinary");
const prisma_1 = __importDefault(require("../config/prisma"));
const error_middleware_1 = require("../middleware/error.middleware");
const response_utils_1 = require("../utils/response.utils");
const shop_1 = require("../validators/shop");
const env_1 = __importDefault(require("../config/env"));
// Type guard function to check if an object is a CloudinaryResponse
function isCloudinaryResponse(obj) {
    return obj && typeof obj === 'object' && 'public_id' in obj && 'secure_url' in obj;
}
exports.createShop = (0, error_middleware_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const validatedData = shop_1.ShopSchema.parse(req.body);
    // const image = req.file;
    // if(!image) {
    //     return res.status(400).json({ message: "Image is required" });
    // }
    const files = req.files;
    if (!files ||
        !Array.isArray(files["shopLicense"]) ||
        !Array.isArray(files["gstCertificate"]) ||
        !Array.isArray(files["storagePermissionCertificate"]) ||
        !Array.isArray(files["fassiLicense"]) ||
        files["shopLicense"].length === 0 ||
        files["gstCertificate"].length === 0 ||
        files["storagePermissionCertificate"].length === 0 ||
        files["fassiLicense"].length === 0) {
        return res.status(400).json({ message: "All license images (shopLicense, gstCertificate, storagePermissionCertificate, fassiLicense) are required" });
    }
    const imageSchema = zod_1.z.object({
        mimetype: zod_1.z.string().refine((val) => val.startsWith("image/"), {
            message: "File must be an image",
        }),
        size: zod_1.z.number().max(1 * 1024 * 1024, "File size must be less than 1MB"),
    });
    [files["shopLicense"][0], files["gstCertificate"][0], files["storagePermissionCertificate"][0], files["fassiLicense"][0]].forEach((file) => imageSchema.parse(file));
    let imageUrl = null;
    if (files["image"] && files["image"].length > 0) {
        imageSchema.parse(files["image"][0]);
        imageUrl = yield (0, cloudinary_1.uploadToCloudinary)(files["image"][0].buffer, env_1.default.cloud_name);
    }
    const shopLicenseUrl = yield (0, cloudinary_1.uploadToCloudinary)(files["shopLicense"][0].buffer, env_1.default.cloud_name);
    const gstCertificateUrl = yield (0, cloudinary_1.uploadToCloudinary)(files["gstCertificate"][0].buffer, env_1.default.cloud_name);
    const storagePermissionCertificateUrl = yield (0, cloudinary_1.uploadToCloudinary)(files["storagePermissionCertificate"][0].buffer, env_1.default.cloud_name);
    const fassiLicenseUrl = yield (0, cloudinary_1.uploadToCloudinary)(files["fassiLicense"][0].buffer, env_1.default.cloud_name);
    const shop = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const newShop = yield tx.shop.create({
            data: Object.assign(Object.assign({}, validatedData), { image: imageUrl }),
        });
        yield tx.licenses.create({
            data: {
                shopId: newShop.id,
                shopLicense: shopLicenseUrl,
                gstCertificate: gstCertificateUrl,
                storagePermissionCertificate: storagePermissionCertificateUrl,
                fassiLicense: fassiLicenseUrl,
            },
        });
        return newShop;
    }));
    return (0, response_utils_1.SuccessResponse)(res, "Shop created successfully", shop, 201);
}));
exports.getAllShops = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchQuery = req.query.search;
    const skip = (page - 1) * limit;
    const where = {};
    if (searchQuery) {
        where.OR = [
            { name: { contains: searchQuery } },
            { location: { contains: searchQuery } },
            { ownerName: { contains: searchQuery } },
        ];
    }
    const [shop, totalShop] = yield Promise.all([
        prisma_1.default.shop.findMany({
            skip,
            take: limit,
            where,
            include: { licenses: true, products: true }
        }),
        prisma_1.default.shop.count({
            where,
        })
    ]);
    return (0, response_utils_1.SuccessResponse)(res, "Shops retrieved successfully", {
        shop,
        totalShop,
        currentPage: page,
        totalPages: Math.ceil(totalShop / limit),
        count: shop.length
    });
}));
exports.getShopById = (0, error_middleware_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: "Shop ID is required" });
    }
    const shop = yield prisma_1.default.shop.findUnique({
        where: { id: parseInt(id) },
        include: {
            products: true,
            licenses: true
        },
    });
    if (!shop) {
        return res.status(404).json({ message: "Shop not found" });
    }
    return (0, response_utils_1.SuccessResponse)(res, "Shop retrieved successfully", shop);
}));
exports.updateShop = (0, error_middleware_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: "Shop ID is required" });
    }
    const validatedData = shop_1.ShopSchema.partial().parse(req.body);
    const files = req.files;
    const imageSchema = zod_1.z.object({
        mimetype: zod_1.z.string().refine((val) => val.startsWith("image/"), {
            message: "File must be an image",
        }),
        size: zod_1.z.number().max(1 * 1024 * 1024, "File size must be less than 1MB"),
    });
    const shop = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        // Fetch existing shop and licenses
        const existingShop = yield tx.shop.findUnique({
            where: { id: parseInt(id) },
            include: { licenses: true },
        });
        if (!existingShop) {
            throw new Error("Shop not found");
        }
        // Prepare shop update data
        const shopUpdateData = Object.assign({}, validatedData);
        // Handle shop image update
        if ((files === null || files === void 0 ? void 0 : files["image"]) && files["image"].length > 0) {
            imageSchema.parse(files["image"][0]);
            const newImageUrl = yield (0, cloudinary_1.uploadToCloudinary)(files["image"][0].buffer, env_1.default.cloud_name);
            shopUpdateData.image = newImageUrl;
            // Delete old image from Cloudinary if it exists
            if (isCloudinaryResponse(existingShop.image)) {
                yield (0, cloudinary_1.deleteFromCloudinary)(existingShop.image.public_id);
            }
        }
        // Prepare licenses update data
        const licensesUpdateData = {};
        const licenseFields = [
            "shopLicense",
            "gstCertificate",
            "storagePermissionCertificate",
            "fassiLicense",
        ];
        for (const field of licenseFields) {
            if ((files === null || files === void 0 ? void 0 : files[field]) && files[field].length > 0) {
                imageSchema.parse(files[field][0]);
                const newUrl = yield (0, cloudinary_1.uploadToCloudinary)(files[field][0].buffer, env_1.default.cloud_name);
                licensesUpdateData[field] = newUrl;
                // Delete old license image from Cloudinary if it exists
                const license = (_a = existingShop.licenses) === null || _a === void 0 ? void 0 : _a[0];
                if (license) {
                    const oldLicenseData = license[field];
                    if (isCloudinaryResponse(oldLicenseData)) {
                        yield (0, cloudinary_1.deleteFromCloudinary)(oldLicenseData.public_id);
                    }
                }
            }
        }
        // Update shop
        const updatedShop = yield tx.shop.update({
            where: { id: parseInt(id) },
            data: shopUpdateData,
            include: {
                licenses: true,
            }
        });
        // Update licenses if any license files were provided
        if (Object.keys(licensesUpdateData).length > 0 && ((_b = existingShop.licenses) === null || _b === void 0 ? void 0 : _b[0])) {
            yield tx.licenses.update({
                where: { id: existingShop.licenses[0].id },
                data: licensesUpdateData,
            });
        }
        return updatedShop;
    }));
    return (0, response_utils_1.SuccessResponse)(res, "Shop updated successfully", shop);
}));
