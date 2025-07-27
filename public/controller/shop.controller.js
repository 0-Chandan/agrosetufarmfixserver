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
            licenses: true,
            products: true
        },
    });
    if (!shop) {
        return res.status(404).json({ message: "Shop not found" });
    }
    return (0, response_utils_1.SuccessResponse)(res, "Shop retrieved successfully", shop);
}));
exports.updateShop = (0, error_middleware_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: "Shop ID is required" });
    }
    const validatedData = shop_1.ShopSchema.partial().parse(req.body);
    const updatedData = Object.assign({}, validatedData);
    const files = req.files;
    // Handle image update
    if (files && files["image"] && files["image"].length > 0) {
        const imageSchema = zod_1.z.object({
            mimetype: zod_1.z.string().refine((val) => val.startsWith("image/"), {
                message: "File must be an image",
            }),
            size: zod_1.z.number().max(1 * 1024 * 1024, "File size must be less than 1MB"),
        });
        imageSchema.parse(files["image"][0]);
        // Delete existing image if present
        const existingShop = yield prisma_1.default.shop.findUnique({
            where: { id: parseInt(id) },
            select: { image: true },
        });
        if (existingShop === null || existingShop === void 0 ? void 0 : existingShop.image) {
            const publicId = (_a = existingShop.image.url.split("/").pop()) === null || _a === void 0 ? void 0 : _a.split(".")[0];
            if (publicId) {
                yield (0, cloudinary_1.deleteFromCloudinary)(publicId);
            }
        }
        const imageUrl = yield (0, cloudinary_1.uploadToCloudinary)(files["image"][0].buffer, `${env_1.default.cloud_name}/shops`);
        updatedData.image = { url: imageUrl };
    }
    // Handle license updates
    if (files && Object.keys(files).some((key) => ["shopLicense", "gstCertificate", "storagePermissionCertificate", "fassiLicense"].includes(key))) {
        const imageSchema = zod_1.z.object({
            mimetype: zod_1.z.string().refine((val) => val.startsWith("image/"), {
                message: "File must be an image",
            }),
            size: zod_1.z.number().max(1 * 1024 * 1024, "File size must be less than 1MB"),
        });
        const existingLicenses = yield prisma_1.default.licenses.findFirst({
            where: { shopId: parseInt(id) },
        });
        const licenseData = {};
        if (files["shopLicense"] && files["shopLicense"].length > 0) {
            imageSchema.parse(files["shopLicense"][0]);
            if (existingLicenses === null || existingLicenses === void 0 ? void 0 : existingLicenses.shopLicense) {
                const publicId = (_b = existingLicenses.shopLicense.url.split("/").pop()) === null || _b === void 0 ? void 0 : _b.split(".")[0];
                if (publicId)
                    yield (0, cloudinary_1.deleteFromCloudinary)(publicId);
            }
            licenseData.shopLicense = { url: yield (0, cloudinary_1.uploadToCloudinary)(files["shopLicense"][0].buffer, `${env_1.default.cloud_name}/shop-licenses`) };
        }
        if (files["gstCertificate"] && files["gstCertificate"].length > 0) {
            imageSchema.parse(files["gstCertificate"][0]);
            if (existingLicenses === null || existingLicenses === void 0 ? void 0 : existingLicenses.gstCertificate) {
                const publicId = (_c = existingLicenses.gstCertificate.url.split("/").pop()) === null || _c === void 0 ? void 0 : _c.split(".")[0];
                if (publicId)
                    yield (0, cloudinary_1.deleteFromCloudinary)(publicId);
            }
            licenseData.gstCertificate = { url: yield (0, cloudinary_1.uploadToCloudinary)(files["gstCertificate"][0].buffer, `${env_1.default.cloud_name}/shop-licenses`) };
        }
        if (files["storagePermissionCertificate"] && files["storagePermissionCertificate"].length > 0) {
            imageSchema.parse(files["storagePermissionCertificate"][0]);
            if (existingLicenses === null || existingLicenses === void 0 ? void 0 : existingLicenses.storagePermissionCertificate) {
                const publicId = (_d = existingLicenses.storagePermissionCertificate.url.split("/").pop()) === null || _d === void 0 ? void 0 : _d.split(".")[0];
                if (publicId)
                    yield (0, cloudinary_1.deleteFromCloudinary)(publicId);
            }
            licenseData.storagePermissionCertificate = { url: yield (0, cloudinary_1.uploadToCloudinary)(files["storagePermissionCertificate"][0].buffer, `${env_1.default.cloud_name}/shop-licenses`) };
        }
        if (files["fassiLicense"] && files["fassiLicense"].length > 0) {
            imageSchema.parse(files["fassiLicense"][0]);
            if (existingLicenses === null || existingLicenses === void 0 ? void 0 : existingLicenses.fassiLicense) {
                const publicId = (_e = existingLicenses.fassiLicense.url.split("/").pop()) === null || _e === void 0 ? void 0 : _e.split(".")[0];
                if (publicId)
                    yield (0, cloudinary_1.deleteFromCloudinary)(publicId);
            }
            licenseData.fassiLicense = { url: yield (0, cloudinary_1.uploadToCloudinary)(files["fassiLicense"][0].buffer, `${env_1.default.cloud_name}/shop-licenses`) };
        }
        if (Object.keys(licenseData).length > 0) {
            yield prisma_1.default.licenses.updateMany({
                where: { shopId: parseInt(id) },
                data: licenseData,
            });
        }
    }
    const shop = yield prisma_1.default.shop.update({
        where: { id: parseInt(id) },
        data: updatedData,
        include: { licenses: true, products: true },
    });
    return (0, response_utils_1.SuccessResponse)(res, "Shop updated successfully", shop);
}));
