import { z } from "zod";
import { deleteFromCloudinary, uploadToCloudinary } from "../config/cloudinary";
import prisma from "../config/prisma";
import { asyncHandler } from "../middleware/error.middleware";
import { SuccessResponse } from "../utils/response.utils";
import { ShopSchema } from "../validators/shop";
import ENV from "../config/env";

export const createShop = asyncHandler(async (req, res) => {
    const validatedData = ShopSchema.parse(req.body);

    // const image = req.file;
    // if(!image) {
    //     return res.status(400).json({ message: "Image is required" });
    // }
    
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  if (
    !files ||
    !Array.isArray(files["shopLicense"]) ||
    !Array.isArray(files["gstCertificate"]) ||
    !Array.isArray(files["storagePermissionCertificate"]) ||
    !Array.isArray(files["fassiLicense"]) ||
    files["shopLicense"].length === 0 ||
    files["gstCertificate"].length === 0 ||
    files["storagePermissionCertificate"].length === 0 ||
    files["fassiLicense"].length === 0
  ) {
    return res.status(400).json({ message: "All license images (shopLicense, gstCertificate, storagePermissionCertificate, fassiLicense) are required" });
  }

  const imageSchema = z.object({
    mimetype: z.string().refine((val) => val.startsWith("image/"), {
      message: "File must be an image",
    }),
    size: z.number().max(1 * 1024 * 1024, "File size must be less than 1MB"),
  });

  [files["shopLicense"][0], files["gstCertificate"][0], files["storagePermissionCertificate"][0], files["fassiLicense"][0]].forEach((file) =>
    imageSchema.parse(file)
  );

  let imageUrl: any = null;
  if (files["image"] && files["image"].length > 0) {
    imageSchema.parse(files["image"][0]);
    imageUrl = await uploadToCloudinary(files["image"][0].buffer, ENV.cloud_name!);
  }

  const shopLicenseUrl = await uploadToCloudinary(files["shopLicense"][0].buffer, ENV.cloud_name!);
  const gstCertificateUrl = await uploadToCloudinary(files["gstCertificate"][0].buffer, ENV.cloud_name!);
  const storagePermissionCertificateUrl = await uploadToCloudinary(files["storagePermissionCertificate"][0].buffer, ENV.cloud_name!);
  const fassiLicenseUrl = await uploadToCloudinary(files["fassiLicense"][0].buffer, ENV.cloud_name!);

  
  const shop = await prisma.$transaction(async (tx) => {
    const newShop = await tx.shop.create({
      data: {
        ...validatedData,
        image: imageUrl,
      },
    });

    await tx.licenses.create({
      data: {
        shopId: newShop.id,
        shopLicense:  shopLicenseUrl ,
        gstCertificate: gstCertificateUrl ,
        storagePermissionCertificate: storagePermissionCertificateUrl ,
        fassiLicense: fassiLicenseUrl ,
      },
    });

    return newShop;
  });

  return SuccessResponse(res, "Shop created successfully", shop, 201);
});

export const getAllShops = asyncHandler(async (req, res, next) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const searchQuery = req.query.search as string;

      
    const skip = (page - 1) * limit;    
    const where: any = {}

    if(searchQuery){
        where.OR = [
            {name: {contains: searchQuery}},
            {location: {contains: searchQuery}},
            {ownerName: {contains: searchQuery}},
        ]
    }

    const [shop, totalShop] = await Promise.all([
        prisma.shop.findMany({
            skip,
            take: limit,
            where,
            include: { licenses: true, products: true }
        }),
        prisma.shop.count({
            where,
        })
    ])

    return SuccessResponse(res, "Shops retrieved successfully", {
        shop,
        totalShop,
        currentPage: page,
        totalPages: Math.ceil(totalShop / limit),
        count: shop.length
    });
})


export const getShopById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Shop ID is required" });
  }

  const shop = await prisma.shop.findUnique({
    where: { id: parseInt(id) },
    include: {
        licenses: true,
        products: true
    },
  });

  if (!shop) {
    return res.status(404).json({ message: "Shop not found" });
  }

  return SuccessResponse(res, "Shop retrieved successfully", shop);
});


