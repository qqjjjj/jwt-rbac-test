import { Request } from "express";

export interface User {
  id: number;
  email: string;
  password_hash: string;
  role: "ADMIN" | "USER";
  created_at: Date;
}

export interface SalesCampaign {
  id: number;
  name: string;
  budget?: number;
  start_date?: Date;
  end_date?: Date;
  created_by?: number;
  created_at: Date;
  updated_at: Date;
}

export interface ColumnPermission {
  id: number;
  role: string;
  table_name: string;
  column_name: string;
  can_read: boolean;
}

export interface JWTPayload {
  userId: number;
  email: string;
  role: "ADMIN" | "USER";
}

// Add allowedColumns to AuthRequest
export interface AuthRequest extends Request {
  user?: JWTPayload;
  allowedColumns?: Set<string>; // Added this
}
