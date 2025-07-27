"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfficerSchema = void 0;
const zod_1 = require("zod");
exports.OfficerSchema = zod_1.z.object({
    officerId: zod_1.z
        .string()
        .min(1, "Officer ID is required")
        .max(50, "Officer ID must be 50 characters or less")
        .regex(/^[a-zA-Z0-9_-]+$/, "Officer ID can only contain letters, numbers, underscores, or hyphens"),
    password: zod_1.z.string({ required_error: "password is required" }).min(6, "Password must be at least 6 characters").max(100, "Password must be 100 characters or less"),
    place: zod_1.z.string({ required_error: "place is required" }).min(1, "Place is required").max(100, "Place must be 100 characters or less"),
    role: zod_1.z.enum(["SDM", "CO", "AGRICULTURE_OFFICER", "TEHSILDAR"]).default("SDM"),
});
