import { z } from "zod";
import { deleteFromCloudinary, uploadToCloudinary } from "../config/cloudinary";
import prisma from "../config/prisma";
import { asyncHandler } from "../middleware/error.middleware";
import { SuccessResponse } from "../utils/response.utils";
import { ShopSchema } from "../validators/shop";
import ENV from "../config/env";

// Type for Cloudinary response
interface CloudinaryResponse {
  public_id: string;
  secure_url: string;
}

// Type guard function to check if an object is a CloudinaryResponse
function isCloudinaryResponse(obj: any): obj is CloudinaryResponse {
  return obj && typeof obj === 'object' && 'public_id' in obj && 'secure_url' in obj;
}

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
        products: true,
        licenses: true
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
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

    const imageSchema = z.object({
        mimetype: z.string().refine((val) => val.startsWith("image/"), {
            message: "File must be an image",
        }),
        size: z.number().max(1 * 1024 * 1024, "File size must be less than 1MB"),
    });

    const shop = await prisma.$transaction(async (tx) => {
        // Fetch existing shop and licenses
        const existingShop = await tx.shop.findUnique({
            where: { id: parseInt(id) },
            include: { licenses: true },
        });

        if (!existingShop) {
            throw new Error("Shop not found");
        }

        // Prepare shop update data
        const shopUpdateData: any = { ...validatedData };

        // Handle shop image update
        if (files?.["image"] && files["image"].length > 0) {
            imageSchema.parse(files["image"][0]);
            const newImageUrl = await uploadToCloudinary(files["image"][0].buffer, ENV.cloud_name!);
            shopUpdateData.image = newImageUrl;

            // Delete old image from Cloudinary if it exists
            if (isCloudinaryResponse(existingShop.image)) {
                await deleteFromCloudinary(existingShop.image.public_id);
            }
        }

        // Prepare licenses update data
        const licensesUpdateData: any = {};
        const licenseFields = [
            "shopLicense",
            "gstCertificate",
            "storagePermissionCertificate",
            "fassiLicense",
        ];

        for (const field of licenseFields) {
            if (files?.[field] && files[field].length > 0) {
                imageSchema.parse(files[field][0]);
                const newUrl = await uploadToCloudinary(files[field][0].buffer, ENV.cloud_name!);
                licensesUpdateData[field] = newUrl;

                // Delete old license image from Cloudinary if it exists
                const license = existingShop.licenses?.[0];
                if (license) {
                    const oldLicenseData = (license as any)[field];
                    if (isCloudinaryResponse(oldLicenseData)) {
                        await deleteFromCloudinary(oldLicenseData.public_id);
                    }
                }
            }
        }

        // Update shop
        const updatedShop = await tx.shop.update({
            where: { id: parseInt(id) },
            data: shopUpdateData,
            include: {
                licenses: true,
                
            }
        });

        // Update licenses if any license files were provided
        if (Object.keys(licensesUpdateData).length > 0 && existingShop.licenses?.[0]) {
            await tx.licenses.update({
                where: { id: existingShop.licenses[0].id },
                data: licensesUpdateData,
            });
        }

        return updatedShop;
    });

    return SuccessResponse(res, "Shop updated successfully", shop);
});

