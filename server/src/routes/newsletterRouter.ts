// src/routes/newsletterRouter.ts

import express from "express";
import {
    subscribeToNewsletter,
    unsubscribeFromNewsletter,
    getNewsletterSubscribers,
} from "../controllers/newsletterController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

/**
 * POST /api/newsletter/subscribe
 * Public endpoint – anyone can subscribe
 */
router.post("/subscribe", subscribeToNewsletter);

/**
 * POST /api/newsletter/unsubscribe
 * Public endpoint – anyone can unsubscribe (usually via a link in email)
 */
router.post("/unsubscribe", unsubscribeFromNewsletter);

/**
 * GET /api/newsletter/subscribers
 * Admin-only – list all subscribers (with pagination support)
 */
router.get(
    "/subscribers",
    authMiddleware(["admin"]),
    getNewsletterSubscribers
);

export default router;