"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Star, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Product } from "@/types/prismaTypes";
import { useGetAuthUserQuery, useAddToCartMutation } from "@/state/api";

interface ProductCardProps {
    product: Product;
}

type Price = number | { toNumber(): number };

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const { data: authUser } = useGetAuthUserQuery();
    const [addToCart, { isLoading: isAdding }] = useAddToCartMutation();

    const [imageIndex, setImageIndex] = useState(0);
    const [isFavorited, setIsFavorited] = useState(false);

    // Load guest favorite status
    useEffect(() => {
        const favorites = JSON.parse(localStorage.getItem("guestFavorites") || "[]");
        const isFav = favorites.includes(product.id);
        setIsFavorited(isFav);
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

        // Dispatch event to update navbar favorites count
        window.dispatchEvent(new CustomEvent("favoritesUpdated"));
    };

    // === Real Add to Cart Handler ===
    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (product.stock === 0) return;

        if (authUser) {
            // Logged-in user: use server cart
            try {
                await addToCart({ productId: product.id, quantity: 1 }).unwrap();
                // Toast is already handled by mutation's onQueryStarted
            } catch (err) {
                // Error toast also handled by mutation
            }
        } else {
            // Guest user: use localStorage
            const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");

            const existingItem = guestCart.find((item: any) => item.productId === product.id);

            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                guestCart.push({ productId: product.id, quantity: 1 });
            }

            localStorage.setItem("guestCart", JSON.stringify(guestCart));

            // Dispatch event so Navbar can update count immediately
            window.dispatchEvent(new CustomEvent("guestCartUpdated"));
        }
    };

    // === Images ===
    const images = product.imageUrls && product.imageUrls.length > 0
        ? product.imageUrls.filter(Boolean)
        : ["/placeholder-laptop.jpg"];
    const primaryImage = product.imageUrl || images[0];

    // === Specs ===
    const specs = Array.isArray(product.specs) ? product.specs : [];
    const keySpecs = specs
        .filter((spec: any) => ["Processor", "RAM", "Storage", "Screen Size", "Graphics", "Brand"].includes(spec.key))
        .slice(0, 3);

    // === Price & Discount ===
    const getDecimalValue = (value: any): number => {
        if (value == null) return 0;
        if (typeof value === "object" && "toNumber" in value) return value.toNumber();
        return parseFloat(value);
    };

    const formatPrice = (price: Price) => {
        const value = typeof price === "object" && price !== null && "toNumber" in price
            ? price.toNumber()
            : price;
        return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(value);
    };

    const rating = getDecimalValue(product.averageRating);
    const reviewCount = product.reviewCount ?? 0;
    const discountPercent = product.discountPercent ?? 0;
    const hasDiscount = discountPercent > 0;
    const originalPrice = getDecimalValue(product.price);
    const discountedPrice = hasDiscount ? originalPrice * (1 - discountPercent / 100) : originalPrice;

    return (
        <Card
            className="group relative overflow-hidden bg-white border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300 rounded-md"
            onMouseEnter={() => images.length > 1 && setImageIndex(1)}
            onMouseLeave={() => setImageIndex(0)}
        >
            {/* Featured Badge */}
            <div className="absolute top-3 left-3 z-10">
                <div className="bg-[#232F3E] text-white text-xs font-bold px-2 py-1 rounded">Featured</div>
            </div>

            {/* Low Stock Alert */}
            {product.stock < 10 && product.stock > 0 && (
                <div className="absolute top-3 right-3 z-10">
                    <div className="bg-red-600 text-white text-xs font-medium px-2 py-1 rounded flex items-center gap-1">
                        <Zap className="w-3 h-3" /> Only {product.stock} left
                    </div>
                </div>
            )}

            <Link href={`/shop/products/${product.id}`} className="block">
                {/* Image */}
                <div className="relative aspect-square bg-gray-50 p-4">
                    <div className="relative w-full h-full">
                        <Image
                            src={images[imageIndex] || primaryImage || "/placeholder-laptop.jpg"}
                            alt={product.name}
                            fill
                            className="object-contain transition-opacity duration-500"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                    </div>

                    {/* Quick Actions on Hover */}
                    <div className="absolute bottom-3 left-3 right-3 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button variant="outline" size="sm" className="bg-white/95 backdrop-blur-sm border-gray-300 hover:bg-gray-50 text-sm font-medium rounded-md">
                            Quick View
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={toggleFavorite}
                            className="bg-white/95 backdrop-blur-sm border-gray-300 hover:bg-gray-50 rounded-md"
                        >
                            <Heart
                                className={`w-4 h-4 transition-colors ${
                                    isFavorited ? "fill-red-500 text-red-500" : "text-gray-600 hover:text-red-500"
                                }`}
                            />
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">
                        {product.category?.name || "Electronics"}
                    </div>

                    <h3 className="font-medium text-gray-900 line-clamp-2 text-sm leading-snug group-hover:text-[#007185] transition-colors min-h-[40px]">
                        {product.name}
                    </h3>

                    {/* Rating */}
                    {rating > 0 && (
                        <div className="flex items-center gap-2">
                            <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-4 h-4 ${
                                            i < Math.floor(rating)
                                                ? "fill-yellow-400 text-yellow-400"
                                                : i < rating
                                                    ? "fill-yellow-400/30 text-yellow-400"
                                                    : "text-gray-300"
                                        }`}
                                    />
                                ))}
                            </div>
                            <span className="text-sm text-[#007185] hover:text-orange-600 cursor-pointer">
                {rating.toFixed(1)} ({reviewCount.toLocaleString()})
              </span>
                        </div>
                    )}

                    {/* Key Specs */}
                    {keySpecs.length > 0 && (
                        <ul className="space-y-1 border-t border-gray-100 pt-3">
                            {keySpecs.map((spec: any, i: number) => (
                                <li key={i} className="text-xs text-gray-600 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                                    <span className="font-medium text-gray-700">{spec.key}:</span>
                                    <span className="text-gray-600">{spec.value}</span>
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* Price */}
                    <div className="space-y-1">
                        <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-gray-900">
                {formatPrice(hasDiscount ? discountedPrice : originalPrice)}
              </span>
                            {hasDiscount && (
                                <>
                  <span className="text-xs text-gray-500 line-through">
                    {formatPrice(originalPrice)}
                  </span>
                                    <span className="text-xs font-medium text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                    Save {discountPercent}%
                  </span>
                                </>
                            )}
                        </div>

                        {product.warranty && (
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                <Shield className="w-3 h-3" />
                                <span>{product.warranty}</span>
                            </div>
                        )}
                    </div>

                    {/* Stock Status */}
                    <div className={`text-sm font-medium ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}>
                        {product.stock > 0 ? (
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                In Stock • Free delivery
                            </div>
                        ) : (
                            "Currently unavailable"
                        )}
                    </div>

                    {/* Coupon */}
                    {product.stock > 0 && (
                        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded border border-gray-200">
                            <span className="font-medium text-green-600">Save 5%</span> with code:{" "}
                            <span className="font-mono font-bold">SAVE5</span>
                        </div>
                    )}
                </div>
            </Link>

            {/* Add to Cart Button */}
            <div className="px-4 pb-4">
                <Button
                    className={`w-full font-medium rounded-md transition-all duration-300 flex items-center justify-center gap-2 ${
                        product.stock > 0
                            ? "bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] text-gray-900 hover:shadow-md"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                    disabled={product.stock === 0 || isAdding}
                    onClick={handleAddToCart}
                >
                    <ShoppingCart className="w-4 h-4" />
                    {isAdding ? "Adding..." : product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                </Button>
            </div>
        </Card>
    );
};

export default ProductCard;