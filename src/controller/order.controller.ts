import { Response, Request } from "express";
import { asyncHandler } from "../middleware/error.middleware";
import { SuccessResponse, ErrorResponse } from "../utils/response.utils";
import prisma from "../config/prisma";
import { statusCode } from "../types/types";

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const { userId, addressId, couponId, products } = req.body;

  if (!products || !Array.isArray(products) || products.length === 0 || !addressId) {
    throw new ErrorResponse("addressId and at least one product with quantity are required", statusCode.Bad_Request);
  }

 
    let totalPrice = 0;
    let discount = 0;
    const orderItems: any[] = [];

    // Validate each product
    for (const item of products) {
      const { productId, quantity } = item;

      if (!productId || !quantity) {
        throw new ErrorResponse("Each product must have productId and quantity", statusCode.Bad_Request);
      }

      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { price: true, stock: true }
      });

      if (!product) {
        throw new ErrorResponse(`Product ID ${productId} not found`, statusCode.Not_Found);
      }

      if (product.stock < quantity) {
        throw new ErrorResponse(`Insufficient stock for Product ID ${productId}`, statusCode.Bad_Request);
      }

      const itemTotal = product.price * quantity;
      totalPrice += itemTotal;

      orderItems.push({
        productId,
        quantity,
        price: product.price // Record current price
      });
    }

    // Apply coupon if any
   if (couponId) {
  const coupon = await prisma.coupon.findUnique({
    where: { id: couponId }
  });

  if (!coupon) {
    throw new ErrorResponse("Invalid couponId. Coupon not found", statusCode.Bad_Request);
  }

  discount = coupon.discount || 0;
  totalPrice -= discount;
}

    // Create order with multiple items
    const order = await prisma.order.create({
      data: {
        userId: req?.user?.id || userId,
        addressId,
        couponId: couponId || undefined,
        totalPrice,
        discount,
        status: "PENDING",
        items: {
          create: orderItems
        }
      },
      include: {
        items: true
      }
    });

    // Update product stock
    await Promise.all(
      orderItems.map(item =>
        prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity }
          }
        })
      )
    );

    return SuccessResponse(res, "Order created successfully", order, statusCode.Created);
  } 
);


export const getAllOrders = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const orders = await prisma.order.findMany(
        {
          include:{
            items: {
              include: {
                product: true
              }
            }
          }
        }
      );
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