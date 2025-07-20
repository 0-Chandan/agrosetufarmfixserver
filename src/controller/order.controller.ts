import { Response, Request } from "express";
import { asyncHandler } from "../middleware/error.middleware";
import { SuccessResponse, ErrorResponse } from "../utils/response.utils";
import prisma from "../config/prisma";
import { statusCode } from "../types/types";

export const createOrder = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId, productId, quantity, addressId, couponId } = req.body;

    // Validate required fields
    if (!userId || !productId || !quantity || !addressId) {
      throw new ErrorResponse("userId, productId, quantity, and addressId are required", statusCode.Bad_Request);
    }

    try {
      // Verify product exists and get price
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { price: true, stock: true }
      });

      if (!product) {
        throw new ErrorResponse( "Product not found", statusCode.Not_Found);
      }

      // Check stock availability
      if (product.stock < quantity) {
        throw new ErrorResponse("Insufficient stock available", statusCode.Bad_Request);
      }

      // Calculate total price
      let totalPrice = product.price * quantity;
      let discount = 0;

      // Apply coupon if provided
      if (couponId) {
        const coupon = await prisma.coupon.findUnique({
          where: { id: couponId }
        });

        if (coupon) {
          discount = coupon.discount || 0;
          totalPrice -= discount;
        }
      }

      // Create the order
      const order = await prisma.order.create({
        data: {
          userId,
          addressId,
          couponId: couponId || undefined, // Only set if couponId exists
          totalPrice,
          discount,
          status: "PENDING", // Initial status
          items: {
            create: {
              productId,
              quantity,
              price: product.price // Store price at time of order
            }
          }
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true
                }
              }
            }
          },
          address: true,
          coupon: true
        }
      });

      // Update product stock
      await prisma.product.update({
        where: { id: productId },
        data: { stock: { decrement: quantity } }
      });

      return SuccessResponse(res, "Order created successfully", order, statusCode.Created);
    } catch (error) {
      console.error("Error creating order:", error);
  throw new  ErrorResponse("Failed to create order", statusCode.Internal_Server_Error);
    }
  }
);

export const getAllOrders = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const orders = await prisma.order.findMany();
      return SuccessResponse(res, "All orders retrieved successfully", orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      throw new  ErrorResponse("Failed to retrieve orders", statusCode.Internal_Server_Error);
    }
  }
);

export const getOrderById = asyncHandler(
  async (req: Request, res: Response) => {
    const orderId = parseInt(req.params.id);
    
    if (isNaN(orderId)) {
      throw new  ErrorResponse("Invalid order ID", statusCode.Bad_Request);
    }

    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true
                }
              }
            }
          },
          address: true,
          coupon: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      if (!order) {
        return new  ErrorResponse("Order not found", statusCode.Not_Found);
      }

      return SuccessResponse(res, "Order retrieved successfully", order);
    } catch (error) {
      console.error("Error fetching order:", error);
      throw new  ErrorResponse("Failed to retrieve order", statusCode.Internal_Server_Error);
    }
  }
);

// Add more order-related controllers as needed (update, cancel, etc.)