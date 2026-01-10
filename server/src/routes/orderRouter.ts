import express from "express";
import {createOrder, getOrderById, getOrders, updateOrderStatus} from "../controllers/orderController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

// POST /api/orders - Create new order from cart
router.post("/", authMiddleware(["user", "admin"]), createOrder);
// User: View own orders | Admin: View all orders
router.get("/", authMiddleware(["user", "admin"]), getOrders);
router.get("/my", authMiddleware(["user"]), getOrders); // Optional alias

// Both: View specific order (user only own)
router.get("/:id", authMiddleware(["user", "admin"]), getOrderById);

// Admin only: Update status
router.patch("/:id/status", authMiddleware(["admin"]), updateOrderStatus);

export default router;