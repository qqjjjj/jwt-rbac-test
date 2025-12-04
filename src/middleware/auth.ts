import { Response, NextFunction } from "express";
import { AuthRequest } from "@/models/types";
import { verifyToken } from "@/utils/jwt";

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "No token provided" });
      return;
    }

    // Extract token (format: "Bearer <token>")
    const token = authHeader.substring(7);

    // Verify and decode token
    const payload = verifyToken(token);

    // Attach user info to request
    req.user = payload;

    next(); // Continue to next middleware/controller
  } catch (error) {
    res.status(401).json({
      error: "Invalid or expired token",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
