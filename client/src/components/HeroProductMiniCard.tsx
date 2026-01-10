"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Star, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAddToCartMutation } from "@/state/api";
import { Product } from "@/types/prismaTypes";
import {toast} from "sonner";

const GUEST_CART_KEY = "guestCart";

interface MinimalProductCardProps {
    product: Product;
}

const MinimalProductCard: React.FC<MinimalProductCardProps> = ({ product }) => {
    const [isFavorited, setIsFavorited] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [addToCart] = useAddToCartMutation();

    // Sync favorite status
    useEffect(() => {
        const favorites = JSON.parse(localStorage.getItem("guestFavorites") || "[]");
        setIsFavorited(favorites.includes(product.id));
    }, [product.id]);

    // Toggle favorite (guest only)
    const toggleFavorite = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const favorites = JSON.parse(localStorage.getItem("guestFavorites") || "[]");
        const id = product.id;

        if (favorites.includes(id)) {
            const updated = favorites.filter((fid: number) => fid !== id);
            localStorage.setItem("guestFavorites", JSON.stringify(updated));
            setIsFavorited(false);
        } else {
            favorites.push(id);
            localStorage.setItem("guestFavorites", JSON.stringify(favorites));
            setIsFavorited(true);
        }

        window.dispatchEvent(new CustomEvent("favoritesUpdated"));
    };

    // Real Add to Cart Handler
    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!product.stock || product.stock < 1) {
            toast.error("This item is out of stock");
            return;
        }

        setIsAddingToCart(true);

        try {
            // Try to add via API (for logged-in users)
            await addToCart({ productId: product.id, quantity: 1 }).unwrap();

            toast.success("Added to cart!");
            window.dispatchEvent(new CustomEvent("guestCartUpdated")); // Sync cart count in navbar
        } catch (error: any) {
            // If user is not logged in (401), fall back to guest cart
            if (error?.status === 401 || error?.originalStatus === 401) {
                const guestCart = JSON.parse(localStorage.getItem(GUEST_CART_KEY) || "[]");
                const existingIndex = guestCart.findIndex((item: any) => item.productId === product.id);

                if (existingIndex !== -1) {
                    guestCart[existingIndex].quantity += 1;
                } else {
                    guestCart.push({ productId: product.id, quantity: 1 });
                }

                localStorage.setItem(GUEST_CART_KEY, JSON.stringify(guestCart));
                toast.success("Added to cart!");
                window.dispatchEvent(new CustomEvent("guestCartUpdated"));
            } else {
                toast.error("Failed to add to cart. Please try again.");
            }
        } finally {
            setIsAddingToCart(false);
        }
    };

    // Image & Price Logic
    const primaryImage = product.imageUrl || (product.imageUrls?.[0]) || "/placeholder-laptop.jpg";
    const originalPrice = typeof product.price === "object" && "toNumber" in product.price
        ? product.price.toNumber()
        : Number(product.price || 0);
    const discountPercent = product.discountPercent ?? 0;
    const hasDiscount = discountPercent > 0;
    const discountedPrice = hasDiscount ? originalPrice * (1 - discountPercent / 100) : originalPrice;
    const isInStock = product.stock > 0;

    const formatPrice = (price: number) =>
        new Intl.NumberFormat("en-KE", {
            style: "currency",
            currency: "KES",
            minimumFractionDigits: 0,
        }).format(price);

    return (
        <Card className="group relative overflow-hidden bg-white border border-gray-200 hover:border-gray-300 hover:shadow-2xl transition-all duration-500 rounded-2xl w-full max-w-sm mx-auto">
            {/* Favorite Button */}
            <button
                onClick={toggleFavorite}
                className="absolute top-4 right-4 z-20 p-2.5 bg-white/95 backdrop-blur-sm rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110"
                aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
            >
                <Heart
                    className={`w-5 h-5 transition-all duration-300 ${
                        isFavorited
                            ? "fill-red-500 text-red-500 scale-110"
                            : "text-gray-600 hover:text-red-500"
                    }`}
                />
            </button>

            {/* Discount Badge */}
            {hasDiscount && (
                <div className="absolute top-4 left-4 z-20">
                    <Badge className="bg-red-600 text-white font-bold text-xs px-3 py-1.5 shadow-md">
                        -{discountPercent}%
                    </Badge>
                </div>
            )}

            {/* Low Stock Badge */}
            {isInStock && product.stock < 10 && (
                <div className="absolute top-14 left-4 z-20">
                    <Badge className="bg-orange-500 text-white text-xs px-3 py-1 shadow-md">
                        Only {product.stock} left
                    </Badge>
                </div>
            )}

            <Link href={`/shop/products/${product.id}`}>
                {/* Image */}
                <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 p-8 overflow-hidden">
                    <Image
                        src={primaryImage}
                        alt={product.name}
                        fill
                        className="object-contain drop-shadow-lg transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 300px"
                        priority
                    />
                </div>

                {/* Content */}
                <div className="p-5 space-y-4">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider truncate">
                        {product.category?.name || "Electronics"}
                    </p>

                    <h3 className="font-bold text-gray-900 line-clamp-2 text-base leading-tight group-hover:text-blue-600 transition-colors">
                        {product.name}
                    </h3>

                    {/* Rating */}
                    {product.averageRating && Number(product.averageRating) > 0 && (
                        <div className="flex items-center gap-2">
                            <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-4 h-4 ${
                                            i < Math.floor(Number(product.averageRating))
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "text-gray-300"
                                        }`}
                                    />
                                ))}
                            </div>
                            <span className="text-sm font-medium text-gray-700">
                {Number(product.averageRating).toFixed(1)}
              </span>
                            {product.reviewCount > 0 && (
                                <span className="text-xs text-gray-500">({product.reviewCount})</span>
                            )}
                        </div>
                    )}

                    {/* Price */}
                    <div className="flex items-end gap-3">
            <span className="text-2xl font-extrabold text-gray-900">
              {formatPrice(discountedPrice)}
            </span>
                        {hasDiscount && (
                            <span className="text-sm text-gray-500 line-through mb-1">
                {formatPrice(originalPrice)}
              </span>
                        )}
                    </div>

                    <p className={`text-sm font-medium ${isInStock ? "text-green-600" : "text-red-600"}`}>
                        {isInStock ? "In Stock" : "Out of Stock"}
                    </p>

                    {/* Add to Cart Button */}
                    <Button
                        className={`w-full font-semibold rounded-xl py-5 transition-all duration-300 flex items-center justify-center gap-2 ${
                            isInStock
                                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
                                : "bg-gray-200 text-gray-500 cursor-not-allowed"
                        }`}
                        disabled={!isInStock || isAddingToCart}
                        onClick={handleAddToCart}
                    >
                        {isAddingToCart ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Adding...
                            </>
                        ) : isInStock ? (
                            <>
                                <ShoppingCart className="w-5 h-5" />
                                Add to Cart
                            </>
                        ) : (
                            "Unavailable"
                        )}
                    </Button>
                </div>
            </Link>
        </Card>
    );
};

export default MinimalProductCard;