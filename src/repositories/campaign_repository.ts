import { pool } from "@/config/database";
import { SalesCampaign } from "@/models/types";

/**
 * DTOs for Campaign operations
 */
export interface CreateCampaignDTO {
  name: string;
  budget?: number;
  start_date?: string;
  end_date?: string;
  created_by: number;
}

export interface UpdateCampaignDTO {
  name?: string;
  budget?: number;
  start_date?: string;
  end_date?: string;
}

/**
 * Campaign Repository - Handles all database operations for sales_campaign
 */
export class CampaignRepository {
  /**
   * Get all campaigns ordered by creation date
   */
  async findAll(): Promise<SalesCampaign[]> {
    const result = await pool.query<SalesCampaign>(
      "SELECT * FROM sales_campaign ORDER BY created_at DESC"
    );
    return result.rows;
  }

  /**
   * Find a campaign by ID
   */
  async findById(id: number): Promise<SalesCampaign | null> {
    const result = await pool.query<SalesCampaign>(
      "SELECT * FROM sales_campaign WHERE id = $1",
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * Create a new campaign
   */
  async create(data: CreateCampaignDTO): Promise<SalesCampaign> {
    const result = await pool.query<SalesCampaign>(
      `INSERT INTO sales_campaign (name, budget, start_date, end_date, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [data.name, data.budget, data.start_date, data.end_date, data.created_by]
    );
    return result.rows[0];
  }

  /**
   * Update a campaign by ID
   */
  async update(
    id: number,
    data: UpdateCampaignDTO
  ): Promise<SalesCampaign | null> {
    const result = await pool.query<SalesCampaign>(
      `UPDATE sales_campaign 
       SET name = COALESCE($1, name),
           budget = COALESCE($2, budget),
           start_date = COALESCE($3, start_date),
           end_date = COALESCE($4, end_date),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [data.name, data.budget, data.start_date, data.end_date, id]
    );
    return result.rows[0] || null;
  }

  /**
   * Delete a campaign by ID
   * @returns true if deleted, false if not found
   */
  async delete(id: number): Promise<boolean> {
    const result = await pool.query(
      "DELETE FROM sales_campaign WHERE id = $1 RETURNING id",
      [id]
    );
    return result.rows.length > 0;
  }
}
