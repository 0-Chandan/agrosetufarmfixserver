import { Response,Request } from "express";
import { asyncHandler } from "../middleware/error.middleware";

import { SuccessResponse } from "../utils/response.utils";
import prisma from "../config/prisma";

interface AddressQuery {
  page?: string;  
  limit?: string;
  city?: string;
  state?: string;
  country?: string;
  pinCode?: string;
}


export const addAddress = asyncHandler(
  async (req: Request, res: Response) => {
    const { addressLine1, city, state,name,pinCode, phone, addressLine2, country } = req.body;

    console.log("data:", addressLine1, city, state,name,pinCode, phone, addressLine2, country);

    if (!addressLine1 || !city || !state || !name ||!pinCode || !phone || !country) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ✅ Check that req.user.id exists
    if (!req.user || typeof req.user.id !== "number") {
      return res.status(401).json({ message: "Unauthorized or invalid user" });
    }

    const address = await prisma.address.create({
      data: {
        userId: req.user.id, // ✅ Guaranteed to be a number now
        name,
        phone,
        addressLine1,
        addressLine2: addressLine2 || "",
        city,
        state,
        pinCode,
        country,
      },
    });

    return SuccessResponse(res, "Address added successfully", address, 201);
  }
);



export const getAllAddresses = asyncHandler(
  async (req: Request<{}, {}, {}, AddressQuery>, res: Response) => {
    // ✅ Ensure user is authenticated
    if (!req.user || typeof req.user.id !== "number") {
      return res.status(401).json({ message: "Unauthorized or invalid user" });
    }

    const {
      page = "1",
      limit = "10",
      city,
      state,
      country,
      pinCode,
    } = req.query;

    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);

    // ✅ Build filter object
    const filters: any = {
      userId: req.user.id,
    };

    if (city) filters.city = { contains: city, mode: "insensitive" };
    if (state) filters.state = { contains: state, mode: "insensitive" };
    if (country) filters.country = { contains: country, mode: "insensitive" };
    if (pinCode) filters.pinCode = pinCode;

    // ✅ Query addresses with pagination and filters
    const addresses = await prisma.address.findMany({
      where: filters,
      skip: (pageInt - 1) * limitInt,
      take: limitInt,
      orderBy: {
        createdAt: "desc",
      },
    });

    // ✅ Count total matching records
    const total = await prisma.address.count({ where: filters });

    return SuccessResponse(res, "Addresses retrieved successfully", {
      data: addresses,
      total,
      page: pageInt,
      limit: limitInt,
      totalPages: Math.ceil(total / limitInt),
    });
  }
);


export const getAddressById = asyncHandler(
  async (req: Request, res: Response) => {
    const addressId = parseInt(req.params.id);

    if (isNaN(addressId)) {
      return res.status(400).json({ message: "Invalid address ID" });
    }

    // ✅ Ensure user is authenticated
    if (!req.user || typeof req.user.id !== "number") {
      return res.status(401).json({ message: "Unauthorized or invalid user" });
    }

    const address = await prisma.address.findUnique({
      where: { id: addressId, userId: req.user.id },
    });
      
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    return SuccessResponse(res, "Address retrieved successfully", address);
  }
);

export const  updateAddress = asyncHandler(
  async (req: Request, res: Response) => {
    const addressId = parseInt(req.params.id);
    if (isNaN(addressId)) {
      return res.status(400).json({ message: "Invalid address ID" });
    }
    // ✅ Ensure user is authenticated
    if (!req.user || typeof req.user.id !== "number") {
      return res.status(401).json({ message: "Unauthorized or invalid user" });
    }
    const address = await prisma.address.update({
      where: { id: addressId, userId: req.user.id },
      data: req.body,
    });
    return SuccessResponse(res, "Address updated successfully", address);
  }
);
