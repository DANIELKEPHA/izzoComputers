import { Request, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import {DeleteObjectCommand, S3Client} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

const prisma = new PrismaClient();
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
});

export const getCategories = async (req: Request, res: Response): Promise<void> => {

    try {
        const categories = await prisma.category.findMany({
            select: { id: true, name: true },
            orderBy: { name: "asc" },
        });

        res.json(categories);
    } catch (error: any) {
        console.error("getCategories error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const { categoryId, priceMin, priceMax, inStock, search, page = 1, pageSize = 20 } = req.query;

        const where: Prisma.ProductWhereInput = {};

        if (categoryId) where.categoryId = Number(categoryId);
        if (priceMin || priceMax) {
            where.price = {};
            if (priceMin) where.price.gte = new Prisma.Decimal(priceMin as string);
            if (priceMax) where.price.lte = new Prisma.Decimal(priceMax as string);
        }
        if (inStock === "true") where.stock = { gt: 0 };
        if (search) {
            where.OR = [
                { name: { contains: search as string, mode: "insensitive" } },
                { description: { contains: search as string, mode: "insensitive" } },
            ];
        }

        const skip = (Number(page) - 1) * Number(pageSize);
        const take = Number(pageSize);

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                include: { category: true },
                orderBy: { createdAt: "desc" },
                skip,
                take,
            }),
            prisma.product.count({ where }),
        ]);

        res.json({ products, total });
    } catch (error: any) {
        console.error("getProducts error:", error);
        res.status(500).json({ message: `Error retrieving products: ${error.message}` });
    }
};

