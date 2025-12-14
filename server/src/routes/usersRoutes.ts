import express from "express";
import {
    createuser,
    getUser, updateUser,
} from "../controllers/usersController";

const router = express.Router();

router.get("/:cognitoId", getUser);
router.put("/:cognitoId", updateUser);
router.post("/", createuser);

export default router;
