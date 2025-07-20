"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cartitem_controller_1 = require("../controller/cartitem.controller");
const authmiddleware_1 = require("../middleware/authmiddleware");
const express_1 = require("express");
const cartItemRouter = (0, express_1.Router)();
cartItemRouter.post("/createcartitem", authmiddleware_1.Authnticateuser, cartitem_controller_1.addCartItem);
exports.default = cartItemRouter;
