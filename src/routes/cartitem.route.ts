import { addCartItem } from "../controller/cartitem.controller";
import { Authnticateuser } from "../middleware/authmiddleware";
import { Router } from "express";

const cartItemRouter = Router();

cartItemRouter.post("/createcartitem",Authnticateuser, addCartItem);

export default cartItemRouter;



