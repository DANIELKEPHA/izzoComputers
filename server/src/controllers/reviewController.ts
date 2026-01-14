import { Request, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

const updateProductRating = async (productId: number) => {
    const stats = await prisma.review.aggregate({
        where: { productId },
        _avg: { rating: true },
        _count: { rating: true },
    });

    await prisma.product.update({
        where: { id: productId },
        data: {
            averageRating: stats._avg.rating
                ? new Prisma.Decimal(stats._avg.rating)
                : null,
            reviewCount: stats._count.rating,
        },
    });
};

export const upsertReview = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id;

        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const { productId, rating, title, comment } = req.body;

        if (!productId || isNaN(Number(productId))) {
            res.status(400).json({ message: "Valid productId required" });
            return;
        }

        const numericRating = Number(rating);
        if (!numericRating || numericRating < 1 || numericRating > 5) {
            res.status(400).json({ message: "Rating must be between 1 and 5" });
            return;
        }

        const review = await prisma.review.upsert({
            where: {
                productId_userId: {
                    productId: Number(productId),
                    userId,
                },
            },
            update: {
                rating: numericRating,
                title: title?.trim() || null,
                comment: comment?.trim() || null,
            },
            create: {
                productId: Number(productId),
                userId,
                rating: numericRating,
                title: title?.trim() || null,
                comment: comment?.trim() || null,
            },
        });

        await updateProductRating(Number(productId));

        res.status(201).json({ message: "Review saved", review });
    } catch (err: any) {
        console.error("upsertReview error:", err);
        res.status(500).json({ message: "Failed to save review" });
    }
};

export const getProductReviews = async (req: Request, res: Response): Promise<void> => {
    try {
        const { productId } = req.params;

        if (!productId || isNaN(Number(productId))) {
            res.status(400).json({ message: "Valid productId required" });
            return;
        }

        const reviews = await prisma.review.findMany({
            where: { productId: Number(productId) },
            include: {
                user: { select: { name: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        res.json(reviews);
    } catch (err: any) {
        console.error("getProductReviews error:", err);
        res.status(500).json({ message: "Failed to fetch reviews" });
    }
};

export const getMyReviewForProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id;

        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const { productId } = req.params;

        const review = await prisma.review.findUnique({
            where: {
                productId_userId: {
                    productId: Number(productId),
                    userId,
                },
            },
        });

        res.json(review);
    } catch (err: any) {
        console.error("getMyReviewForProduct error:", err);
        res.status(500).json({ message: "Failed to fetch review" });
    }
};

export const deleteReview = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id;

        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const { productId } = req.params;

        const deleted = await prisma.review.delete({
            where: {
                productId_userId: {
                    productId: Number(productId),
                    userId,
                },
            },
        });

        await updateProductRating(Number(productId));

        res.json({ message: "Review deleted" });
    } catch (err: any) {
        console.error("deleteReview error:", err);
        if (err.code === "P2025") {
            res.status(404).json({ message: "Review not found" });
            return;
        }
        res.status(500).json({ message: "Failed to delete review" });
    }
};
