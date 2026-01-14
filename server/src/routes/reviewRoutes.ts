import express from "express";
import {
    upsertReview,
    getProductReviews,
    getMyReviewForProduct,
    deleteReview,
} from "../controllers/reviewController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

// Create or update a review (user only)
router.post("/", authMiddleware(["user"]), upsertReview);

// Get all reviews for a product (public)
router.get("/product/:productId", getProductReviews);

// Get logged-in user's review for product
router.get("/my/:productId", authMiddleware(["user"]), getMyReviewForProduct);

// Delete user's review
router.delete("/:productId", authMiddleware(["user"]), deleteReview);

export default router;
