import { addpayment } from "../controller/payment.controller";
import { getpaymentall } from "../controller/payment.controller";
import { getPaymentById } from "../controller/payment.controller";
import { Authnticateuser } from "../middleware/authmiddleware";
import { Router } from "express";

const paymentRouter = Router();
paymentRouter.post("/add", Authnticateuser, addpayment);
paymentRouter.get("/getall", Authnticateuser, getpaymentall);
paymentRouter.get("/:id", Authnticateuser, getPaymentById); // Assuming you want to fetch a specific payment by ID

export default paymentRouter;