import { Router } from "express";
import { login } from "@/controllers/auth_controller";

const router = Router();

// POST /api/auth/login
router.post("/login", login);

export default router;
