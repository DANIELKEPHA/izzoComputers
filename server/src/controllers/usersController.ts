import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { wktToGeoJSON } from "@terraformer/wkt";

const prisma = new PrismaClient();

export const getUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { cognitoId } = req.params;
        const user = await prisma.user.findUnique({
            where: { cognitoId },
            include: {
                favorites: true,
            },
        });

        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error: any) {
        res
            .status(500)
            .json({ message: `Error retrieving user: ${error.message}` });
    }
};

export const createuser = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { cognitoId, name, email, phoneNumber } = req.body;

        const user = await prisma.user.create({
            data: {
                cognitoId,
                name,
                email,
                phoneNumber,
            },
        });

        res.status(201).json(user);
    } catch (error: any) {
        res
            .status(500)
            .json({ message: `Error creating user: ${error.message}` });
    }
};

export const updateUser = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { cognitoId } = req.params;
        const { name, email, phoneNumber } = req.body;

        const updateUser = await prisma.user.update({
            where: { cognitoId },
            data: {
                name,
                email,
                phoneNumber,
            },
        });

        res.json(updateUser);
    } catch (error: any) {
        res
            .status(500)
            .json({ message: `Error updating user: ${error.message}` });
    }
};

// export const addFavoriteProduct = async (
//     req: Request,
//     res: Response
// ): Promise<void> => {
//     try {
//         const { cognitoId, propertyId } = req.params;
//         const user = await prisma.user.findUnique({
//             where: { cognitoId },
//             include: { favorites: true },
//         });
//
//         if (!user) {
//             res.status(404).json({ message: "User not found" });
//             return;
//         }
//
//         const productIdNumber = Number(propertyId);
//         const existingFavorites = user.favorites || [];
//
//         if (!existingFavorites.some((fav) => fav.id === productIdNumber)) {
//             const updatedUser = await prisma.user.update({
//                 where: { cognitoId },
//                 data: {
//                     favorites: {
//                         connect: { id: productIdNumber },
//                     },
//                 },
//                 include: { favorites: true },
//             });
//             res.json(updatedUser);
//         } else {
//             res.status(409).json({ message: "Property already added as favorite" });
//         }
//     } catch (error: any) {
//         res
//             .status(500)
//             .json({ message: `Error adding favorite property: ${error.message}` });
//     }
// };
//
// export const removeFavoriteProduct = async (
//     req: Request,
//     res: Response
// ): Promise<void> => {
//     try {
//         const { cognitoId, propertyId } = req.params;
//         const propertyIdNumber = Number(propertyId);
//
//         const updatedUser = await prisma.user.update({
//             where: { cognitoId },
//             data: {
//                 favorites: {
//                     disconnect: { id: propertyIdNumber },
//                 },
//             },
//             include: { favorites: true },
//         });
//
//         res.json(updatedUser);
//     } catch (err: any) {
//         res
//             .status(500)
//             .json({ message: `Error removing favorite property: ${err.message}` });
//     }
// };
