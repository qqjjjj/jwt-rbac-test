import argon2 from "argon2";
import { UserRepository } from "@/repositories/user_repository";
import { signToken } from "@/utils/jwt";
import { UnauthorizedError, BadRequestError } from "@/utils/errors";

/**
 * Auth Service - Handles authentication business logic
 */
export class AuthService {
  constructor(private userRepository: UserRepository) {}

  /**
   * Authenticate user and generate JWT token
   * @param email - User email
   * @param password - User password
   * @returns JWT token and user info
   */
  async login(email: string, password: string) {
    // Validate input
    if (!email || !password) {
      throw new BadRequestError("Email and password required");
    }

    // Find user
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      // Same error message to prevent email enumeration
      throw new UnauthorizedError("Invalid credentials");
    }

    // Verify password using Argon2
    const isValidPassword = await argon2.verify(user.password_hash, password);

    if (!isValidPassword) {
      throw new UnauthorizedError("Invalid credentials");
    }

    // Generate JWT
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Return token and user info (without password)
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }
}
