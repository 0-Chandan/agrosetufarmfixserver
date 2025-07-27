"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const order_controller_1 = require("../controller/order.controller");
const order_controller_2 = require("../controller/order.controller");
const order_controller_3 = require("../controller/order.controller");
const express_1 = require("express");
const orderRouter = (0, express_1.Router)();
orderRouter.post("/create", order_controller_1.createOrder);
orderRouter.get("/getall", order_controller_2.getAllOrders);
orderRouter.get("/:id", order_controller_3.getOrderById); // Assuming you want to fetch a specific order by ID
exports.default = orderRouter;
