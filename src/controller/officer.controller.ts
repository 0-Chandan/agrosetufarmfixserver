import prisma from "../config/prisma";
import { asyncHandler } from "../middleware/error.middleware";
import { SuccessResponse } from "../utils/response.utils";
import { OfficerSchema } from "../validators/officer";
import bcrypt from "bcrypt";

export const createOfficer = asyncHandler(async (req, res, next) => {
    const validatedData = OfficerSchema.parse(req.body)

     const existingOfficer = await prisma.officer.findUnique({
    where: { officerId: validatedData.officerId },
  });
  if (existingOfficer) {
    return res.status(400).json({ message: "Officer ID already exists" });
    }
    
     const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    const officer = await prisma.officer.create({
    data: {
      officerId: validatedData.officerId,
      password: hashedPassword,
      place: validatedData.place,
      role: validatedData.role,
    },
  });

  const { password, ...officerWithoutPassword } = officer;

  return SuccessResponse(res, "Officer created successfully", officerWithoutPassword, 201);
})

export const getAllOffcer = asyncHandler(async (req, res, next) => {
  const officers = await prisma.officer.findMany();

  const officersWithoutPassword = officers.map((officer) => {
    const { password, ...officerWithoutPassword } = officer;
    return officerWithoutPassword;
  });

  return SuccessResponse(res, "Officers retrieved successfully", officersWithoutPassword, 200);
});

export const getOfficerById = asyncHandler(async (req, res, next) => {
  const officerId = req.params.officerId;

  const officer = await prisma.officer.findUnique({
    where: { officerId },
  });

  if (!officer) {
    return res.status(404).json({ message: "Officer not found" });
  }

  const { password, ...officerWithoutPassword } = officer;

  return SuccessResponse(res, "Officer retrieved successfully", officerWithoutPassword, 200);
});

export const updateOfficer = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Officer ID is required" });
    }
    
    const existingOfficer = await prisma.officer.findUnique({
    where: { id: parseInt(id) },
  });
  if (!existingOfficer) {
    return res.status(404).json({ message: "Officer not found" });
    }

    const validatedData = OfficerSchema.partial().parse(req.body);

    const existingOfficerId = await prisma.officer.findFirst({
    where: { officerId: validatedData.officerId, NOT: { id: parseInt(id) } },
  });
  if (existingOfficerId) {
    return res.status(400).json({ message: "Officer ID already exists" });
    }

    const hashedPassword = validatedData.password
    ? await bcrypt.hash(validatedData.password, 10)
        : undefined;
    
    const updatedOfficer = await prisma.officer.update({
    where: { id: parseInt(id) },
    data: {
      officerId: validatedData.officerId,
      password: hashedPassword,
      place: validatedData.place,
      role: validatedData.role,
    },
    });
    

    const { password, ...officerWithoutPassword } = updatedOfficer;
    

  return SuccessResponse(res, "Officer updated successfully", officerWithoutPassword, 200);
});

export const deleteOfficer = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Officer ID is required" });
    }

    const existingOfficer = await prisma.officer.findUnique({
    where: { id: parseInt(id) },
  });
  if (!existingOfficer) {
    return res.status(404).json({ message: "Officer not found" });
    }

    await prisma.officer.delete({
    where: { id: parseInt(id) },
  });

  return SuccessResponse(res, "Officer deleted successfully", {}, 200);
});