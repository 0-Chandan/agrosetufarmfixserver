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
exports.deleteOfficer = exports.updateOfficer = exports.getOfficerById = exports.getAllOffcer = exports.createOfficer = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const error_middleware_1 = require("../middleware/error.middleware");
const response_utils_1 = require("../utils/response.utils");
const officer_1 = require("../validators/officer");
const bcrypt_1 = __importDefault(require("bcrypt"));
exports.createOfficer = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const validatedData = officer_1.OfficerSchema.parse(req.body);
    const existingOfficer = yield prisma_1.default.officer.findUnique({
        where: { officerId: validatedData.officerId },
    });
    if (existingOfficer) {
        return res.status(400).json({ message: "Officer ID already exists" });
    }
    const hashedPassword = yield bcrypt_1.default.hash(validatedData.password, 10);
    const officer = yield prisma_1.default.officer.create({
        data: {
            officerId: validatedData.officerId,
            password: hashedPassword,
            place: validatedData.place,
            role: validatedData.role,
        },
    });
    const { password } = officer, officerWithoutPassword = __rest(officer, ["password"]);
    return (0, response_utils_1.SuccessResponse)(res, "Officer created successfully", officerWithoutPassword, 201);
}));
exports.getAllOffcer = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const officers = yield prisma_1.default.officer.findMany();
    const officersWithoutPassword = officers.map((officer) => {
        const { password } = officer, officerWithoutPassword = __rest(officer, ["password"]);
        return officerWithoutPassword;
    });
    return (0, response_utils_1.SuccessResponse)(res, "Officers retrieved successfully", officersWithoutPassword, 200);
}));
exports.getOfficerById = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const officerId = req.params.officerId;
    const officer = yield prisma_1.default.officer.findUnique({
        where: { officerId },
    });
    if (!officer) {
        return res.status(404).json({ message: "Officer not found" });
    }
    const { password } = officer, officerWithoutPassword = __rest(officer, ["password"]);
    return (0, response_utils_1.SuccessResponse)(res, "Officer retrieved successfully", officerWithoutPassword, 200);
}));
exports.updateOfficer = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: "Officer ID is required" });
    }
    const existingOfficer = yield prisma_1.default.officer.findUnique({
        where: { id: parseInt(id) },
    });
    if (!existingOfficer) {
        return res.status(404).json({ message: "Officer not found" });
    }
    const validatedData = officer_1.OfficerSchema.partial().parse(req.body);
    const existingOfficerId = yield prisma_1.default.officer.findFirst({
        where: { officerId: validatedData.officerId, NOT: { id: parseInt(id) } },
    });
    if (existingOfficerId) {
        return res.status(400).json({ message: "Officer ID already exists" });
    }
    const hashedPassword = validatedData.password
        ? yield bcrypt_1.default.hash(validatedData.password, 10)
        : undefined;
    const updatedOfficer = yield prisma_1.default.officer.update({
        where: { id: parseInt(id) },
        data: {
            officerId: validatedData.officerId,
            password: hashedPassword,
            place: validatedData.place,
            role: validatedData.role,
        },
    });
    const { password } = updatedOfficer, officerWithoutPassword = __rest(updatedOfficer, ["password"]);
    return (0, response_utils_1.SuccessResponse)(res, "Officer updated successfully", officerWithoutPassword, 200);
}));
exports.deleteOfficer = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: "Officer ID is required" });
    }
    const existingOfficer = yield prisma_1.default.officer.findUnique({
        where: { id: parseInt(id) },
    });
    if (!existingOfficer) {
        return res.status(404).json({ message: "Officer not found" });
    }
    yield prisma_1.default.officer.delete({
        where: { id: parseInt(id) },
    });
    return (0, response_utils_1.SuccessResponse)(res, "Officer deleted successfully", {}, 200);
}));
