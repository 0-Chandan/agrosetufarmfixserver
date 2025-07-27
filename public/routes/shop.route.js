"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const shop_controller_1 = require("../controller/shop.controller");
const upload_1 = require("../middleware/upload");
const shopRouter = (0, express_1.Router)();
shopRouter.post("/create", upload_1.upload.fields([
    { name: "image", maxCount: 1 },
    { name: "shopLicense", maxCount: 1 },
    { name: "gstCertificate", maxCount: 1 },
    { name: "storagePermissionCertificate", maxCount: 1 },
    { name: "fassiLicense", maxCount: 1 }
]), shop_controller_1.createShop);
// shopRouter.use(AuthnticateAdmin)
shopRouter.get("/all", shop_controller_1.getAllShops);
shopRouter.get("/:id", shop_controller_1.getShopById);
shopRouter.put("/:id", upload_1.upload.fields([
    { name: "image", maxCount: 1 },
    { name: "shopLicense", maxCount: 1 },
    { name: "gstCertificate", maxCount: 1 },
    { name: "storagePermissionCertificate", maxCount: 1 },
    { name: "fassiLicense", maxCount: 1 }
]), shop_controller_1.updateShop);
exports.default = shopRouter;