export const getProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        if (!id || isNaN(Number(id))) {
            res.status(400).json({ message: "Valid product ID is required" });
            return;
        }

        const productId = Number(id);

        const product = await prisma.product.findUnique({
            where: { id: productId },
            include: { category: true },
        });

        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }

        res.json(product);
    } catch (err: any) {
        console.error("getProduct error:", err);
        res.status(500).json({ message: `Error retrieving product: ${err.message}` });
    }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const files = req.files as Express.Multer.File[];
        const {
            name,
            description,
            price,
            stock,
            categoryId,
            specs: specsJson,
            averageRating,
            reviewCount,
            discountPercent,
            warranty,
        } = req.body;

        // === 1. Validate required fields ===
        if (!name || !price || !stock || !categoryId) {
            res.status(400).json({
                message: "Name, price, stock, and category are required",
            });
            return;
        }

        // === 2. Upload images to S3 ===
        let imageUrls: string[] = [];
        if (files && files.length > 0) {
            const uploadedUrls = await Promise.all(
                files.map(async (file) => {
                    const uploadParams = {
                        Bucket: process.env.S3_BUCKET_NAME!,
                        Key: `products/${Date.now()}-${Math.random().toString(36).substring(7)}-${file.originalname}`,
                        Body: file.buffer,
                        ContentType: file.mimetype,
                    };
                    try {
                        const uploadResult = await new Upload({
                            client: s3Client,
                            params: uploadParams,
                        }).done();
                        return uploadResult.Location as string;
                    } catch (uploadError) {
                        console.error(`Failed to upload ${file.originalname}:`, uploadError);
                        return null;
                    }
                })
            );
            imageUrls = uploadedUrls.filter((url): url is string => url !== null);
        }

        // === 3. Parse and validate dynamic specs ===
        let specs: { key: string; value: string }[] | undefined = undefined;
        if (specsJson) {
            try {
                const parsed = JSON.parse(specsJson);
                if (Array.isArray(parsed)) {
                    specs = parsed
                        .map((item: any) => ({
                            key: item.key?.trim(),
                            value: item.value?.trim(),
                        }))
                        .filter(
                            (item): item is { key: string; value: string } =>
                                !!item.key && !!item.value
                        );
                }
            } catch (e) {
                console.warn("Invalid specs JSON received:", specsJson);
            }
        }

        // === 4. Create product in database ===
        const product = await prisma.product.create({
            data: {
                name: name.trim(),
                slug: name
                    .toLowerCase()
                    .replace(/\s+/g, "-")
                    .replace(/[^a-z0-9-]/g, ""),
                description: description?.trim() || null,
                price: new Prisma.Decimal(price),
                stock: Number(stock),
                categoryId: Number(categoryId),
                imageUrl: imageUrls[0] || null,
                imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
                specs: specs && specs.length > 0 ? specs : undefined,

                averageRating: averageRating
                    ? new Prisma.Decimal(averageRating)
                    : undefined,
                reviewCount: reviewCount ? Number(reviewCount) : undefined,
                discountPercent: discountPercent
                    ? Number(discountPercent)
                    : undefined,
                warranty: warranty?.trim() || undefined,
            },
            include: {
                category: {
                    select: { id: true, name: true },
                },
            },
        });

        // === 5. Success response ===
        res.status(201).json({
            message: "Product created successfully",
            product,
        });
    } catch (err: any) {
        console.error("Error creating product:", err);
        if (err.code === "P2002") {
            res.status(409).json({
                message: "A product with this name or slug already exists",
            });
            return;
        }
        if (err.code === "P2003") {
            res.status(400).json({ message: "Invalid category ID" });
            return;
        }
        res.status(500).json({ message: "Failed to create product. Please try again." });
    }
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name } = req.body;

        // Validate input
        if (!name || typeof name !== "string") {
            res.status(400).json({
                message: "Category name is required and must be a string",
            });
            return;
        }

        const trimmedName = name.trim();

        if (trimmedName.length < 2) {
            res.status(400).json({
                message: "Category name must be at least 2 characters long",
            });
            return;
        }

        if (trimmedName.length > 50) {
            res.status(400).json({
                message: "Category name cannot exceed 50 characters",
            });
            return;
        }

        // Check for duplicate (case-insensitive)
        const existingCategory = await prisma.category.findFirst({
            where: {
                name: {
                    equals: trimmedName,
                    mode: "insensitive", // Handles "laptops" vs "Laptops"
                },
            },
        });

        if (existingCategory) {
            res.status(409).json({
                message: `Category "${trimmedName}" already exists`,
            });
            return;
        }

        // Create the category
        const category = await prisma.category.create({
            data: {
                name: trimmedName,
            },
            select: {
                id: true,
                name: true,
            },
        });

        res.status(201).json({
            message: "Category created successfully",
            category,
        });
    } catch (error: any) {
        console.error("Error creating category:", error);

        // Handle Prisma unique constraint error gracefully (just in case)
        if (error.code === "P2002") {
            res.status(409).json({
                message: "A category with this name already exists",
            });
            return;
        }

        res.status(500).json({
            message: "Failed to create category. Please try again later.",
        });
    }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        if (!id || isNaN(Number(id))) {
            res.status(400).json({ message: "Valid product ID is required" });
            return;
        }

        const productId = Number(id);

        // 1. Fetch the product with image URLs (we need them to delete from S3)
        const product = await prisma.product.findUnique({
            where: { id: productId },
            select: {
                id: true,
                imageUrl: true,
                imageUrls: true,
            },
        });

        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }

        // 2. Collect all unique image URLs to delete
        const urlsToDelete = new Set<string>();

        if (product.imageUrl) {
            urlsToDelete.add(product.imageUrl);
        }
        if (product.imageUrls && product.imageUrls.length > 0) {
            product.imageUrls.forEach((url) => url && urlsToDelete.add(url));
        }

        // 3. Delete images from S3 in parallel (fire-and-forget if one fails → still delete DB record)
        if (urlsToDelete.size > 0) {
            const deletePromises = Array.from(urlsToDelete).map(async (url) => {
                try {
                    // Extract key from full S3 URL
                    const urlObj = new URL(url);
                    const Key = urlObj.pathname.startsWith("/") ? urlObj.pathname.slice(1) : urlObj.pathname;

                    await s3Client.send(
                        new DeleteObjectCommand({
                            Bucket: process.env.S3_BUCKET_NAME!,
                            Key,
                        })
                    );
                    console.log(`Deleted from S3: ${Key}`);
                } catch (s3Error) {
                    // Log but don't fail the whole deletion
                    console.error(`Failed to delete S3 object ${url}:`, s3Error);
                }
            });

            await Promise.allSettled(deletePromises);
        }

        // 4. Finally delete the product from database
        await prisma.product.delete({
            where: { id: productId },
        });

        res.status(200).json({
            message: "Product deleted successfully",
            deletedProductId: productId,
        });
    } catch (err: any) {
        console.error("deleteProduct error:", err);

        // Handle foreign key or Prisma-specific errors gracefully
        if (err.code === "P2025") {
            // Record to delete not found (already deleted?)
            res.status(404).json({ message: "Product not found" });
            return;
        }

        res.status(500).json({ message: "Failed to delete product" });
    }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        if (!id || isNaN(Number(id))) {
            res.status(400).json({ message: "Valid product ID is required" });
            return;
        }
        const productId = Number(id);

        const files = req.files as Express.Multer.File[] | undefined;
        const {
            name,
            description,
            price,
            stock,
            categoryId,
            specs: specsJson,
            keepImageUrls: keepImageUrlsJson,
            averageRating,
            reviewCount,
            discountPercent,
            warranty,
        } = req.body;

        // 1. Find existing product
        const existingProduct = await prisma.product.findUnique({
            where: { id: productId },
            select: { id: true, imageUrl: true, imageUrls: true },
        });
        if (!existingProduct) {
            res.status(404).json({ message: "Product not found" });
            return;
        }

        // 2. Parse kept image URLs
        let keepImageUrls: string[] = [];
        if (keepImageUrlsJson) {
            try {
                const parsed = JSON.parse(keepImageUrlsJson);
                if (Array.isArray(parsed)) {
                    keepImageUrls = parsed.filter(
                        (url: any) => typeof url === "string" && url.startsWith("https://")
                    );
                }
            } catch (e) {
                console.warn("Invalid keepImageUrls JSON");
            }
        }

        // 3. Determine images to delete
        const currentUrls = new Set([
            existingProduct.imageUrl || "",
            ...(existingProduct.imageUrls || []),
        ].filter(Boolean));
        const urlsToDelete = Array.from(currentUrls).filter(
            (url) => !keepImageUrls.includes(url)
        );

        // 4. Upload new images
        let newImageUrls: string[] = [];
        if (files && files.length > 0) {
            const uploadResults = await Promise.all(
                files.map(async (file) => {
                    const key = `products/${Date.now()}-${Math.random().toString(36).substring(7)}-${file.originalname}`;
                    const uploadParams = {
                        Bucket: process.env.S3_BUCKET_NAME!,
                        Key: key,
                        Body: file.buffer,
                        ContentType: file.mimetype,
                    };
                    try {
                        const result = await new Upload({
                            client: s3Client,
                            params: uploadParams,
                        }).done();
                        return result.Location as string;
                    } catch (uploadError) {
                        console.error(`Failed to upload ${file.originalname}:`, uploadError);
                        return null;
                    }
                })
            );
            newImageUrls = uploadResults.filter((url): url is string => !!url);
        }

        // 5. Final image list
        const finalImageUrls = [...keepImageUrls, ...newImageUrls];
        const finalPrimaryImageUrl = finalImageUrls[0] || null;

        // 6. Parse specs
        let specs: { key: string; value: string }[] | undefined = undefined;
        if (specsJson && specsJson !== "null" && specsJson !== "undefined") {
            try {
                const parsed = JSON.parse(specsJson);
                if (Array.isArray(parsed)) {
                    specs = parsed
                        .map((item: any) => ({
                            key: item.key?.trim(),
                            value: item.value?.trim(),
                        }))
                        .filter(
                            (item): item is { key: string; value: string } =>
                                !!item.key && !!item.value
                        );
                }
            } catch (e) {
                console.warn("Invalid specs JSON on update");
            }
        }

        // 7. Update product in DB
        const updatedProduct = await prisma.product.update({
            where: { id: productId },
            data: {
                ...(name && { name: name.trim() }),
                ...(name && {
                    slug: name
                        .toLowerCase()
                        .replace(/\s+/g, "-")
                        .replace(/[^a-z0-9-]/g, ""),
                }),
                ...(description !== undefined && {
                    description: description?.trim() || null,
                }),
                ...(price && { price: new Prisma.Decimal(price) }),
                ...(stock !== undefined && { stock: Number(stock) }),
                ...(categoryId && { categoryId: Number(categoryId) }),
                imageUrl: finalPrimaryImageUrl,
                imageUrls: finalImageUrls.length > 0 ? finalImageUrls : undefined,
                specs: specs && specs.length > 0 ? specs : undefined,

                // Update new dynamic fields only if provided
                ...(averageRating !== undefined && {
                    averageRating: averageRating
                        ? new Prisma.Decimal(averageRating)
                        : null,
                }),
                ...(reviewCount !== undefined && {
                    reviewCount: reviewCount ? Number(reviewCount) : null,
                }),
                ...(discountPercent !== undefined && {
                    discountPercent: discountPercent ? Number(discountPercent) : null,
                }),
                ...(warranty !== undefined && {
                    warranty: warranty?.trim() || null,
                }),
            },
            include: {
                category: { select: { id: true, name: true } },
            },
        });

        // 8. Delete removed images from S3
        if (urlsToDelete.length > 0) {
            const deletePromises = urlsToDelete.map(async (url) => {
                try {
                    const urlObj = new URL(url);
                    const Key = urlObj.pathname.slice(1);
                    await s3Client.send(
                        new DeleteObjectCommand({
                            Bucket: process.env.S3_BUCKET_NAME!,
                            Key,
                        })
                    );
                    console.log(`Deleted old image: ${Key}`);
                } catch (err) {
                    console.error(`Failed to delete S3 object ${url}:`, err);
                }
            });
            await Promise.allSettled(deletePromises);
        }

        res.json({
            message: "Product updated successfully",
            product: updatedProduct,
        });
    } catch (err: any) {
        console.error("updateProduct error:", err);
        if (err.code === "P2025") {
            res.status(404).json({ message: "Product not found" });
            return;
        }
        if (err.code === "P2002") {
            res.status(409).json({ message: "Product name/slug already exists" });
            return;
        }
        if (err.code === "P2003") {
            res.status(400).json({ message: "Invalid category ID" });
            return;
        }
        res.status(500).json({ message: "Failed to update product" });
    }
};