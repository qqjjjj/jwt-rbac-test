import { Response, NextFunction } from "express";
import { AuthRequest, ColumnPermission } from "@/models/types";
import { PermissionRepository } from "@/repositories/permission_repository";

const permissionRepository = new PermissionRepository();

/**
 * Load column permissions for a specific role and table
 * Uses repository to query database for allowed columns
 */
async function loadPermissions(
  role: string,
  tableName: string
): Promise<Set<string>> {
  // Get permissions from repository
  const permissions = await permissionRepository.findByRoleAndTable(
    role,
    tableName
  );

  // Filter only columns with can_read = true and return as Set
  const allowedColumns = new Set<string>(
    permissions
      .filter((p: ColumnPermission) => p.can_read)
      .map((p: ColumnPermission) => p.column_name)
  );

  return allowedColumns;
}

/**
 * Middleware factory - creates RBAC middleware for a specific table
 * Loads column permissions and attaches them to the request
 */
export const rbacMiddleware = (tableName: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      // Load allowed columns for this role and table
      const allowedColumns = await loadPermissions(req.user.role, tableName);

      // Attach to request for use in controller
      req.allowedColumns = allowedColumns;

      next();
    } catch (error) {
      res.status(500).json({
        error: "Failed to load permissions",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
};
