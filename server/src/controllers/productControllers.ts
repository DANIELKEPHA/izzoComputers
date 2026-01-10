import { Request, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import {DeleteObjectCommand, GetObjectCommand, S3Client} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

const prisma = new PrismaClient();
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
});

export const createCategory = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { name, slug } = req.body;
        const file = req.file as Express.Multer.File | undefined; // Single file for cover

        // Validate required name
        if (!name || typeof name !== "string") {
            res.status(400).json({ message: "Category name is required and must be a string" });
            return;
        }

        const trimmedName = name.trim();
        if (trimmedName.length < 2 || trimmedName.length > 50) {
            res.status(400).json({ message: "Category name must be between 2 and 50 characters" });
            return;
        }

        // Generate or sanitize slug
        let finalSlug: string;
        if (slug) {
            if (typeof slug !== "string") {
                res.status(400).json({ message: "Slug must be a string if provided" });
                return;
            }
            finalSlug = slug.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
            if (finalSlug.length < 2) {
                res.status(400).json({ message: "Slug too short after sanitization" });
                return;
            }
        } else {
            finalSlug = trimmedName
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^a-z0-9-]/g, "")
                .replace(/-+/g, "-")
                .replace(/^-|-$/g, "");
        }

        if (finalSlug.length > 100) {
            res.status(400).json({ message: "Slug too long" });
            return;
        }

        // Check uniqueness
        const [existingByName, existingBySlug] = await Promise.all([
            prisma.category.findFirst({
                where: { name: { equals: trimmedName, mode: "insensitive" } },
            }),
            prisma.category.findUnique({ where: { slug: finalSlug } }),
        ]);

        if (existingByName) {
            res.status(409).json({ message: `Category "${trimmedName}" already exists` });
            return;
        }
        if (existingBySlug) {
            res.status(409).json({ message: `Slug "${finalSlug}" already in use` });
            return;
        }

        // Upload cover image if provided
        let coverImageUrl: string | null = null;
        if (file) {
            const key = `categories/${Date.now()}-${Math.random().toString(36).substring(7)}-${file.originalname}`;
            const uploadParams = {
                Bucket: process.env.S3_BUCKET_NAME!,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
            };

            try {
                const result = await new Upload({ client: s3Client, params: uploadParams }).done();
                coverImageUrl = result.Location as string;
            } catch (uploadError) {
                console.error("Failed to upload cover image:", uploadError);
                res.status(500).json({ message: "Failed to upload cover image" });
                return;
            }
        }

        // Create category
        const category = await prisma.category.create({
            data: {
                name: trimmedName,
                slug: finalSlug,
                coverImageUrl,
            },
            select: {
                id: true,
                name: true,
                slug: true,
                coverImageUrl: true,
            },
        });

        res.status(201).json({
            message: "Category created successfully",
            category,
        });
    } catch (error: any) {
        console.error("Error creating category:", error);
        if (error.code === "P2002") {
            res.status(409).json({ message: "Name or slug already exists" });
            return;
        }
        res.status(500).json({ message: "Failed to create category" });
    }
};

export const getCategories = async (req: Request, res: Response): Promise<void> => {
    try {
        const categories = await prisma.category.findMany({
            select: {
                id: true,
                name: true,
                slug: true,
                coverImageUrl: true,
            },
            orderBy: { name: "asc" },
        });

        // Just return as-is — no signing needed if objects are public
        res.json(categories);
    } catch (error: any) {
        console.error("getCategories error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getCategoriesWithCount = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const categories = await prisma.category.findMany({
            select: {
                id: true,
                name: true,
                slug: true,
                coverImageUrl: true,
                _count: { select: { products: true } },
            },
            orderBy: { name: "asc" },
        });

        const formatted = categories.map((cat) => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            coverImageUrl: cat.coverImageUrl,
            productCount: cat._count.products,
        }));

        res.json(formatted);
    } catch (error: any) {
        console.error("getCategoriesWithCount error:", error);
        res.status(500).json({ message: "Failed to fetch categories" });
    }
};

