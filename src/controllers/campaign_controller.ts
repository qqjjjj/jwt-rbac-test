import { Response } from "express";
import { AuthRequest } from "@/models/types";
import { CampaignService } from "@/services/campaign_service";
import { CampaignRepository } from "@/repositories/campaign_repository";
import { filterColumns } from "@/utils/rbac";
import { AppError } from "@/utils/errors";

const campaignService = new CampaignService(new CampaignRepository());

/**
 * GET /api/campaigns - List all campaigns
 */
export const getCampaigns = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const campaigns = await campaignService.getAllCampaigns();

    // Filter columns based on user permissions
    const filtered = campaigns.map((campaign) =>
      filterColumns(campaign, req.allowedColumns!)
    );

    res.json(filtered);
  } catch (error) {
    console.error("Get campaigns error:", error);
    res.status(500).json({ error: "Failed to fetch campaigns" });
  }
};

/**
 * GET /api/campaigns/:id - Get single campaign
 */
export const getCampaign = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const campaign = await campaignService.getCampaignById(Number(id));

    const filtered = filterColumns(campaign, req.allowedColumns!);
    res.json(filtered);
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    console.error("Get campaign error:", error);
    res.status(500).json({ error: "Failed to fetch campaign" });
  }
};

/**
 * POST /api/campaigns - Create campaign
 */
export const createCampaign = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { name, budget, start_date, end_date } = req.body;

    const campaign = await campaignService.createCampaign({
      name,
      budget,
      start_date,
      end_date,
      created_by: req.user!.userId,
    });

    const filtered = filterColumns(campaign, req.allowedColumns!);

    res.status(201).json(filtered);
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    console.error("Create campaign error:", error);
    res.status(500).json({ error: "Failed to create campaign" });
  }
};

/**
 * PUT /api/campaigns/:id - Update campaign
 */
export const updateCampaign = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, budget, start_date, end_date } = req.body;

    const campaign = await campaignService.updateCampaign(
      Number(id),
      { name, budget, start_date, end_date },
      req.user!.userId,
      req.user!.role
    );

    const filtered = filterColumns(campaign, req.allowedColumns!);
    res.json(filtered);
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    console.error("Update campaign error:", error);
    res.status(500).json({ error: "Failed to update campaign" });
  }
};

/**
 * DELETE /api/campaigns/:id - Delete campaign
 */
export const deleteCampaign = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    await campaignService.deleteCampaign(Number(id), req.user!.role);

    res.json({ message: "Campaign deleted successfully" });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    console.error("Delete campaign error:", error);
    res.status(500).json({ error: "Failed to delete campaign" });
  }
};
