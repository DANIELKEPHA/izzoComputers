import express from "express";
import {
    getProduct,
    getProducts,
    createProduct,
    deleteProduct, // ← New import
    getCategories,
    createCategory, updateProduct,
} from "../controllers/productControllers";
import multer from "multer";
import { authMiddleware } from "../middleware/authMiddleware";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

// === Categories ===
router.get("/categories", getCategories);
router.post("/categories", authMiddleware(["admin"]), createCategory);

// === Products ===
// Specific routes first
router.get("/", getProducts);
router.get("/:id", getProduct);

// Protected admin routes
router.post(
    "/",
    authMiddleware(["admin"]),
    upload.array("images"),
    createProduct
);

router.delete(
    "/:id",
    authMiddleware(["admin"]),
    deleteProduct
);

router.patch(
    "/:id",
    authMiddleware(["admin"]),
    upload.array("images"),
    updateProduct
);

export default router;