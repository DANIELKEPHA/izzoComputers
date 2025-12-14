import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { wktToGeoJSON } from "@terraformer/wkt";

const prisma = new PrismaClient();

export const getAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { cognitoId } = req.params;
    const admin = await prisma.admin.findUnique({
      where: { cognitoId },
    });

    if (admin) {
      res.json(admin);
    } else {
      res.status(404).json({ message: "Admin not found" });
    }
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving admin: ${error.message}` });
  }
};

const LOG = console.log.bind(console, "[BACKEND]");

export const createAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
        LOG("createAdmin request", req.body);
        const { cognitoId, name, email, phoneNumber } = req.body;

        const admin = await prisma.admin.create({
            data: { cognitoId, name, email, phoneNumber },
        });

        LOG("Admin created in DB", admin);
        res.status(201).json(admin);
    } catch (error: any) {
        LOG("createAdmin ERROR", error);
        res.status(500).json({ message: `Error creating admin: ${error.message}` });
    }
};

export const updateAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { cognitoId } = req.params;
    const { name, email, phoneNumber } = req.body;

    const updateAdmin = await prisma.admin.update({
      where: { cognitoId },
      data: {
        name,
        email,
        phoneNumber,
      },
    });

    res.json(updateAdmin);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error updating admin: ${error.message}` });
  }
};