export const updateShop = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Shop ID is required" });
  }

  const validatedData = ShopSchema.partial().parse(req.body);
  const updatedData: any = { ...validatedData };

  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

  // Handle image update
  if (files && files["image"] && files["image"].length > 0) {
    const imageSchema = z.object({
      mimetype: z.string().refine((val) => val.startsWith("image/"), {
        message: "File must be an image",
      }),
      size: z.number().max(1 * 1024 * 1024, "File size must be less than 1MB"),
    });
    imageSchema.parse(files["image"][0]);

    // Delete existing image if present
    const existingShop = await prisma.shop.findUnique({
      where: { id: parseInt(id) },
      select: { image: true },
    });
    if (existingShop?.image) {
      const publicId = (existingShop.image as any).url.split("/").pop()?.split(".")[0];
      if (publicId) {
        await deleteFromCloudinary(publicId);
      }
    }

    const imageUrl = await uploadToCloudinary(files["image"][0].buffer, `${ENV.cloud_name}/shops`);
    updatedData.image = { url: imageUrl };
  }

  // Handle license updates
  if (files && Object.keys(files).some((key) => ["shopLicense", "gstCertificate", "storagePermissionCertificate", "fassiLicense"].includes(key))) {
    const imageSchema = z.object({
      mimetype: z.string().refine((val) => val.startsWith("image/"), {
        message: "File must be an image",
      }),
      size: z.number().max(1 * 1024 * 1024, "File size must be less than 1MB"),
    });

    const existingLicenses = await prisma.licenses.findFirst({
      where: { shopId: parseInt(id) },
    });

    const licenseData: any = {};
    if (files["shopLicense"] && files["shopLicense"].length > 0) {
      imageSchema.parse(files["shopLicense"][0]);
      if (existingLicenses?.shopLicense) {
        const publicId = (existingLicenses.shopLicense as any).url.split("/").pop()?.split(".")[0];
        if (publicId) await deleteFromCloudinary(publicId);
      }
      licenseData.shopLicense = { url: await uploadToCloudinary(files["shopLicense"][0].buffer, `${ENV.cloud_name}/shop-licenses`) };
    }
    if (files["gstCertificate"] && files["gstCertificate"].length > 0) {
      imageSchema.parse(files["gstCertificate"][0]);
      if (existingLicenses?.gstCertificate) {
        const publicId = (existingLicenses.gstCertificate as any).url.split("/").pop()?.split(".")[0];
        if (publicId) await deleteFromCloudinary(publicId);
      }
      licenseData.gstCertificate = { url: await uploadToCloudinary(files["gstCertificate"][0].buffer, `${ENV.cloud_name}/shop-licenses`) };
    }
    if (files["storagePermissionCertificate"] && files["storagePermissionCertificate"].length > 0) {
      imageSchema.parse(files["storagePermissionCertificate"][0]);
      if (existingLicenses?.storagePermissionCertificate) {
        const publicId = (existingLicenses.storagePermissionCertificate as any).url.split("/").pop()?.split(".")[0];
        if (publicId) await deleteFromCloudinary(publicId);
      }
      licenseData.storagePermissionCertificate = { url: await uploadToCloudinary(files["storagePermissionCertificate"][0].buffer, `${ENV.cloud_name}/shop-licenses`) };
    }
    if (files["fassiLicense"] && files["fassiLicense"].length > 0) {
      imageSchema.parse(files["fassiLicense"][0]);
      if (existingLicenses?.fassiLicense) {
        const publicId = (existingLicenses.fassiLicense as any).url.split("/").pop()?.split(".")[0];
        if (publicId) await deleteFromCloudinary(publicId);
      }
      licenseData.fassiLicense = { url: await uploadToCloudinary(files["fassiLicense"][0].buffer, `${ENV.cloud_name}/shop-licenses`) };
    }

    if (Object.keys(licenseData).length > 0) {
      await prisma.licenses.updateMany({
        where: { shopId: parseInt(id) },
        data: licenseData,
      });
    }
  }

  const shop = await prisma.shop.update({
    where: { id: parseInt(id) },
    data: updatedData,
    include: { licenses: true, products: true },
  });

  return SuccessResponse(res, "Shop updated successfully", shop);
});