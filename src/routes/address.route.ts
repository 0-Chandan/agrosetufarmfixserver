import { addAddress, getAddressById } from "../controller/address.controller";
import { getAllAddresses } from "../controller/address.controller";
import { Authnticateuser } from "../middleware/authmiddleware";
import { updateAddress } from "../controller/address.controller";

import { Router } from "express";

const addressRouter = Router();
addressRouter.post("/create", Authnticateuser, addAddress);
addressRouter.get("/getall", Authnticateuser, getAllAddresses);
addressRouter.get("/:id", Authnticateuser, getAddressById); // Assuming you want to fetch a specific address by ID
addressRouter.put("/update/:id", Authnticateuser, updateAddress);

export default addressRouter;