"use client";

import { useEffect, useState, useCallback } from "react";
import {
    useGetCartQuery,
    useAddToCartMutation,
    useUpdateCartItemMutation,
    useRemoveFromCartMutation,
    useClearCartMutation,
} from "@/state/api";
import { useGetAuthUserQuery } from "@/state/api";
import {CartItem, UseCartReturn} from "@/state";

const GUEST_CART_KEY = "guestCart";

interface GuestCartItem {
    productId: number;
    quantity: number;
}

export const useCart = (): UseCartReturn => {
    const { data: authUser, isSuccess: authSuccess } = useGetAuthUserQuery();
    const isLoggedIn = !!authUser;

    // RTK Query hooks for server cart
    const {
        data: serverCartData,
        isLoading: serverLoading,
        isFetching: serverFetching,
        refetch,
    } = useGetCartQuery(undefined, {
        skip: !isLoggedIn,
    });

    const [addToCart] = useAddToCartMutation();
    const [updateCartItem] = useUpdateCartItemMutation();
    const [removeFromCart] = useRemoveFromCartMutation();
    const [clearServerCart] = useClearCartMutation();

    // Local state for guest cart
    const [guestItems, setGuestItems] = useState<CartItem[]>([]);

    // Load guest cart from localStorage on mount
    useEffect(() => {
        if (!isLoggedIn) {
            const saved = localStorage.getItem(GUEST_CART_KEY);
            if (saved) {
                try {
                    setGuestItems(JSON.parse(saved));
                } catch (e) {
                    setGuestItems([]);
                }
            }
        }
    }, [isLoggedIn]);

    useEffect(() => {
        if (authSuccess && isLoggedIn) {
            const savedGuestCart = localStorage.getItem(GUEST_CART_KEY);
            if (savedGuestCart) {
                try {
                    const guestCart: GuestCartItem[] = JSON.parse(savedGuestCart);
                    if (guestCart.length > 0) {
                        const sync = async () => {
                            for (const item of guestCart) {
                                try {
                                    await addToCart({
                                        productId: item.productId,
                                        quantity: item.quantity,
                                    }).unwrap();
                                } catch (err) {
                                    console.error("Failed to sync guest item", item, err);
                                    // Optionally: collect failed items
                                }
                            }
                            // Only clear after successful sync
                            localStorage.removeItem(GUEST_CART_KEY);
                            setGuestItems([]);
                            refetch(); // Refresh server cart
                        };

                        sync();
                    }
                } catch (e) {
                    console.error("Failed to parse guest cart", e);
                    localStorage.removeItem(GUEST_CART_KEY); // Clean up corrupted data
                }
            }
        }
    }, [authSuccess, isLoggedIn, addToCart, refetch]);

    // Listen for guest cart updates
    useEffect(() => {
        const handleGuestUpdate = () => {
            if (!isLoggedIn) {
                const saved = localStorage.getItem(GUEST_CART_KEY);
                if (saved) {
                    try {
                        setGuestItems(JSON.parse(saved));
                    } catch (e) {
                        setGuestItems([]);
                    }
                }
            }
        };

        window.addEventListener("guestCartUpdated", handleGuestUpdate);
        return () => window.removeEventListener("guestCartUpdated", handleGuestUpdate);
    }, [isLoggedIn]);

    // Determine which cart to use
    const items = isLoggedIn && serverCartData ? serverCartData.cart.items : guestItems;

    // Calculate count and total
    const count = items.reduce((sum, item) => sum + item.quantity, 0);

    const total = items.reduce((sum, item) => {
        if (!item.product) return sum;

        const price =
            typeof item.product.price?.toNumber === "function"
                ? item.product.price.toNumber()
                : Number(item.product.price);

        const discount = item.product.discountPercent || 0;
        const finalPrice = discount > 0 ? price * (1 - discount / 100) : price;

        return sum + finalPrice * item.quantity;
    }, 0);

    // === Define actions in correct order (removeItem first) ===
    const removeItem = useCallback(
        async (productId: number) => {
            if (isLoggedIn) {
                await removeFromCart(productId);
            } else {
                const current = JSON.parse(localStorage.getItem(GUEST_CART_KEY) || "[]");
                const filtered = current.filter((i: any) => i.productId !== productId);
                localStorage.setItem(GUEST_CART_KEY, JSON.stringify(filtered));
                window.dispatchEvent(new CustomEvent("guestCartUpdated"));
            }
        },
        [isLoggedIn, removeFromCart]
    );

    const updateQuantity = useCallback(
        async (productId: number, quantity: number) => {
            if (quantity <= 0) {
                await removeItem(productId);
                return;
            }

            if (isLoggedIn) {
                await updateCartItem({ productId, quantity });
            } else {
                const current = JSON.parse(localStorage.getItem(GUEST_CART_KEY) || "[]");
                const updated = current.map((i: any) =>
                    i.productId === productId ? { ...i, quantity } : i
                );
                localStorage.setItem(GUEST_CART_KEY, JSON.stringify(updated));
                window.dispatchEvent(new CustomEvent("guestCartUpdated"));
            }
        },
        [isLoggedIn, updateCartItem, removeItem] // Now safe: removeItem is declared above
    );

    const addItem = useCallback(
        async (productId: number, quantity: number = 1) => {
            if (isLoggedIn) {
                await addToCart({ productId, quantity });
            } else {
                const current = JSON.parse(localStorage.getItem(GUEST_CART_KEY) || "[]");
                const existing = current.find((i: any) => i.productId === productId);

                if (existing) {
                    existing.quantity += quantity;
                } else {
                    current.push({ productId, quantity });
                }

                localStorage.setItem(GUEST_CART_KEY, JSON.stringify(current));
                window.dispatchEvent(new CustomEvent("guestCartUpdated"));
            }
        },
        [isLoggedIn, addToCart]
    );

    const clearCart = useCallback(async () => {
        if (isLoggedIn) {
            await clearServerCart();
        } else {
            localStorage.removeItem(GUEST_CART_KEY);
            setGuestItems([]);
            window.dispatchEvent(new CustomEvent("guestCartUpdated"));
        }
    }, [isLoggedIn, clearServerCart]);

    return {
        items,
        count,
        total,
        isLoading: isLoggedIn ? (serverLoading || serverFetching) : false,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
    };
};