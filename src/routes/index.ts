import { Router } from "express";
import userRouter from "./user.route";
import morgan from "morgan";
import productRouter from "./product.route";
import cartItemRouter from "./cartitem.route";
import adminRouter from "./admin.route";
import orderRouter from "./order.route";
import paymentRouter from "./payment.route";
import addressRouter from "./address.route";
import returnRequestRouter from "./returnrequest.route";
import shopRouter from "./shop.route";
import mandiPriceRouter from "./mandiPrice.route";
import officerRouter from "./officer.route";
import aiRouter from "./ai.route";


const router = Router();
router.use(morgan("dev"));
router.use("/api/v1/admin", adminRouter);
router.use("/api/v1/user", userRouter);
router.use("/api/v1/product", productRouter);
router.use("/api/v1/cartitem", cartItemRouter); 
router.use("/api/v1/admin", adminRouter);
router.use("/api/v1/order", orderRouter);
router.use("/api/v1/payment", paymentRouter);
router.use("/api/v1/address", addressRouter);
router.use("/api/v1/returnrequest", returnRequestRouter);
router.use("/api/v1/shop", shopRouter)
router.use("/api/v1/mandi-price", mandiPriceRouter)
router.use("/api/v1/officer", officerRouter)
router.use("/api/v1/ai", aiRouter)

export default router;
