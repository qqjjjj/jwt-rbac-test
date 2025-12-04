import { Router } from "express";
import { authenticate } from "@/middleware/auth";
import {
  getAllPermissions,
  getPermissionsByRoleAndTable,
  setPermission,
  bulkSetPermissions,
  deletePermission,
  deletePermissionsByRoleAndTable,
} from "@/controllers/permission_controller";

const router = Router();

// All permission routes require authentication
router.use(authenticate);

// Admin-only middleware (only ADMIN can manage permissions)
const adminOnly = (req: any, res: any, next: any) => {
  if (req.user.role !== "ADMIN") {
    return res
      .status(403)
      .json({ error: "Only admins can manage permissions" });
  }
  next();
};

router.use(adminOnly);

// Get all permissions
router.get("/", getAllPermissions);

// Get permissions for specific role and table
router.get("/:role/:table", getPermissionsByRoleAndTable);

// Set a single permission
router.put("/", setPermission);

// Bulk set permissions
router.post("/bulk", bulkSetPermissions);

// Delete a specific permission
router.delete("/", deletePermission);

// Delete all permissions for role and table
router.delete("/:role/:table", deletePermissionsByRoleAndTable);

export default router;
