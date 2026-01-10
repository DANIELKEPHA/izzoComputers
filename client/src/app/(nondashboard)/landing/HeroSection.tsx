"use client";

import React from "react";
import { useGetFeaturedProductsQuery } from "@/state/api";
import { Skeleton } from "@/components/ui/skeleton";
import MinimalProductCard from "@/components/HeroProductMiniCard";

const HeroSection = () => {
    const { data: products = [], isLoading } = useGetFeaturedProductsQuery();
    const skeletonArray = Array(4).fill(null);

    return (
        <section className="relative w-full min-h-[calc(100vh-80px)]">
            {/* Main Hero Banner */}
            <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 pt-24 pb-56 overflow-hidden">
                {/* Background Image */}
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage:
                            "url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1600&auto=format&fit=crop')",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                />

                {/* Hero Text */}
                <div className="relative z-10 px-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="max-w-xl text-left">
                            <h1 className="text-xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 md:mb-6 drop-shadow-lg leading-tight">
                                Welcome to Prime Day Deals
                            </h1>
                            <p className="text-xl md:text-2xl lg:text-3xl text-yellow-400 mb-8 md:mb-12 font-semibold">
                                Exclusive offers on top-rated products
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Featured Cards – overlay but still in layout flow */}
            <div className="relative z-20 -mt-48 md:-mt-56 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {(isLoading ? skeletonArray : products).map((product, index) =>
                            isLoading ? (
                                <div
                                    key={`skeleton-${index}`}
                                    className="bg-white rounded-md border border-gray-200"
                                >
                                    <Skeleton className="aspect-square w-full rounded-t-md" />
                                    <div className="p-4 space-y-3">
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-5 w-full" />
                                        <Skeleton className="h-5 w-3/4" />
                                        <Skeleton className="h-10 w-full rounded-md" />
                                    </div>
                                </div>
                            ) : (
                                <div
                                    key={product.id}
                                    className="transform hover:scale-105 transition-transform duration-300"
                                >
                                    <MinimalProductCard product={product} />
                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
