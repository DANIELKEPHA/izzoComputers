import express from "express";
import { getDashboardStats } from "../controllers/dashboardController"; // or wherever you place it
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

router.get(
    "/stats",
    authMiddleware(["admin"]),
    getDashboardStats
);

export default router;