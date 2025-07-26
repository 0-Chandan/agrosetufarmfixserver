"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cartitem_controller_1 = require("../controller/cartitem.controller");
const cartitem_controller_2 = require("../controller/cartitem.controller");
const cartitem_controller_3 = require("../controller/cartitem.controller");
const cartitem_controller_4 = require("../controller/cartitem.controller");
const authmiddleware_1 = require("../middleware/authmiddleware");
const express_1 = require("express");
const cartItemRouter = (0, express_1.Router)();
cartItemRouter.post("/createcartitem", authmiddleware_1.Authnticateuser, cartitem_controller_1.addCartItem);
cartItemRouter.get("/getallcartitem", authmiddleware_1.Authnticateuser, cartitem_controller_2.getCartItems);
cartItemRouter.put("/updatecartitem/:id", authmiddleware_1.Authnticateuser, cartitem_controller_3.updateCartItem); // Add this route for updating cart item inf
cartItemRouter.delete("/deletecartitem/:id", authmiddleware_1.Authnticateuser, cartitem_controller_4.deleteCartItem);
exports.default = cartItemRouter;
