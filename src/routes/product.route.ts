import { Router } from "express";
import { getAllProducts } from "../controller/product.controller";
import { addproduct } from "../controller/product.controller";
import { Authnticateuser } from "../middleware/authmiddleware";
import { AuthnticateAdmin } from "../middleware/authadminmiddleware";
import { getProductById } from "../controller/product.controller";
import upload from "../middleware/upload";
const productRouter = Router();

productRouter.get("/getallproducts",  getAllProducts);
productRouter.post("/addproduct", AuthnticateAdmin, upload.single("image"), addproduct);
productRouter.get("/:id", getProductById);


export default productRouter;