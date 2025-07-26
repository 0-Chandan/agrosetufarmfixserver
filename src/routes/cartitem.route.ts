import { addCartItem } from "../controller/cartitem.controller";
import { getCartItems } from "../controller/cartitem.controller";
import { updateCartItem } from "../controller/cartitem.controller";
import { deleteCartItem } from "../controller/cartitem.controller";
import { Authnticateuser } from "../middleware/authmiddleware";
import { Router } from "express";

const cartItemRouter = Router();

cartItemRouter.post("/createcartitem",Authnticateuser, addCartItem);
cartItemRouter.get("/getallcartitem",Authnticateuser, getCartItems);
cartItemRouter.put("/updatecartitem/:id",Authnticateuser, updateCartItem); // Add this route for updating cart item inf
cartItemRouter.delete("/deletecartitem/:id",Authnticateuser, deleteCartItem);  


export default cartItemRouter;



