import { PermissionRepository } from "@/repositories/permission_repository";
import { ColumnPermission } from "@/models/types";
import { BadRequestError, NotFoundError } from "@/utils/errors";

/**
 * Permission Service - Handles RBAC permission business logic
 */
export class PermissionService {
  constructor(private permissionRepository: PermissionRepository) {}

  /**
   * Get all permissions
   */
  async getAllPermissions(): Promise<ColumnPermission[]> {
    return await this.permissionRepository.findAll();
  }

  /**
   * Get permissions for a specific role and table
   */
  async getPermissionsByRoleAndTable(
    role: string,
    tableName: string
  ): Promise<ColumnPermission[]> {
    this.validateRole(role);
    return await this.permissionRepository.findByRoleAndTable(role, tableName);
  }

  /**
   * Create or update a permission
   */
  async setPermission(
    role: string,
    tableName: string,
    columnName: string,
    canRead: boolean
  ): Promise<ColumnPermission> {
    this.validateRole(role);
    this.validateInput(tableName, columnName);

    const permission = await this.permissionRepository.upsert(
      role,
      tableName,
      columnName,
      canRead
    );

    return permission;
  }

  /**
   * Bulk set permissions for a role and table
   */
  async bulkSetPermissions(
    role: string,
    tableName: string,
    columns: Array<{ columnName: string; canRead: boolean }>
  ): Promise<ColumnPermission[]> {
    this.validateRole(role);

    const results: ColumnPermission[] = [];

    for (const { columnName, canRead } of columns) {
      const permission = await this.permissionRepository.upsert(
        role,
        tableName,
        columnName,
        canRead
      );
      results.push(permission);
    }

    return results;
  }

  /**
   * Delete a specific permission
   */
  async deletePermission(
    role: string,
    tableName: string,
    columnName: string
  ): Promise<void> {
    const deleted = await this.permissionRepository.delete(
      role,
      tableName,
      columnName
    );

    if (!deleted) {
      throw new NotFoundError("Permission not found");
    }
  }

  /**
   * Delete all permissions for a role and table
   */
  async deletePermissionsByRoleAndTable(
    role: string,
    tableName: string
  ): Promise<number> {
    const count = await this.permissionRepository.deleteByRoleAndTable(
      role,
      tableName
    );

    return count;
  }

  /**
   * Validate role
   */
  private validateRole(role: string): void {
    const validRoles = ["ADMIN", "USER"];
    if (!validRoles.includes(role)) {
      throw new BadRequestError(
        `Invalid role. Must be one of: ${validRoles.join(", ")}`
      );
    }
  }

  /**
   * Validate input
   */
  private validateInput(tableName: string, columnName: string): void {
    if (!tableName || !columnName) {
      throw new BadRequestError("Table name and column name are required");
    }
  }
}
