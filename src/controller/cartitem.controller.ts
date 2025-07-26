import { Request, Response } from "express";
import { asyncHandler } from "../middleware/error.middleware";
import { ErrorResponse, SuccessResponse } from "../utils/response.utils";
import { statusCode } from "../types/types";
import prisma from "../config/prisma";

export const addCartItem = asyncHandler(
  async (req: Request, res: Response, next) => {
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return next(
        new ErrorResponse("Product ID and quantity are required", statusCode.Bad_Request)
      );
    }

    console.log(req.user)

    if (!req.user || !req.user?.id) {
      return next(new ErrorResponse("Unauthorized", statusCode.Unauthorized));
    }

    // Validate product existence
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return next(new ErrorResponse("Product not found", statusCode.Not_Found));
    }

    // Validate quantity
    if (quantity < 1 || !Number.isInteger(quantity)) {
      return next(new ErrorResponse("Quantity must be a positive integer", statusCode.Bad_Request));
    }

    // Check if product is in stock
    if (product.stock < quantity) {
      return next(
        new ErrorResponse(
          `Insufficient stock: only ${product.stock} available`,
          statusCode.Bad_Request
        )
      );
    }

    // Check if item already exists in cart
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        userId: req.user?.id,
        productId,
      },
    });

    if (existingCartItem) {
      return next(
        new ErrorResponse(
          "Product already exists in cart. Use update to modify quantity",
          statusCode.Bad_Request
        )
      );
    }

    const cartItem = await prisma.cartItem.create({
      data: {
        userId: req.user.id,
        productId,
        quantity,
      },

    });

    SuccessResponse(res, "Cart item added successfully", { cartItem });
  }
);

export const getCartItems = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user || !req.user.id) {
      return new ErrorResponse("Unauthorized", statusCode.Unauthorized);
    }

    const cartItems = await prisma.cartItem.findMany({
      where: {
        userId: req.user.id,
      },
      include: {
        product: true,
      },
    });

    SuccessResponse(res, "Cart items retrieved successfully", { cartItems });
  }
);

export const updateCartItem = asyncHandler(
  async (req: Request, res: Response, next) => {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!id || !quantity) {
      return next(
        new ErrorResponse("Cart item ID and quantity are required", statusCode.Bad_Request)
      );
    }

    if (!req.user || !req.user.id) {
      return next(new ErrorResponse("Unauthorized", statusCode.Unauthorized));
    }

    // Validate quantity
    if (quantity < 1 || !Number.isInteger(quantity)) {
      return next(new ErrorResponse("Quantity must be a positive integer", statusCode.Bad_Request));
    }

    // Find cart item
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: parseInt(id) },
      include: {
        product: {
          select: { stock: true },
        },
      },
    });

    if (!cartItem) {
      return next(new ErrorResponse("Cart item not found", statusCode.Not_Found));
    }

    if (cartItem.userId !== req.user.id) {
      return next(new ErrorResponse("Unauthorized access to cart item", statusCode.Unauthorized));
    }

    // Check stock availability
    if (cartItem.product.stock < quantity) {
      return next(
        new ErrorResponse(
          `Insufficient stock: only ${cartItem.product.stock} available`,
          statusCode.Bad_Request
        )
      );
    }

    const updatedCartItem = await prisma.cartItem.update({
      where: { id: parseInt(id) },
      data: { quantity },
      include: {
        product: true,
      },
    });

    SuccessResponse(res, "Cart item updated successfully", { cartItem: updatedCartItem });
  }
);

export const deleteCartItem = asyncHandler(
  async (req: Request, res: Response, next) => {
    const { id } = req.params;

    if (!id) {
      return next(new ErrorResponse("Cart item ID is required", statusCode.Bad_Request));
    }

    if (!req.user || !req.user.id) {
      return next(new ErrorResponse("Unauthorized", statusCode.Unauthorized));
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: parseInt(id) },
    });

    if (!cartItem) {
      return next(new ErrorResponse("Cart item not found", statusCode.Not_Found));
    }

    if (cartItem.userId !== req.user.id) {
      return next(new ErrorResponse("Unauthorized access to cart item", statusCode.Unauthorized));
    }

    // Soft delete by updating isActive to false
    await prisma.cartItem.delete({
      where: { id: parseInt(id) },
      //data: { isActive: false },
    });

    SuccessResponse(res, "Cart item deactivated successfully", {});
  }
);

export const clearCart = asyncHandler(
  async (req: Request, res: Response, next) => {
    if (!req.user || !req.user.id) {
      return next(new ErrorResponse("Unauthorized", statusCode.Unauthorized));
    }

    await prisma.cartItem.deleteMany({
      where: { userId: req.user.id },
    });

    SuccessResponse(res, "Cart cleared successfully", {});
  }
);