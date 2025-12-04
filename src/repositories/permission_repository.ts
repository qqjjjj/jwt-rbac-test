import { pool } from "@/config/database";
import { ColumnPermission } from "@/models/types";

/**
 * Permission Repository - Handles RBAC permission database operations
 */
export class PermissionRepository {
  /**
   * Get all permissions
   */
  async findAll(): Promise<ColumnPermission[]> {
    const result = await pool.query<ColumnPermission>(
      "SELECT * FROM column_permissions ORDER BY role, table_name, column_name"
    );
    return result.rows;
  }

  /**
   * Get permissions for a specific role and table
   */
  async findByRoleAndTable(
    role: string,
    tableName: string
  ): Promise<ColumnPermission[]> {
    const result = await pool.query<ColumnPermission>(
      "SELECT * FROM column_permissions WHERE role = $1 AND table_name = $2",
      [role, tableName]
    );
    return result.rows;
  }

  /**
   * Get a specific permission
   */
  async findOne(
    role: string,
    tableName: string,
    columnName: string
  ): Promise<ColumnPermission | null> {
    const result = await pool.query<ColumnPermission>(
      "SELECT * FROM column_permissions WHERE role = $1 AND table_name = $2 AND column_name = $3",
      [role, tableName, columnName]
    );
    return result.rows[0] || null;
  }

  /**
   * Create or update a permission
   */
  async upsert(
    role: string,
    tableName: string,
    columnName: string,
    canRead: boolean
  ): Promise<ColumnPermission> {
    const result = await pool.query<ColumnPermission>(
      `INSERT INTO column_permissions (role, table_name, column_name, can_read)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (role, table_name, column_name)
       DO UPDATE SET can_read = $4
       RETURNING *`,
      [role, tableName, columnName, canRead]
    );
    return result.rows[0];
  }

  /**
   * Delete a permission
   */
  async delete(
    role: string,
    tableName: string,
    columnName: string
  ): Promise<boolean> {
    const result = await pool.query(
      "DELETE FROM column_permissions WHERE role = $1 AND table_name = $2 AND column_name = $3 RETURNING id",
      [role, tableName, columnName]
    );
    return result.rows.length > 0;
  }

  /**
   * Delete all permissions for a role and table
   */
  async deleteByRoleAndTable(role: string, tableName: string): Promise<number> {
    const result = await pool.query(
      "DELETE FROM column_permissions WHERE role = $1 AND table_name = $2 RETURNING id",
      [role, tableName]
    );
    return result.rows.length;
  }
}
