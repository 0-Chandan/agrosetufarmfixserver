import prisma from "../config/prisma";
import { statusCode } from "../types/types";
import { verifyToken } from "../utils/jwt.utils";
import { ErrorResponse } from "../utils/response.utils";
import { asyncHandler } from "./error.middleware";

export const Authnticateuser = asyncHandler(async (req, res, next) => {
  const tokenFromCookie = req.cookies?.token;
  const tokenFromHeader =
    req.headers["authorization"]?.split("Bearer ")[1]?.trim() ||
    req.headers.cookie?.split("=")[1]?.trim();

  const tokenFromHeader2 = req.headers["authorization"]
    ?.split("Bearer ")[1]
    ?.trim();

  const token = tokenFromCookie || tokenFromHeader || tokenFromHeader2;
  if (!token) {
    return next(
      new ErrorResponse(
        "Not authorized, token missing",
        statusCode.Unauthorized
      )
    );
  }

  let decoded;
  try {
    decoded = verifyToken(token) as { id: number };
  } catch (error) {
    return next(
      new ErrorResponse("Invalid or expired token", statusCode.Unauthorized)
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: {
      id: true,
      name: true,
      email: true
    },
  });

  if (!user) {
    return next(
      new ErrorResponse("User not found", statusCode.Unauthorized)
    );
  }

  // Only assign the required user fields to req.user
  req.user = {
    id: user.id,
    name: user.name ?? undefined,
    email: user.email ?? undefined,
   
  };
  next();
});


declare global {
    namespace Express {
        interface Request {
            user?: {
                id: number,
                name?: string, 
                email?: string,
            }
        }
    }
}
