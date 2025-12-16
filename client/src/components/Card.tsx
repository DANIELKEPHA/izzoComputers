"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Star, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Product } from "@/types/prismaTypes";
import type { ProductSpec } from "@/state";

interface ProductCardProps {
    product: Product;
}

type Price = number | { toNumber(): number };

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const [isFavorited, setIsFavorited] = useState(false);
    const [imageIndex, setImageIndex] = useState(0);

    // ---- Images ----
    const images =
        product.imageUrls && product.imageUrls.length > 0
            ? product.imageUrls.filter(Boolean)
            : ["/placeholder-laptop.jpg"];
    const primaryImage = product.imageUrl || images[0];

    // ---- Specs ----
    const specs: ProductSpec[] = Array.isArray(product.specs)
        ? (product.specs as ProductSpec[])
        : [];
    const keySpecs = specs
        .filter((spec) =>
            ["Processor", "RAM", "Storage", "Screen Size", "Graphics", "Brand"].includes(spec.key)
        )
        .slice(0, 3);

    const formatPrice = (price: Price) => {
        const value = typeof price === "object" && price !== null && "toNumber" in price
            ? price.toNumber()
            : price;
        return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(value);
    };

    // ---- Dynamic values from backend (safe for JSON-serialized Decimal) ----
    const getDecimalValue = (value: any): number => {
        if (value == null) return 0;
        if (typeof value === "object" && "toNumber" in value) {
            return value.toNumber();
        }
        return parseFloat(value);
    };

    const rating = getDecimalValue(product.averageRating);
    const reviewCount = product.reviewCount ?? 0;
    const discountPercent = product.discountPercent ?? 0;
    const hasDiscount = discountPercent > 0;
    const originalPrice = getDecimalValue(product.price);
    const discountedPrice = hasDiscount
        ? originalPrice * (1 - discountPercent / 100)
        : originalPrice;
    const warranty = product.warranty;

    return (
        <Card
            className="group relative overflow-hidden bg-white border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300 rounded-md"
            onMouseEnter={() => images.length > 1 && setImageIndex(1)}
            onMouseLeave={() => setImageIndex(0)}
        >
            {/* Featured Badge */}
            <div className="absolute top-3 left-3 z-10">
                <div className="bg-[#232F3E] text-white text-xs font-bold px-2 py-1 rounded">
                    Featured
                </div>
            </div>

            {/* Low Stock Alert */}
            {product.stock < 10 && product.stock > 0 && (
                <div className="absolute top-3 right-3 z-10">
                    <div className="bg-red-600 text-white text-xs font-medium px-2 py-1 rounded flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        Only {product.stock} left
                    </div>
                </div>
            )}

            <Link href={`/products/${product.id}`} className="block">
                {/* Image Container */}
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

                    {/* Quick Actions */}
                    <div className="absolute bottom-3 left-3 right-3 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button
                            variant="outline"
                            size="sm"
                            className="bg-white/95 backdrop-blur-sm border-gray-300 hover:bg-gray-50 text-sm font-medium rounded-md"
                        >
                            Quick View
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="bg-white/95 backdrop-blur-sm border-gray-300 hover:bg-gray-50 rounded-md"
                            onClick={(e) => {
                                e.preventDefault();
                                setIsFavorited((prev) => !prev);
                            }}
                        >
                            <Heart
                                className={`w-4 h-4 ${
                                    isFavorited ? "fill-red-500 text-red-500" : "text-gray-600"
                                }`}
                            />
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                    {/* Category */}
                    <div className="text-xs text-gray-500 uppercase tracking-wide">
                        {product.category?.name || "Electronics"}
                    </div>

                    {/* Product Name */}
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
                            {keySpecs.map((spec, i) => (
                                <li
                                    key={i}
                                    className="text-xs text-gray-600 flex items-center gap-2"
                                >
                                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                                    <span className="font-medium text-gray-700">{spec.key}:</span>
                                    <span className="text-gray-600">{spec.value}</span>
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* Price Section */}
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

                        {/* Warranty */}
                        {warranty && (
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                <Shield className="w-3 h-3" />
                                <span>{warranty}</span>
                            </div>
                        )}
                    </div>

                </div>
            </Link>

            {/* Add to Cart / Buy Now */}
            <div className="px-4 pb-4">
                <div className="flex gap-2">
                    <Button
                        className={`flex-1 font-medium rounded-md transition-all duration-300 ${
                            product.stock > 0
                                ? "bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] text-gray-900 hover:shadow-md"
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                        disabled={product.stock === 0}
                        onClick={(e) => {
                            e.preventDefault();
                            alert("Added to cart! (Implement cart functionality next)");
                        }}
                    >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                    </Button>

                    {product.stock > 0 && (
                        <Button
                            className="flex-1 bg-[#FFA41C] hover:bg-[#FA8900] text-gray-900 font-medium rounded-md transition-all duration-300 hover:shadow-md"
                            onClick={(e) => {
                                e.preventDefault();
                                alert("Proceeding to checkout...");
                            }}
                        >
                            Buy Now
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default ProductCard;