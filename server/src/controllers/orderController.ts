import { Request, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export const createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id; // Cognito sub (string UUID)
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const {
            paymentMethod,
            address,
            phone,
            name,
            city,
            notes,
        } = req.body;

        // === Validation ===

        if (!paymentMethod || typeof paymentMethod !== "string") {
            res.status(400).json({ message: "Payment method is required" });
            return;
        }

        const validPaymentMethods = ["mpesa", "card", "cash_on_delivery"];
        if (!validPaymentMethods.includes(paymentMethod.toLowerCase())) {
            res.status(400).json({
                message: "Invalid payment method. Choose mpesa, card, or cash_on_delivery",
            });
            return;
        }

        if (!name || typeof name !== "string" || name.trim().length < 2) {
            res.status(400).json({ message: "Full name is required" });
            return;
        }

        if (!phone || typeof phone !== "string" || !/^\+?[\d\s-]{10,15}$/.test(phone.trim())) {
            res.status(400).json({ message: "Valid phone number is required" });
            return;
        }

        if (!address || typeof address !== "string" || address.trim().length < 5) {
            res.status(400).json({ message: "Valid delivery address is required" });
            return;
        }

        if (!city || typeof city !== "string" || city.trim().length < 2) {
            res.status(400).json({ message: "City/town is required" });
            return;
        }

        // Notes are optional — just trim if provided

        // === Fetch cart ===
        const cart = await prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                price: true,
                                stock: true,
                                discountPercent: true,
                            },
                        },
                    },
                },
            },
        });

        if (!cart || cart.items.length === 0) {
            res.status(400).json({ message: "Your cart is empty" });
            return;
        }

        // === Calculate totals and prepare order items ===
        let orderTotal = 0;
        const orderItemsData: Array<{
            productId: number;
            quantity: number;
            price: Prisma.Decimal;
        }> = [];

        for (const item of cart.items) {
            const productPrice = item.product.price.toNumber();
            const discount = item.product.discountPercent || 0;
            const finalPrice = discount > 0 ? productPrice * (1 - discount / 100) : productPrice;
            const itemTotal = finalPrice * item.quantity;
            orderTotal += itemTotal;

            if (item.product.stock < item.quantity) {
                res.status(400).json({
                    message: `Insufficient stock for "${item.product.name}". Only ${item.product.stock} left.`,
                });
                return;
            }

            orderItemsData.push({
                productId: item.product.id,
                quantity: item.quantity,
                price: new Prisma.Decimal(finalPrice),
            });
        }

        // === Shipping & Tax ===
        const subtotal = orderTotal;
        const tax = subtotal * 0.16; // 16% VAT
        const shipping = subtotal >= 20000 ? 0 : 500;
        const finalTotal = subtotal + tax + shipping;

        // === Transaction: Create order atomically ===
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create the order with all delivery details
            const order = await tx.order.create({
                data: {
                    userId,
                    price: new Prisma.Decimal(finalTotal),
                    paymentMethod: paymentMethod.toLowerCase(),
                    address: address.trim(),
                    name: name.trim(),
                    phone: phone.trim(),
                    city: city.trim(),
                    notes: notes?.trim() || null,
                    status: "PENDING",
                    trackingNumber: null,
                },
                select: {
                    id: true,
                    price: true,
                    status: true,
                    createdAt: true,
                },
            });

            // 2. Create order items
            await tx.orderItem.createMany({
                data: orderItemsData.map((item) => ({
                    ...item,
                    orderId: order.id,
                })),
            });

            // 3. Deduct stock
            for (const item of cart.items) {
                await tx.product.update({
                    where: { id: item.product.id },
                    data: {
                        stock: { decrement: item.quantity },
                    },
                });
            }

            // 4. Clear cart
            await tx.cartItem.deleteMany({
                where: { cartId: cart.id },
            });

            return order;
        });

        // === Success response ===
        res.status(201).json({
            message: "Order placed successfully!",
            order: {
                id: result.id,
                total: finalTotal,
                status: result.status,
                createdAt: result.createdAt,
                paymentMethod: paymentMethod.toLowerCase(),
            },
        });
    } catch (error: any) {
        console.error("createOrder error:", error);

        if (error.code === "P2025") {
            res.status(404).json({ message: "Cart not found" });
            return;
        }

        res.status(500).json({ message: "Failed to place order. Please try again." });
    }
};

export const getOrders = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id; // Cognito sub
        const userRole = (req as any).user?.role;

        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize as string) || 10));
        const status = (req.query.status as string) || undefined;

        const skip = (page - 1) * pageSize;

        // Users can only see their own orders
        const where = userRole === "admin"
            ? { status } // Admin can filter by status
            : { userId, ...(status && { status }) };

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                include: {
                    items: {
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                    slug: true,
                                    imageUrl: true,
                                    price: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: pageSize,
            }),
            prisma.order.count({ where }),
        ]);

        res.status(200).json({
            orders,
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize),
            },
        });
    } catch (error: any) {
        console.error("getOrders error:", error);
        res.status(500).json({ message: "Failed to fetch orders" });
    }
};

// GET /orders/:id - Both admin and user (but user only own orders)
export const getOrderById = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id;
        const userRole = (req as any).user?.role;
        const { id } = req.params;

        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const orderId = parseInt(id);
        if (isNaN(orderId)) {
            res.status(400).json({ message: "Invalid order ID" });
            return;
        }

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                                imageUrl: true,
                                price: true,
                                discountPercent: true,
                            },
                        },
                    },
                },
            },
        });

        if (!order) {
            res.status(404).json({ message: "Order not found" });
            return;
        }

        // Users can only view their own orders
        if (userRole !== "admin" && order.userId !== userId) {
            res.status(403).json({ message: "Forbidden: You can only view your own orders" });
            return;
        }

        res.status(200).json({ order });
    } catch (error: any) {
        console.error("getOrderById error:", error);
        res.status(500).json({ message: "Failed to fetch order" });
    }
};

// PATCH /orders/:id/status - Admin only: Update order status
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const userRole = (req as any).user?.role;
        const { id } = req.params;
        const { status } = req.body;

        if (userRole !== "admin") {
            res.status(403).json({ message: "Forbidden: Only admins can update order status" });
            return;
        }

        const orderId = parseInt(id);
        if (isNaN(orderId)) {
            res.status(400).json({ message: "Invalid order ID" });
            return;
        }

        const validStatuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
        if (!status || !validStatuses.includes(status.toUpperCase())) {
            res.status(400).json({
                message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
            });
            return;
        }

        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: { status: status.toUpperCase() },
            include: {
                items: {
                    include: { product: { select: { name: true } } },
                },
            },
        });

        res.status(200).json({
            message: "Order status updated successfully",
            order: updatedOrder,
        });
    } catch (error: any) {
        console.error("updateOrderStatus error:", error);
        if (error.code === "P2025") {
            res.status(404).json({ message: "Order not found" });
            return;
        }
        res.status(500).json({ message: "Failed to update order status" });
    }
};