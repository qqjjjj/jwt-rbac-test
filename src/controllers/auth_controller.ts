import { Request, Response } from "express";
import { AuthService } from "@/services/auth_service";
import { UserRepository } from "@/repositories/user_repository";
import { AppError } from "@/utils/errors";

const authService = new AuthService(new UserRepository());

/**
 * Login endpoint - authenticates user and returns JWT token
 * @route POST /api/auth/login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Call service layer
    const result = await authService.login(email, password);

    res.json(result);
  } catch (error) {
    // Handle custom errors
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }

    // Handle unexpected errors
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
