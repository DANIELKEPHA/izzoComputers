// src/routes/cartRouter.ts

import express from "express";
import {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart, syncGuestCart,
} from "../controllers/cartController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", authMiddleware(["admin", "user"]), getCart);

router.post("/", authMiddleware(["admin", "user"]), addToCart);

router.patch("/:productId", authMiddleware(["admin", "user"]), updateCartItem);

router.delete("/:productId", authMiddleware(["admin", "user"]), removeFromCart);

router.post("/sync", authMiddleware(["user", "admin"]), syncGuestCart);

router.delete("/", authMiddleware(["admin", "user"]), clearCart);

export default router;