import { Router } from "express";
import { createShop, getAllShops, getShopById, updateShop } from "../controller/shop.controller";
import { upload } from "../middleware/upload";
import { AuthnticateAdmin } from "../middleware/authadminmiddleware";

const shopRouter = Router();

shopRouter.post("/create", upload.fields([
    { name: "image", maxCount: 1 },
    { name: "shopLicense", maxCount: 1 },
    { name: "gstCertificate", maxCount: 1 },
    { name: "storagePermissionCertificate", maxCount: 1 },
    { name: "fassiLicense", maxCount: 1 }
]), createShop)

// shopRouter.use(AuthnticateAdmin)

shopRouter.get("/all", getAllShops)
shopRouter.get("/:id", getShopById)
shopRouter.put("/:id", updateShop)

export default shopRouter;