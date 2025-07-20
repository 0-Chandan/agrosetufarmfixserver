import { Request, Response } from "express";
import { asyncHandler } from "../middleware/error.middleware";
import { SuccessResponse } from "../utils/response.utils";
import prisma from "../config/prisma";


export const addproduct = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, description, price } = req.body;
    if (!name || !description || !price) {
      return res.status(400).json({ message: "All fields are required" });
    }
    
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: 0, // Default stock value
        imageUrl
      },
    });
    return SuccessResponse(res, "Product added successfully", product, 201);
    })

export const getAllProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      search = "",
      minPrice,
      maxPrice,
      page = "1",
      limit = "9",
      sort = "newest",
    } = req.query as {
      search?: string;
      minPrice?: string;
      maxPrice?: string;
      page?: string;
      limit?: string;
      sort?: string;
    };

    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    const filters: any = { AND: [] };

    if (search) {
      filters.AND.push({
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      });
    }

    if (minPrice) {
      filters.AND.push({ price: { gte: parseFloat(minPrice) } });
    }

    if (maxPrice) {
      filters.AND.push({ price: { lte: parseFloat(maxPrice) } });
    }

    const orderBy =
      sort === "low"
        ? { price: "asc" }
        : sort === "high"
        ? { price: "desc" }
        : { createdAt: "desc" };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: filters.AND.length > 0 ? filters : undefined,
        skip,
        take: pageSize,

      }),
      prisma.product.count({
        where: filters.AND.length > 0 ? filters : undefined,
      }),
    ]);

    const pagination = {
      total,
      page: pageNumber,
      limit: pageSize,
      totalPages: Math.ceil(total / pageSize),
    };

    SuccessResponse(res, "Products fetched successfully", { products, pagination });
  }
);


export const getProductById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    SuccessResponse(res, "Product fetched successfully", product);
  }
);