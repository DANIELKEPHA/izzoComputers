import { Request, Response } from "express";
import {Prisma, PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

export const getCart = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id; // Cognito sub (string UUID)

        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const cart = await prisma.cart.findUnique({
            where: { userId }, // ← String, no Number()
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                                price: true,
                                imageUrl: true,
                                imageUrls: true,
                                stock: true,
                                discountPercent: true,
                                warranty: true,
                            },
                        },
                    },
                    orderBy: { id: "asc" },
                },
            },
        });

        if (!cart) {
            res.status(200).json({
                cart: { id: null, userId, items: [] },
                totalItems: 0,
                totalPrice: 0,
            });
            return;
        }

        const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

        const totalPrice = cart.items.reduce((sum, item) => {
            const price = item.product.price.toNumber();
            const discount = item.product.discountPercent || 0;
            const discountedPrice = discount > 0 ? price * (1 - discount / 100) : price;
            return sum + discountedPrice * item.quantity;
        }, 0);

        res.status(200).json({
            cart,
            totalItems,
            totalPrice: new Prisma.Decimal(totalPrice),
        });
    } catch (error: any) {
        console.error("getCart error:", error);
        res.status(500).json({ message: "Failed to fetch cart" });
    }
};

export const addToCart = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id;

        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const { productId, quantity = 1 } = req.body;

        if (!productId || !Number.isInteger(Number(productId)) || Number(productId) <= 0) {
            res.status(400).json({ message: "Valid productId is required" });
            return;
        }

        if (!Number.isInteger(quantity) || quantity < 1) {
            res.status(400).json({ message: "Quantity must be a positive integer" });
            return;
        }

        const product = await prisma.product.findUnique({
            where: { id: Number(productId) },
            select: { id: true, stock: true },
        });

        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }

        if (product.stock < quantity) {
            res.status(400).json({
                message: `Only ${product.stock} item(s) in stock`,
                availableStock: product.stock,
            });
            return;
        }

        // Get or create cart
        let cart = await prisma.cart.findUnique({
            where: { userId },
            include: { items: true },
        });

        if (!cart) {
            cart = await prisma.cart.create({
                data: { userId }, // ← String
                include: { items: true },
            });
        }

        const existingItem = cart.items.find((item) => item.productId === Number(productId));

        let cartItem;

        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;

            if (newQuantity > product.stock) {
                res.status(400).json({
                    message: `Cannot add more — only ${product.stock} in stock`,
                });
                return;
            }

            cartItem = await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: newQuantity },
                include: { product: true },
            });
        } else {
            cartItem = await prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId: Number(productId),
                    quantity,
                },
                include: { product: true },
            });
        }

        res.status(200).json({ message: "Item added to cart", cartItem });
    } catch (error: any) {
        console.error("addToCart error:", error);
        if (error.code === "P2003") {
            res.status(400).json({ message: "Invalid product reference" });
            return;
        }
        res.status(500).json({ message: "Failed to add item to cart" });
    }
};

export const updateCartItem = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id;

        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const { productId } = req.params;
        const { quantity } = req.body;

        if (!Number.isInteger(Number(productId)) || Number(productId) <= 0) {
            res.status(400).json({ message: "Valid productId is required" });
            return;
        }

        if (!Number.isInteger(quantity) || quantity < 0) {
            res.status(400).json({ message: "Quantity must be a non-negative integer" });
            return;
        }

        const cart = await prisma.cart.findUnique({
            where: { userId },
            include: { items: true },
        });

        if (!cart) {
            res.status(404).json({ message: "Cart not found" });
            return;
        }

        const cartItem = cart.items.find((item) => item.productId === Number(productId));

        if (!cartItem) {
            res.status(404).json({ message: "Item not in cart" });
            return;
        }

        if (quantity === 0) {
            await prisma.cartItem.delete({ where: { id: cartItem.id } });
            res.status(200).json({ message: "Item removed from cart" });
            return;
        }

        const product = await prisma.product.findUnique({
            where: { id: Number(productId) },
            select: { stock: true },
        });

        if (!product || quantity > product.stock) {
            res.status(400).json({
                message: `Only ${product?.stock ?? 0} in stock`,
                availableStock: product?.stock,
            });
            return;
        }

        const updatedItem = await prisma.cartItem.update({
            where: { id: cartItem.id },
            data: { quantity },
            include: { product: true },
        });

        res.status(200).json({ message: "Cart item updated", cartItem: updatedItem });
    } catch (error: any) {
        console.error("updateCartItem error:", error);
        res.status(500).json({ message: "Failed to update cart item" });
    }
};

export const removeFromCart = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id;

        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const { productId } = req.params;

        if (!Number.isInteger(Number(productId)) || Number(productId) <= 0) {
            res.status(400).json({ message: "Valid productId is required" });
            return;
        }

        const cart = await prisma.cart.findUnique({
            where: { userId },
            include: { items: true },
        });

        if (!cart) {
            res.status(404).json({ message: "Cart not found" });
            return;
        }

        const cartItem = cart.items.find((item) => item.productId === Number(productId));

        if (!cartItem) {
            res.status(404).json({ message: "Item not in cart" });
            return;
        }

        await prisma.cartItem.delete({ where: { id: cartItem.id } });

        res.status(200).json({ message: "Item removed from cart" });
    } catch (error: any) {
        console.error("removeFromCart error:", error);
        res.status(500).json({ message: "Failed to remove item from cart" });
    }
};

export const clearCart = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id;

        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const cart = await prisma.cart.findUnique({
            where: { userId },
        });

        if (!cart) {
            res.status(404).json({ message: "Cart not found" });
            return;
        }

        await prisma.cartItem.deleteMany({
            where: { cartId: cart.id },
        });

        res.status(200).json({ message: "Cart cleared successfully" });
    } catch (error: any) {
        console.error("clearCart error:", error);
        res.status(500).json({ message: "Failed to clear cart" });
    }
};

export const syncGuestCart = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const { guestCart } = req.body; // Array of { productId: number, quantity: number }

        if (!Array.isArray(guestCart)) {
            res.status(400).json({ message: "Invalid guest cart data" });
            return;
        }

        // Get or create user's cart
        let cart = await prisma.cart.findUnique({
            where: { userId },
            include: { items: true },
        });

        if (!cart) {
            cart = await prisma.cart.create({
                data: { userId },
                include: { items: true },
            });
        }

        // Merge guest cart
        for (const guestItem of guestCart) {
            if (!Number.isInteger(guestItem.productId) || guestItem.quantity < 1) continue;

            const product = await prisma.product.findUnique({
                where: { id: guestItem.productId },
                select: { stock: true },
            });

            if (!product || product.stock < guestItem.quantity) continue;

            const existing = cart.items.find((i) => i.productId === guestItem.productId);

            if (existing) {
                await prisma.cartItem.update({
                    where: { id: existing.id },
                    data: { quantity: existing.quantity + guestItem.quantity },
                });
            } else {
                await prisma.cartItem.create({
                    data: {
                        cartId: cart.id,
                        productId: guestItem.productId,
                        quantity: guestItem.quantity,
                    },
                });
            }
        }

        res.status(200).json({ message: "Guest cart synced successfully" });
    } catch (error) {
        console.error("syncGuestCart error:", error);
        res.status(500).json({ message: "Failed to sync cart" });
    }
};