export const updateCategory = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;
        if (!id || isNaN(Number(id))) {
            res.status(400).json({ message: "Valid category ID required" });
            return;
        }
        const categoryId = Number(id);

        const { name, slug } = req.body;
        const file = req.file as Express.Multer.File | undefined;
        const { keepCoverImage } = req.body; // "true" to keep existing image

        const existing = await prisma.category.findUnique({
            where: { id: categoryId },
            select: { id: true, name: true, slug: true, coverImageUrl: true },
        });

        if (!existing) {
            res.status(404).json({ message: "Category not found" });
            return;
        }

        // Prepare data
        let data: Prisma.CategoryUpdateInput = {};

        if (name) {
            const trimmed = name.trim();
            if (trimmed.length < 2 || trimmed.length > 50) {
                res.status(400).json({ message: "Name must be 2–50 characters" });
                return;
            }
            if (trimmed.toLowerCase() !== existing.name.toLowerCase()) {
                const nameTaken = await prisma.category.findFirst({
                    where: { name: { equals: trimmed, mode: "insensitive" }, id: { not: categoryId } },
                });
                if (nameTaken) {
                    res.status(409).json({ message: "Category name already exists" });
                    return;
                }
            }
            data.name = trimmed;
        }

        if (slug) {
            const sanitized = slug.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
            if (sanitized !== existing.slug) {
                const slugTaken = await prisma.category.findUnique({ where: { slug: sanitized } });
                if (slugTaken && slugTaken.id !== categoryId) {
                    res.status(409).json({ message: "Slug already in use" });
                    return;
                }
            }
            data.slug = sanitized;
        }

        // Handle cover image update
        let newCoverImageUrl: string | null = existing.coverImageUrl;

        if (file) {
            // New image uploaded → replace old one
            const key = `categories/${Date.now()}-${Math.random().toString(36).substring(7)}-${file.originalname}`;
            const uploadParams = {
                Bucket: process.env.S3_BUCKET_NAME!,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
            };

            const result = await new Upload({ client: s3Client, params: uploadParams }).done();
            newCoverImageUrl = result.Location as string;

            // Delete old image if exists and not keeping it
            if (existing.coverImageUrl) {
                try {
                    const urlObj = new URL(existing.coverImageUrl);
                    const Key = urlObj.pathname.slice(1);
                    await s3Client.send(new DeleteObjectCommand({
                        Bucket: process.env.S3_BUCKET_NAME!,
                        Key,
                    }));
                    console.log("Deleted old category cover image:", Key);
                } catch (err) {
                    console.error("Failed to delete old cover image:", err);
                    // Continue anyway
                }
            }
        } else if (keepCoverImage === "false" && existing.coverImageUrl) {
            // Explicitly remove cover image
            try {
                const urlObj = new URL(existing.coverImageUrl);
                const Key = urlObj.pathname.slice(1);
                await s3Client.send(new DeleteObjectCommand({
                    Bucket: process.env.S3_BUCKET_NAME!,
                    Key,
                }));
            } catch (err) {
                console.error("Failed to delete cover image:", err);
            }
            newCoverImageUrl = null;
        }

        data.coverImageUrl = newCoverImageUrl;

        // Update in DB
        const updated = await prisma.category.update({
            where: { id: categoryId },
            data,
            select: { id: true, name: true, slug: true, coverImageUrl: true },
        });

        res.json({
            message: "Category updated successfully",
            category: updated,
        });
    } catch (error: any) {
        console.error("updateCategory error:", error);
        if (error.code === "P2025") {
            res.status(404).json({ message: "Category not found" });
            return;
        }
        if (error.code === "P2002") {
            res.status(409).json({ message: "Name or slug already exists" });
            return;
        }
        res.status(500).json({ message: "Failed to update category" });
    }
};

