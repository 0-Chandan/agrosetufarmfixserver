"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = require("../controller/product.controller");
const product_controller_2 = require("../controller/product.controller");
const authadminmiddleware_1 = require("../middleware/authadminmiddleware");
const product_controller_3 = require("../controller/product.controller");
const upload_1 = __importDefault(require("../middleware/upload"));
const productRouter = (0, express_1.Router)();
productRouter.get("/getallproducts", product_controller_1.getAllProducts);
productRouter.post("/addproduct", authadminmiddleware_1.AuthnticateAdmin, upload_1.default.single("image"), product_controller_2.addproduct);
productRouter.get("/:id", product_controller_3.getProductById);
exports.default = productRouter;
