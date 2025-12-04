import {
  CampaignRepository,
  CreateCampaignDTO,
  UpdateCampaignDTO,
} from "@/repositories/campaign_repository";
import { SalesCampaign } from "@/models/types";
import { NotFoundError, ForbiddenError, BadRequestError } from "@/utils/errors";

/**
 * Campaign Service - Handles campaign business logic
 */
export class CampaignService {
  constructor(private campaignRepository: CampaignRepository) {}

  /**
   * Get all campaigns
   */
  async getAllCampaigns(): Promise<SalesCampaign[]> {
    return await this.campaignRepository.findAll();
  }

  /**
   * Get a single campaign by ID
   */
  async getCampaignById(id: number): Promise<SalesCampaign> {
    const campaign = await this.campaignRepository.findById(id);

    if (!campaign) {
      throw new NotFoundError("Campaign not found");
    }

    return campaign;
  }

  /**
   * Create a new campaign
   */
  async createCampaign(data: CreateCampaignDTO): Promise<SalesCampaign> {
    // Validate required fields
    if (!data.name) {
      throw new BadRequestError("Name is required");
    }

    return await this.campaignRepository.create(data);
  }

  /**
   * Update a campaign
   * Enforces ownership rules: USER can only update their own campaigns
   */
  async updateCampaign(
    id: number,
    data: UpdateCampaignDTO,
    userId: number,
    userRole: string
  ): Promise<SalesCampaign> {
    // Check if campaign exists
    const existing = await this.campaignRepository.findById(id);

    if (!existing) {
      throw new NotFoundError("Campaign not found");
    }

    // Authorization: USER can only update their own campaigns
    if (userRole === "USER" && existing.created_by !== userId) {
      throw new ForbiddenError("You can only update your own campaigns");
    }

    // Update campaign
    const updated = await this.campaignRepository.update(id, data);

    if (!updated) {
      throw new NotFoundError("Campaign not found");
    }

    return updated;
  }

  /**
   * Delete a campaign
   * Only ADMIN can delete campaigns
   */
  async deleteCampaign(id: number, userRole: string): Promise<void> {
    // Authorization: Only ADMIN can delete
    if (userRole !== "ADMIN") {
      throw new ForbiddenError("Only admins can delete campaigns");
    }

    const deleted = await this.campaignRepository.delete(id);

    if (!deleted) {
      throw new NotFoundError("Campaign not found");
    }
  }
}
