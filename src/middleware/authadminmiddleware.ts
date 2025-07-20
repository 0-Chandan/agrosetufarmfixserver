import prisma from "../config/prisma";
import { statusCode } from "../types/types";
import { verifyToken } from "../utils/jwt.utils";
import { ErrorResponse } from "../utils/response.utils";
import { asyncHandler } from "./error.middleware";

// Interface for token payload
interface TokenPayload {
  id: number;
  // Add other expected token fields if needed
}

export const AuthnticateAdmin = asyncHandler(async (req, res, next) => {
  // Get token from various sources
  const token = req.cookies?.token || 
               req.headers.authorization?.split('Bearer ')[1]?.trim() || 
               req.headers.cookie?.split('token=')[1]?.trim();

  if (!token) {
    return next(
      new ErrorResponse("Authorization token required", statusCode.Unauthorized)
    );
  }

  // Verify and decode token
  let decoded: TokenPayload;
  try {
    decoded = verifyToken(token) as TokenPayload;
    
    // Additional validation for decoded payload
    if (!decoded?.id || typeof decoded.id !== 'number') {
      return next(
        new ErrorResponse("Invalid token payload", statusCode.Unauthorized)
      );
    }
  } catch (error) {
    console.error("Token verification error:", error);
    return next(
      new ErrorResponse("Invalid or expired token", statusCode.Unauthorized)
    );
  }

  // Find admin in database
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true
      },
    });

    if (!admin) {
      return next(
        new ErrorResponse("Admin account not found", statusCode.Unauthorized)
      );
    }

    // Attach admin to request
    req.admin = {
      id: admin.id,
      name: admin.name ?? undefined,
      email: admin.email ?? undefined,
    };
    
    next();
  } catch (error) {
    console.error("Database error during authentication:", error);
    return next(
      new ErrorResponse("Authentication failed", statusCode.Internal_Server_Error)
    );
  }
});

declare global {
  namespace Express {
    interface Request {
      admin?: {
        id: number;
        name?: string;
        email?: string;
      };
    }
  }
}