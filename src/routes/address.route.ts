import { addAddress } from "../controller/address.controller";
import { getAllAddresses } from "../controller/address.controller";
import { Authnticateuser } from "../middleware/authmiddleware";
import { Router } from "express";

const addressRouter = Router();
addressRouter.post("/add", Authnticateuser, addAddress);
addressRouter.get("/getall", Authnticateuser, getAllAddresses);
addressRouter.get("/:id", Authnticateuser, getAllAddresses); // Assuming you want to fetch a specific address by ID

export default addressRouter;