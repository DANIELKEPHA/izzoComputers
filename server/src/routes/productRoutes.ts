import express from "express";
import {
    getProduct,
    getProducts,
    createProduct,
    deleteProduct,
    getCategories,
    getCategoriesWithCount,
    createCategory,
    updateCategory,
    deleteCategory,
    updateProduct,
    getFeaturedProducts,
} from "../controllers/productControllers";

import multer from "multer";
import { authMiddleware } from "../middleware/authMiddleware";

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Separate upload for single cover image (categories)
const uploadCoverImage = upload.single("coverImage");

const router = express.Router();

// === Categories ===
router.get("/categories", getCategories);
router.get("/categories/with-count", getCategoriesWithCount);

// Admin-only category routes
router.post("/categories", authMiddleware(["admin"]), uploadCoverImage, createCategory);
router.patch("/categories/:id", authMiddleware(["admin"]), uploadCoverImage, updateCategory);
router.delete("/categories/:id", authMiddleware(["admin"]), deleteCategory);

// Featured products (public)
router.get("/featured", getFeaturedProducts);

// === Products ===
router.get("/", getProducts);
router.get("/:id", getProduct);

// Admin-only product routes
router.post(
    "/",
    authMiddleware(["admin"]),
    upload.array("images"),
    createProduct
);

router.patch(
    "/:id",
    authMiddleware(["admin"]),
    upload.array("images"),
    updateProduct
);

router.delete("/:id", authMiddleware(["admin"]), deleteProduct);

export default router;