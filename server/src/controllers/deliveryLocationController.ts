import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getCounties = async (_req: Request, res: Response): Promise<void> => {
    try {
        const counties = await prisma.county.findMany({
            select: { id: true, name: true },
            orderBy: { name: "asc" },
        });

        res.json(counties);
    } catch (err: any) {
        console.error("getCounties error:", err);
        res.status(500).json({ message: "Failed to load counties" });
    }
};

export const getTownsByCounty = async (req: Request, res: Response): Promise<void> => {
    try {
        const { countyId } = req.params;

        if (!countyId || isNaN(Number(countyId))) {
            res.status(400).json({ message: "Valid countyId is required" });
            return;
        }

        const towns = await prisma.town.findMany({
            where: { countyId: Number(countyId) },
            select: { id: true, name: true, postalCode: true },
            orderBy: { name: "asc" },
        });

        res.json(towns);
    } catch (err: any) {
        console.error("getTownsByCounty error:", err);
        res.status(500).json({ message: "Failed to load towns" });
    }
};

export const getMyDeliveryLocation = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const location = await prisma.userDeliveryLocation.findUnique({
            where: { userId },
            include: {
                county: { select: { id: true, name: true } },
                town: { select: { id: true, name: true, postalCode: true } },
            },
        });


        res.json(location);
    } catch (err: any) {
        console.error("getMyDeliveryLocation error:", err);
        res.status(500).json({ message: "Failed to retrieve delivery location" });
    }
};

export const saveMyDeliveryLocation = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { countyId, townId } = req.body;

        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        if (!countyId || !townId || isNaN(Number(countyId)) || isNaN(Number(townId))) {
            res.status(400).json({ message: "Valid countyId and townId are required" });
            return;
        }

        const location = await prisma.userDeliveryLocation.upsert({
            where: { userId },
            update: { countyId: Number(countyId), townId: Number(townId) },
            create: {
                userId,
                countyId: Number(countyId),
                townId: Number(townId),
            },
            include: {
                county: { select: { id: true, name: true } },
                town: { select: { id: true, name: true, postalCode: true } },
            },
        });

        res.status(200).json({
            message: "Delivery location saved successfully",
            location,
        });
    } catch (err: any) {
        console.error("saveMyDeliveryLocation error:", err);

        if (err.code === "P2003") {
            res.status(400).json({ message: "Invalid county or town selected" });
            return;
        }

        res.status(500).json({ message: "Failed to save delivery location" });
    }
};

export const deleteMyDeliveryLocation = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        await prisma.userDeliveryLocation.delete({
            where: { userId },
        });

        res.json({ message: "Delivery location removed" });
    } catch (err: any) {
        if (err.code === "P2025") {
            res.status(404).json({ message: "No delivery location found" });
            return;
        }
        console.error("deleteMyDeliveryLocation error:", err);
        res.status(500).json({ message: "Failed to delete delivery location" });
    }
};
