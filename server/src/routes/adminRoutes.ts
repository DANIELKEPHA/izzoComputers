import express from "express";
import {
    getAdmin,
    createAdmin,
    updateAdmin,
} from "../controllers/adminControllers";

const router = express.Router();

router.get("/:cognitoId", getAdmin);
router.put("/:cognitoId", updateAdmin);
router.post("/", createAdmin);

export default router;
