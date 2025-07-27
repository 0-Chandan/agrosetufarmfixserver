"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = require("../controller/product.controller");
const product_controller_2 = require("../controller/product.controller");
const authadminmiddleware_1 = require("../middleware/authadminmiddleware");
const product_controller_3 = require("../controller/product.controller");
const product_controller_4 = require("../controller/product.controller");
const upload_1 = require("../middleware/upload");
const productRouter = (0, express_1.Router)();
productRouter.get("/getallproducts", product_controller_1.getAllProducts);
productRouter.post("/addproduct", authadminmiddleware_1.AuthnticateAdmin, upload_1.upload.single("image"), product_controller_2.addproduct);
productRouter
    .route("/:id")
    .get(product_controller_3.getProductById)
    .put(authadminmiddleware_1.AuthnticateAdmin, product_controller_4.updateProduct);
exports.default = productRouter;
