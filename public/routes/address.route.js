"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const address_controller_1 = require("../controller/address.controller");
const address_controller_2 = require("../controller/address.controller");
const authmiddleware_1 = require("../middleware/authmiddleware");
const address_controller_3 = require("../controller/address.controller");
const express_1 = require("express");
const addressRouter = (0, express_1.Router)();
addressRouter.post("/create", authmiddleware_1.Authnticateuser, address_controller_1.addAddress);
addressRouter.get("/getall", authmiddleware_1.Authnticateuser, address_controller_2.getAllAddresses);
addressRouter.get("/:id", authmiddleware_1.Authnticateuser, address_controller_1.getAddressById); // Assuming you want to fetch a specific address by ID
addressRouter.put("/update/:id", authmiddleware_1.Authnticateuser, address_controller_3.updateAddress);
exports.default = addressRouter;
