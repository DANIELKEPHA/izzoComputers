import express from "express";
import {
    getAdverts,
    createAdvert,
    updateAdvert,
    deleteAdvert
} from "../controllers/advertController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", getAdverts);

router.post(
    "/",
    authMiddleware(["admin"]),
    createAdvert
);

router.patch(
    "/:id",
    authMiddleware(["admin"]),
    updateAdvert
);

router.delete(
    "/:id",
    authMiddleware(["admin"]),
    deleteAdvert
);

export default router;
