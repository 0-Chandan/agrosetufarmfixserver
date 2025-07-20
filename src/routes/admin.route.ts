import { createAdmin } from "../controller/authAdmin.controller";
import { loginAdmin } from "../controller/authAdmin.controller";
import { Router } from "express";



const adminRouter = Router();

adminRouter.post("/createadmin", createAdmin);
adminRouter.post("/login", loginAdmin); 

export default adminRouter;
