"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const payment_controller_1 = require("../controller/payment.controller");
const payment_controller_2 = require("../controller/payment.controller");
const payment_controller_3 = require("../controller/payment.controller");
const authmiddleware_1 = require("../middleware/authmiddleware");
const express_1 = require("express");
const paymentRouter = (0, express_1.Router)();
paymentRouter.post("/add", authmiddleware_1.Authnticateuser, payment_controller_1.addpayment);
paymentRouter.get("/getall", authmiddleware_1.Authnticateuser, payment_controller_2.getpaymentall);
paymentRouter.get("/:id", authmiddleware_1.Authnticateuser, payment_controller_3.getPaymentById); // Assuming you want to fetch a specific payment by ID
exports.default = paymentRouter;
