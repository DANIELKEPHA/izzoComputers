import express from "express";
import {
    getCounties,
    getTownsByCounty,
    getMyDeliveryLocation,
    saveMyDeliveryLocation,
    deleteMyDeliveryLocation,
} from "../controllers/deliveryLocationController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

// === Public routes ===
router.get("/counties", getCounties);
router.get("/counties/:countyId/towns", getTownsByCounty);

// === Authenticated user routes ===
router.get(
    "/me",
    authMiddleware(["user", "admin"]),
    getMyDeliveryLocation
);

router.post(
    "/me",
    authMiddleware(["user", "admin"]),
    saveMyDeliveryLocation
);

router.delete(
    "/me",
    authMiddleware(["user", "admin"]),
    deleteMyDeliveryLocation
);

export default router;
