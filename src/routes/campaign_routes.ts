import { Router } from "express";
import { authenticate } from "@/middleware/auth";
import { rbacMiddleware } from "@/middleware/rbac";
import {
  getCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  deleteCampaign,
} from "@/controllers/campaign_controller";

const router = Router();

// All routes require authentication + RBAC
router.use(authenticate);
router.use(rbacMiddleware("sales_campaign"));

// CRUD routes
router.get("/", getCampaigns);
router.get("/:id", getCampaign);
router.post("/", createCampaign);
router.put("/:id", updateCampaign);
router.delete("/:id", deleteCampaign);

export default router;
