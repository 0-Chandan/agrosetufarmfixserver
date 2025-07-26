import { Request, Response } from "express";
import { asyncHandler } from "../middleware/error.middleware";
import { SuccessResponse } from "../utils/response.utils";
import prisma from "../config/prisma";
import { string } from "zod";


export const addproduct = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, description, price,originalPrice,unit,brand,stock,
    seller, rating, discount,category,} = req.body;
    if (!name || !description || !price || !originalPrice || !unit || !brand || !stock) {
      return res.status(400).json({ message: "All fields are required" });
    }
    
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        originalPrice: Number(originalPrice),
        unit,
        brand,
        stock :Number(stock), // Default stock value
        imageUrl,
        seller,
        rating:Number(rating),
        discount:Number(discount),
        category,
        
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
          { name: { contains: search} },
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

export const updateProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const updatedata: any ={}
   if(req.body.name) updatedata.name = req.body.name
   if(req.body.description) updatedata.description = req.body.description
   if(req.body.price) updatedata.price = req.body.price
   if(req.body.originalPrice) updatedata.originalPrice = req.body.originalPrice
   if(req.body.unit) updatedata.unit = req.body.unit
   if(req.body.brand) updatedata.brand = req.body.brand
   if(req.body.stock) updatedata.stock = req.body.stock
   if(req.body.imageUrl) updatedata.imageUrl = req.body.imageUrl
   if(req.body.seller) updatedata.seller = req.body.seller
   if(req.body.rating) updatedata.rating = req.body.rating
   if(req.body.discount) updatedata.discount = req.body.discount
   if(req.body.category) updatedata.category = req.body.category
   

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: updatedata,
    }); 

    SuccessResponse(res, "Product updated successfully", product);
    });