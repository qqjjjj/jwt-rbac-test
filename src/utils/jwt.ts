import jwt from "jsonwebtoken";
import { JWTPayload } from "@/models/types";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN_HOURS: number = parseInt(
  process.env.JWT_EXPIRES_IN_HOURS || "24"
);

// Create a JWT token
export const signToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN_HOURS * 60 * 60,
    issuer: "jwt-rbac-api", // Who issued the token
    audience: "jwt-rbac-users", // Who can use it
  });
};

// Verify and decode a JWT token
export const verifyToken = (token: string): JWTPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: "jwt-rbac-api",
      audience: "jwt-rbac-users",
    }) as JWTPayload;

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Token expired");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Invalid token");
    }
    throw new Error("Token verification failed");
  }
};
