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
exports.main = main;
const prisma_1 = __importDefault(require("../config/prisma"));
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const products = Array.from({ length: 20 }).map((_, i) => ({
            name: `Product ${i + 1}`,
            description: `This is the description for product ${i + 1}`,
            price: parseFloat((Math.random() * 500 + 50).toFixed(2)),
            originalPrice: parseFloat((Math.random() * 600 + 100).toFixed(2)),
            unit: "pcs",
            discount: parseFloat((Math.random() * 30).toFixed(2)),
            category: ["Electronics", "Clothing", "Books", "Home", "Sports"][Math.floor(Math.random() * 5)],
            brand: `Brand ${i + 1}`,
            seller: `Seller ${Math.floor(Math.random() * 5) + 1}`,
            rating: parseFloat((Math.random() * 5).toFixed(1)),
            stock: Math.floor(Math.random() * 100 + 1),
            imageUrl: `https://picsum.photos/seed/product${i + 1}/300/300`,
            image: {
                urls: [
                    `https://picsum.photos/seed/${i + 1}-a/300/300`,
                    `https://picsum.photos/seed/${i + 1}-b/300/300`,
                ],
            },
            shopId: null, // change to an existing shopId if required
            isActive: true,
        }));
        yield prisma_1.default.product.createMany({
            data: products,
        });
        console.log("✅ Seeded 20 products successfully!");
    });
}