export const deleteCategory = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;
        if (!id || isNaN(Number(id))) {
            res.status(400).json({ message: "Valid category ID required" });
            return;
        }
        const categoryId = Number(id);

        const category = await prisma.category.findUnique({
            where: { id: categoryId },
            select: { id: true, coverImageUrl: true, products: { select: { id: true } } },
        });

        if (!category) {
            res.status(404).json({ message: "Category not found" });
            return;
        }

        // Optional: Prevent deletion if has products
        if (category.products.length > 0) {
            res.status(400).json({
                message: `Cannot delete category with ${category.products.length} products. Reassign or delete products first.`,
            });
            return;
        }

        // Delete cover image from S3 if exists
        if (category.coverImageUrl) {
            try {
                const urlObj = new URL(category.coverImageUrl);
                const Key = urlObj.pathname.slice(1);
                await s3Client.send(new DeleteObjectCommand({
                    Bucket: process.env.S3_BUCKET_NAME!,
                    Key,
                }));
                console.log("Deleted category cover image:", Key);
            } catch (err) {
                console.error("Failed to delete cover image from S3:", err);
                // Continue with DB deletion
            }
        }

        await prisma.category.delete({ where: { id: categoryId } });

        res.json({ message: "Category deleted successfully" });
    } catch (error: any) {
        console.error("deleteCategory error:", error);
        if (error.code === "P2025") {
            res.status(404).json({ message: "Category not found" });
            return;
        }
        res.status(500).json({ message: "Failed to delete category" });
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

        // Fetch the main product + related products in parallel
        const [product, relatedProducts] = await Promise.all([
            prisma.product.findUnique({
                where: { id: productId },
                include: {
                    category: {
                        select: { id: true, name: true },
                    },
                },
            }),

            // First get the categoryId of the current product efficiently
            prisma.product.findUnique({
                where: { id: productId },
                select: { categoryId: true },
            }).then(async (current) => {
                if (!current) return [];

                return prisma.product.findMany({
                    where: {
                        categoryId: current.categoryId,
                        id: { not: productId },        // Exclude current product
                        stock: { gt: 0 },               // Optional: only in-stock
                    },
                    include: {
                        category: {
                            select: { id: true, name: true },
                        },
                    },
                    orderBy: [
                        { averageRating: "desc" },       // Prioritize higher rated
                        { createdAt: "desc" },           // Then newest
                    ],
                    take: 8,                           // Limit related products
                });
            }),
        ]);

        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }

        res.status(200).json({
            product,
            relatedProducts: relatedProducts || [],
        });
    } catch (err: any) {
        console.error("getProduct error:", err);
        res.status(500).json({ message: "Server error" });
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

export const getFeaturedProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const limit = 4; // Always return up to 4 for hero section

        const featuredProducts = await prisma.product.findMany({
            where: {
                stock: { gt: 0 },              // In stock
                discountPercent: { gt: 0 },    // Has some discount (optional but recommended)
                averageRating: { gte: 4.0 },    // Well-rated
                reviewCount: { gte: 3 },       // Some reviews for credibility
            },
            include: {
                category: {
                    select: { id: true, name: true },
                },
            },
            orderBy: [
                { discountPercent: "desc" },     // Bigger discounts first
                { averageRating: "desc" },       // Then highest rated
                { reviewCount: "desc" },         // More reviews = more popular
                { createdAt: "desc" },           // Newest as tiebreaker
            ],
            take: limit,
        });

        // Optional fallback: if less than 4 with discount, fill with top-rated in-stock products
        if (featuredProducts.length < limit) {
            const fallbackCount = limit - featuredProducts.length;

            const fallbackProducts = await prisma.product.findMany({
                where: {
                    id: { notIn: featuredProducts.map(p => p.id) }, // Avoid duplicates
                    stock: { gt: 0 },
                    averageRating: { gte: 4.2 },
                },
                include: {
                    category: { select: { id: true, name: true } },
                },
                orderBy: [
                    { averageRating: "desc" },
                    { reviewCount: "desc" },
                ],
                take: fallbackCount,
            });

            const finalProducts = [...featuredProducts, ...fallbackProducts];

            res.json(finalProducts);
            return;
        }

        res.json(featuredProducts);
    } catch (error: any) {
        console.error("getFeaturedProducts error:", error);
        res.status(500).json({ message: "Failed to fetch featured products" });
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