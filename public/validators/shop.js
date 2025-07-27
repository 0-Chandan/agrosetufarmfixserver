"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopSchema = void 0;
const zod_1 = require("zod");
// Zod schema for Shop model
exports.ShopSchema = zod_1.z.object({
    name: zod_1.z.string({ required_error: "shop is required" }).min(1, { message: "Shop name is required" }),
    description: zod_1.z.string().optional().nullable(),
    location: zod_1.z.string().min(1, { message: "Location is required" }),
    ownerName: zod_1.z.string().min(1, { message: "Owner name is required" })
});
