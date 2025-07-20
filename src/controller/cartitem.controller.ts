import { Response,Request } from "express";
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

    if (!req.user || !req.user.id) {
      return next(new ErrorResponse("Unauthorized", statusCode.Unauthorized));
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
