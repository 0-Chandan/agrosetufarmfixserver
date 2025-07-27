import prisma from "../config/prisma";
import { asyncHandler } from "../middleware/error.middleware";
import { ErrorResponse, SuccessResponse } from "../utils/response.utils";
import { MandiPriceSchema } from "../validators/mandiPrice";

const createMandiPrice = asyncHandler(async (req, res, next) => {
    const validatedData = MandiPriceSchema.parse(req.body);

    const mandiPrice = await prisma.mandiPrice.create({
    data: validatedData,
  });

  return SuccessResponse(res, "Mandi price created successfully", mandiPrice, 201);

})


const getAllMandiPrices = asyncHandler(async (req, res, next) => {
  const {
    page = "1",
    limit = "10",
    search = "",
  } = req.query as {
    page?: string;
    limit?: string;
    search?: string;
    sort?: string;
        };
    
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {}

    if (search) {
        where.OR = [
            { cropName: { contains: search } },
        ];
    }

    const [mandiPrices, total] = await Promise.all([
        prisma.mandiPrice.findMany({
            where,
            skip: Number(skip),
            take: Number(limit),
        }),
        prisma.mandiPrice.count({ where }),
    ]);

    const totalPages = Math.ceil(total / Number(limit));

    return SuccessResponse(res, "Mandi prices fetched successfully", {
        mandiPrices,
        totalItems: total,
        totalPages,
        currentPage: Number(page),
        count: mandiPrices.length
    });
    
});

const getMandiPriceById = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const mandiPrice = await prisma.mandiPrice.findUnique({
        where: {
            id: Number(id),
        },
    });

    if (!mandiPrice) {
        return next(new ErrorResponse("Mandi price not found", 404));
    }

    return SuccessResponse(res, "Mandi price fetched successfully", mandiPrice);
});

const updateMandiPrice = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const validatedData = MandiPriceSchema.partial().parse(req.body);

    const mandiPrice = await prisma.mandiPrice.update({
        where: {
            id: Number(id),
        },
        data: {
            cropName: validatedData.cropName,
            currentPrice: validatedData.currentPrice,
            lastPrice: validatedData.lastPrice,
        },
    });

    return SuccessResponse(res, "Mandi price updated successfully", mandiPrice);
});

const deleteMandiPrice = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    if(!id) {
        return next(new ErrorResponse("Mandi price id is required", 400));
    }


    const mandiPrice = await prisma.mandiPrice.delete({
        where: {
            id: Number(id),
        },
    });

    if(!mandiPrice) {
        return next(new ErrorResponse("Mandi price not found", 404));
    }

    return SuccessResponse(res, "Mandi price deleted successfully", mandiPrice);
});

export {
    createMandiPrice,
    getAllMandiPrices,
    getMandiPriceById,
    updateMandiPrice,
    deleteMandiPrice

}