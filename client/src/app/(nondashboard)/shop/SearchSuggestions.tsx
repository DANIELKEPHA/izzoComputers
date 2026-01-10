"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search } from "lucide-react";
import { useGetCategoriesQuery, useGetProductsQuery } from "@/state/api";

interface Props {
    query: string;
    onSelect: () => void; // to clear input after selection
}

export default function SearchSuggestions({ query, onSelect }: Props) {
    const router = useRouter();

    // Fetch categories (always lightweight)
    const { data: categories = [] } = useGetCategoriesQuery();

    // Fetch matching products (small page size for speed)
    const { data: productsData, isFetching: productsLoading } = useGetProductsQuery(
        {
            search: query,
            page: 1,
            pageSize: 6, // Only top 6 products
        },
        {
            skip: query.length < 2, // Don't fetch if too short
        }
    );

    const products = productsData?.products || [];

    // Filter categories client-side (fast, small list)
    const matchingCategories = categories.filter((cat: any) =>
        cat.name.toLowerCase().includes(query.toLowerCase())
    );

    const hasResults = matchingCategories.length > 0 || products.length > 0;

    if (query.length < 2 || !hasResults) return null;

    const handleCategoryClick = (categoryName: string) => {
        router.push(`/shop?q=${encodeURIComponent(categoryName)}`);
        onSelect();
    };

    const handleProductClick = (productName: string) => {
        router.push(`/shop?q=${encodeURIComponent(productName)}`);
        onSelect();
    };

    const handleSearchAll = () => {
        router.push(`/shop?q=${encodeURIComponent(query)}`);
        onSelect();
    };

    return (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden z-50">
            {/* Categories Section */}
            {matchingCategories.length > 0 && (
                <div className="border-b border-gray-100">
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Categories
                    </div>
                    {matchingCategories.map((cat: any) => (
                        <button
                            key={cat.id}
                            onClick={() => handleCategoryClick(cat.name)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition"
                        >
                            <Search className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-800">{cat.name}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Products Section */}
            {products.length > 0 && (
                <div>
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Products
                    </div>
                    {productsLoading ? (
                        <div className="p-4 space-y-3">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        products.map((product: any) => (
                            <button
                                key={product.id}
                                onClick={() => handleProductClick(product.name)}
                                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-4 transition"
                            >
                                {product.imageUrl ? (
                                    <Image
                                        src={product.imageUrl}
                                        alt={product.name}
                                        width={48}
                                        height={48}
                                        className="rounded object-cover bg-gray-100"
                                    />
                                ) : (
                                    <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                        <Search className="w-6 h-6 text-gray-400" />
                                    </div>
                                )}
                                <div className="flex-1 text-left">
                                    <p className="text-gray-800 font-medium truncate pr-4">
                                        {product.name}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        KSh {Number(product.price).toLocaleString()}
                                    </p>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            )}

            {/* Footer: Full Search */}
            <button
                onClick={handleSearchAll}
                className="w-full px-4 py-3 text-center text-blue-600 hover:bg-blue-50 font-medium border-t border-gray-100 flex items-center justify-center gap-2"
            >
                <Search className="w-4 h-4" />
                Search for &#34;{query}&#34;
            </button>
        </div>
    );
}