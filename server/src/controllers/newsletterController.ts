import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const subscribeToNewsletter = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { email, name, userId } = req.body;

        // Validation: email is required
        if (!email || typeof email !== "string" || !email.trim()) {
            res.status(400).json({ message: "A valid email address is required." });
            return;
        }

        const trimmedEmail = email.trim().toLowerCase();

        // Basic email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
            res.status(400).json({ message: "Please provide a valid email address." });
            return;
        }

        const trimmedName = name?.trim() || null;

        // Optional userId: must be a valid UUID string if provided
        if (userId !== undefined) {
            if (typeof userId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId)) {
                res.status(400).json({
                    message: "userId must be a valid UUID string if provided.",
                });
                return;
            }
        }

        // Check if already subscribed
        const existingSubscriber = await prisma.newsletterSubscriber.findUnique({
            where: { email: trimmedEmail },
        });

        if (existingSubscriber) {
            // If already active → just confirm
            if (existingSubscriber.isActive) {
                res.status(200).json({
                    message: "You're already subscribed to our newsletter!",
                    subscriber: {
                        email: existingSubscriber.email,
                        name: existingSubscriber.name,
                        isActive: true,
                    },
                });
                return;
            }

            // If inactive → reactivate
            const reactivated = await prisma.newsletterSubscriber.update({
                where: { email: trimmedEmail },
                data: {
                    isActive: true,
                    name: trimmedName ?? existingSubscriber.name,
                    userId: userId ?? existingSubscriber.userId, // ← String or null
                    subscribedAt: new Date(),
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    isActive: true,
                    subscribedAt: true,
                },
            });

            res.status(200).json({
                message: "Welcome back! You've been re-subscribed to our newsletter.",
                subscriber: reactivated,
            });
            return;
        }

        // Create new subscriber
        const newSubscriber = await prisma.newsletterSubscriber.create({
            data: {
                email: trimmedEmail,
                name: trimmedName,
                userId: userId ?? null, // ← String (UUID) or null
                isActive: true,
            },
            select: {
                id: true,
                email: true,
                name: true,
                isActive: true,
                subscribedAt: true,
            },
        });

        res.status(201).json({
            message: "Thank you for subscribing to our newsletter!",
            subscriber: newSubscriber,
        });
    } catch (error: any) {
        console.error("subscribeToNewsletter error:", error);

        // Handle unique constraint violation (email already exists)
        if (error.code === "P2002") {
            res.status(409).json({ message: "This email is already subscribed." });
            return;
        }

        res.status(500).json({ message: "Failed to subscribe. Please try again later." });
    }
};

export const unsubscribeFromNewsletter = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;

        if (!email || typeof email !== "string" || !email.trim()) {
            res.status(400).json({ message: "Email address is required to unsubscribe." });
            return;
        }

        const trimmedEmail = email.trim().toLowerCase();

        const subscriber = await prisma.newsletterSubscriber.findUnique({
            where: { email: trimmedEmail },
        });

        if (!subscriber) {
            res.status(404).json({ message: "This email is not subscribed to our newsletter." });
            return;
        }

        if (!subscriber.isActive) {
            res.status(200).json({ message: "This email is already unsubscribed." });
            return;
        }

        await prisma.newsletterSubscriber.update({
            where: { email: trimmedEmail },
            data: { isActive: false },
        });

        res.status(200).json({
            message: "You've been successfully unsubscribed from our newsletter.",
            email: trimmedEmail,
        });
    } catch (error: any) {
        console.error("unsubscribeFromNewsletter error:", error);
        res.status(500).json({ message: "Failed to unsubscribe. Please try again later." });
    }
};

export const getNewsletterSubscribers = async (req: Request, res: Response): Promise<void> => {
    try {
        const { page = 1, pageSize = 50, includeInactive = "false" } = req.query;

        const skip = (Number(page) - 1) * Number(pageSize);
        const take = Number(pageSize);

        const where = includeInactive === "true" ? {} : { isActive: true };

        const [subscribers, total] = await Promise.all([
            prisma.newsletterSubscriber.findMany({
                where,
                select: {
                    id: true,
                    email: true,
                    name: true,
                    isActive: true,
                    subscribedAt: true,
                    userId: true,
                },
                orderBy: { subscribedAt: "desc" },
                skip,
                take,
            }),
            prisma.newsletterSubscriber.count({ where }),
        ]);

        res.status(200).json({
            subscribers,
            pagination: {
                page: Number(page),
                pageSize: Number(pageSize),
                total,
                totalPages: Math.ceil(total / Number(pageSize)),
            },
        });
    } catch (error: any) {
        console.error("getNewsletterSubscribers error:", error);
        res.status(500).json({ message: "Failed to fetch subscribers." });
    }
};