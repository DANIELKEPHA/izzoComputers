"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronDown } from 'lucide-react';
import AdvertBanner from "@/components/AdvertBanner";
import { useGetCategoriesWithCountQuery } from "@/state/api";
import { categoryIconMap, defaultCategoryIcon } from "@/lib/categoryIcons";

// Optional: keep dynamic colors for icon background if you still want colored icons
const categoryColors: Record<string, string> = {
    smartphones: 'bg-blue-500',
    laptops: 'bg-purple-500',
    audio: 'bg-green-500',
    wearables: 'bg-red-500',
    photography: 'bg-yellow-500',
    gaming: 'bg-indigo-500',
    default: 'bg-gray-500',
};

const getCategoryColor = (categoryName: string): string => {
    const lower = categoryName.toLowerCase();
    return (
        categoryColors[lower] ||
        categoryColors[Object.keys(categoryColors).find(key => lower.includes(key)) || ''] ||
        categoryColors.default
    );
};

const FeaturesSection = () => {
    const [showAll, setShowAll] = useState(false);
    const { data: categories = [], isLoading: categoriesLoading, isError } = useGetCategoriesWithCountQuery();

    const displayedCategories = showAll ? categories : categories.slice(0, 6);
    const hasMoreCategories = categories.length > 6;

    if (categoriesLoading) {
        return (
            <section className="min-h-[50vh] w-screen bg-gradient-to-b from-gray-50 to-white py-12 md:py-20">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-64 rounded-2xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (isError) {
        return (
            <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-red-600">Failed to load categories. Please try again later.</p>
                </div>
            </section>
        );
    }

    if (categories.length === 0) return null;

    return (
        <section className="min-h-[50vh] w-screen overflow-hidden bg-gradient-to-b from-gray-50 to-white py-12 md:py-20">
            <div className="container mx-auto px-4 md:px-6">
                {/* Header */}
                <div className="mb-12 md:mb-16 flex flex-col items-start">
                    <span className="text-sm font-semibold tracking-widest uppercase text-blue-600 mb-2">
                        Shop by Category
                    </span>

                    <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full my-4" />

                    <p className="text-gray-600 max-w-xl text-lg">
                        Discover products in your favorite categories, carefully curated for you.
                    </p>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {displayedCategories.map((
                        category: {
                            id: number;
                            name: string;
                            slug?: string;
                            productCount: number;
                            coverImageUrl?: string | null;
                        }
                    ) => {
                        const lowerName = category.name.toLowerCase();
                        const Icon = categoryIconMap[lowerName] ||
                            Object.entries(categoryIconMap).find(([key]) => lowerName.includes(key))?.[1] ||
                            defaultCategoryIcon;

                        const colorClass = getCategoryColor(lowerName);

                        const itemsLabel =
                            category.productCount === 0
                                ? "No products yet"
                                : `${category.productCount}+ Product${category.productCount > 1 ? 's' : ''}`;

                        const hrefSlug = category.slug || category.name
                            .toLowerCase()
                            .replace(/\s+/g, '-')
                            .replace(/[^\w-]/g, '');

                        const hasImage = !!category.coverImageUrl;

                        return (
                            <Link
                                key={category.id}
                                href={`/shop/categories/${hrefSlug}`}
                                className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 block h-64"
                            >
                                {/* Background Image or Fallback */}
                                <div className="absolute inset-0">
                                    {hasImage ? (
                                        <div
                                            className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                            style={{ backgroundImage: `url(${category.coverImageUrl!})` }}
                                        />
                                    ) : (
                                        // Fallback gradient if no image
                                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
                                    )}

                                    {/* Dark overlay for text readability */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                                </div>

                                {/* Content */}
                                <div className="relative z-10 p-6 md:p-8 h-full flex flex-col justify-between text-white">
                                    <div>
                                        <div className={`${colorClass} w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                        <h3 className="text-2xl font-bold mb-2 drop-shadow-md">
                                            {category.name}
                                        </h3>
                                        <p className="text-white/90 mb-4 drop-shadow">
                                            Explore the latest collection
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-white/30">
                                        <span className="text-white/80 text-sm">{itemsLabel}</span>
                                        <div className="flex items-center text-white group-hover:translate-x-2 transition-transform duration-300">
                                            <span className="text-sm font-medium mr-2">Explore</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>

                                {/* Hover glow overlay */}
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                            </Link>
                        );
                    })}
                </div>

                {/* Show More Button */}
                {hasMoreCategories && (
                    <div className="flex justify-center mt-12">
                        <button
                            onClick={() => setShowAll(!showAll)}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:-translate-y-0.5"
                        >
              <span className="font-medium">
                {showAll ? 'Show Less' : `Show More (${categories.length - 6})`}
              </span>
                            <ChevronDown
                                className={`w-4 h-4 transition-transform duration-300 ${showAll ? 'rotate-180' : ''}`}
                            />
                        </button>
                    </div>
                )}

                {/* Advert Banner */}
                <div className="mt-16 md:mt-24 relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600">
                    <AdvertBanner />
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;