import { Response } from "express";
import { AuthRequest } from "@/models/types";
import { PermissionService } from "@/services/permission_service";
import { PermissionRepository } from "@/repositories/permission_repository";
import { AppError } from "@/utils/errors";

const permissionService = new PermissionService(new PermissionRepository());

/**
 * GET /api/permissions - Get all permissions
 */
export const getAllPermissions = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const permissions = await permissionService.getAllPermissions();
    res.json(permissions);
  } catch (error) {
    console.error("Get permissions error:", error);
    res.status(500).json({ error: "Failed to fetch permissions" });
  }
};

/**
 * GET /api/permissions/:role/:table - Get permissions for role and table
 */
export const getPermissionsByRoleAndTable = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { role, table } = req.params;
    const permissions = await permissionService.getPermissionsByRoleAndTable(
      role,
      table
    );
    res.json(permissions);
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    console.error("Get permissions error:", error);
    res.status(500).json({ error: "Failed to fetch permissions" });
  }
};

/**
 * PUT /api/permissions - Set a single permission
 */
export const setPermission = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { role, table_name, column_name, can_read } = req.body;

    const permission = await permissionService.setPermission(
      role,
      table_name,
      column_name,
      can_read
    );

    res.json({
      message: "Permission updated successfully",
      permission,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    console.error("Set permission error:", error);
    res.status(500).json({ error: "Failed to set permission" });
  }
};

/**
 * POST /api/permissions/bulk - Bulk set permissions
 */
export const bulkSetPermissions = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { role, table_name, columns } = req.body;

    if (!Array.isArray(columns)) {
      res.status(400).json({ error: "columns must be an array" });
      return;
    }

    const permissions = await permissionService.bulkSetPermissions(
      role,
      table_name,
      columns
    );

    res.json({
      message: `${permissions.length} permissions updated successfully`,
      permissions,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    console.error("Bulk set permissions error:", error);
    res.status(500).json({ error: "Failed to set permissions" });
  }
};

/**
 * DELETE /api/permissions - Delete a specific permission
 */
export const deletePermission = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { role, table_name, column_name } = req.body;

    await permissionService.deletePermission(role, table_name, column_name);

    res.json({ message: "Permission deleted successfully" });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    console.error("Delete permission error:", error);
    res.status(500).json({ error: "Failed to delete permission" });
  }
};

/**
 * DELETE /api/permissions/:role/:table - Delete all permissions for role and table
 */
export const deletePermissionsByRoleAndTable = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { role, table } = req.params;

    const count = await permissionService.deletePermissionsByRoleAndTable(
      role,
      table
    );

    res.json({
      message: `${count} permission(s) deleted successfully`,
      count,
    });
  } catch (error) {
    console.error("Delete permissions error:", error);
    res.status(500).json({ error: "Failed to delete permissions" });
  }
};
