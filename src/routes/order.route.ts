import { createOrder } from "../controller/order.controller";
import { getAllOrders } from "../controller/order.controller";
import { getOrderById } from "../controller/order.controller";
import { Authnticateuser } from "../middleware/authmiddleware";
import { Router } from "express";
const orderRouter = Router();

orderRouter.post("/create", createOrder);
orderRouter.get("/getall", getAllOrders);
orderRouter.get("/:id", getOrderById); // Assuming you want to fetch a specific order by ID

export default orderRouter; 