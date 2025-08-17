import prisma from "../config/prisma";

export async function main() {
  const products = Array.from({ length: 20 }).map((_, i) => ({
    name: `Product ${i + 1}`,
    description: `This is the description for product ${i + 1}`,
    price: parseFloat((Math.random() * 500 + 50).toFixed(2)),
    originalPrice: parseFloat((Math.random() * 600 + 100).toFixed(2)),
    unit: "pcs",
    discount: parseFloat((Math.random() * 30).toFixed(2)),
    category: ["Electronics", "Clothing", "Books", "Home", "Sports"][
      Math.floor(Math.random() * 5)
    ],
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

  await prisma.product.createMany({
    data: products,
  });

  console.log("✅ Seeded 20 products successfully!");
}