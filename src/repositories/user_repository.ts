import { pool } from "@/config/database";
import { User } from "@/models/types";

/**
 * User Repository - Handles all database operations for users
 */
export class UserRepository {
  /**
   * Find a user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query<User>(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    return result.rows[0] || null;
  }

  /**
   * Find a user by ID
   */
  async findById(id: number): Promise<User | null> {
    const result = await pool.query<User>("SELECT * FROM users WHERE id = $1", [
      id,
    ]);
    return result.rows[0] || null;
  }

  /**
   * Create a new user
   */
  async create(
    email: string,
    passwordHash: string,
    role: "ADMIN" | "USER"
  ): Promise<User> {
    const result = await pool.query<User>(
      "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING *",
      [email, passwordHash, role]
    );
    return result.rows[0];
  }
}
