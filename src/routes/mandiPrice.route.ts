import { Router } from "express";
import { createMandiPrice, getAllMandiPrices, getMandiPriceById, updateMandiPrice, deleteMandiPrice } from "../controller/mandiPrice.controller";
import { AuthnticateAdmin } from "../middleware/authadminmiddleware";

const mandiPriceRouter = Router();

mandiPriceRouter.post("/create",AuthnticateAdmin, createMandiPrice);
mandiPriceRouter.get("/all", getAllMandiPrices);
mandiPriceRouter.get("/:id", getMandiPriceById);
mandiPriceRouter.put("/:id", updateMandiPrice);
mandiPriceRouter.delete("/:id", deleteMandiPrice);

export default mandiPriceRouter;