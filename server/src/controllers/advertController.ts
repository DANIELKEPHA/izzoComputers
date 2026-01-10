import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAdverts = async (req: Request, res: Response): Promise<void> => {
    try {
        const { categoryId } = req.query;

        const adverts = await prisma.advert.findMany({
            where: {
                isActive: true,
                ...(categoryId && {
                    categories: {
                        some: { categoryId: Number(categoryId) }
                    }
                })
            },
            include: {
                categories: {
                    include: {
                        category: { select: { id: true, name: true } }
                    }
                }
            },
            orderBy: [
                { priority: "desc" },
                { createdAt: "desc" }
            ]
        });

        res.json(adverts);
    } catch (err) {
        console.error("getAdverts error:", err);
        res.status(500).json({ message: "Failed to fetch adverts" });
    }
};

export const createAdvert = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            title,
            subtitle,
            description,
            ctaText,
            ctaLink,
            backgroundColor,
            textColor,
            badge,
            badgeColor,
            discount,
            timerText,
            displayDuration,
            startsAt,
            endsAt,
            priority,
            categoryIds
        } = req.body;

        if (!title || !subtitle || !ctaText || !ctaLink || !backgroundColor || !textColor) {
            res.status(400).json({ message: "Missing required advert fields" });
            return;
        }

        const advert = await prisma.advert.create({
            data: {
                title,
                subtitle,
                description,
                ctaText,
                ctaLink,
                backgroundColor,
                textColor,
                badge,
                badgeColor,
                discount,
                timerText,
                displayDuration: displayDuration ? Number(displayDuration) : 10,
                startsAt: startsAt ? new Date(startsAt) : new Date(),
                endsAt: endsAt ? new Date(endsAt) : null,
                priority: priority ? Number(priority) : 0,
                categories: categoryIds
                    ? {
                        create: JSON.parse(categoryIds).map((id: number) => ({
                            categoryId: id
                        }))
                    }
                    : undefined
            },
            include: {
                categories: { include: { category: true } }
            }
        });

        res.status(201).json({ message: "Advert created", advert });
    } catch (err) {
        console.error("createAdvert error:", err);
        res.status(500).json({ message: "Failed to create advert" });
    }
};

export const updateAdvert = async (req: Request, res: Response): Promise<void> => {
    try {
        const advertId = Number(req.params.id);
        if (!advertId) {
            res.status(400).json({ message: "Invalid advert ID" });
            return;
        }

        const {
            title,
            subtitle,
            description,
            ctaText,
            ctaLink,
            backgroundColor,
            textColor,
            badge,
            badgeColor,
            discount,
            timerText,
            displayDuration,
            startsAt,
            endsAt,
            priority,
            isActive,
            categoryIds
        } = req.body;

        await prisma.advertCategory.deleteMany({ where: { advertId } });

        const advert = await prisma.advert.update({
            where: { id: advertId },
            data: {
                ...(title && { title }),
                ...(subtitle && { subtitle }),
                ...(description !== undefined && { description }),
                ...(ctaText && { ctaText }),
                ...(ctaLink && { ctaLink }),
                ...(backgroundColor && { backgroundColor }),
                ...(textColor && { textColor }),
                ...(badge !== undefined && { badge }),
                ...(badgeColor !== undefined && { badgeColor }),
                ...(discount !== undefined && { discount }),
                ...(timerText !== undefined && { timerText }),
                ...(displayDuration && { displayDuration: Number(displayDuration) }),
                ...(startsAt && { startsAt: new Date(startsAt) }),
                ...(endsAt !== undefined && { endsAt: endsAt ? new Date(endsAt) : null }),
                ...(priority !== undefined && { priority: Number(priority) }),
                ...(isActive !== undefined && { isActive: Boolean(isActive) }),
                ...(categoryIds && {
                    categories: {
                        create: JSON.parse(categoryIds).map((id: number) => ({
                            categoryId: id
                        }))
                    }
                })
            },
            include: {
                categories: { include: { category: true } }
            }
        });

        res.json({ message: "Advert updated", advert });
    } catch (err) {
        console.error("updateAdvert error:", err);
        res.status(500).json({ message: "Failed to update advert" });
    }
};

export const deleteAdvert = async (req: Request, res: Response): Promise<void> => {
    try {
        const advertId = Number(req.params.id);

        await prisma.advert.delete({ where: { id: advertId } });

        res.json({ message: "Advert deleted" });
    } catch (err) {
        console.error("deleteAdvert error:", err);
        res.status(500).json({ message: "Failed to delete advert" });
    }
};
