"use client";

import React from "react";
import ProductCard from "@/components/Card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";

interface ProductGridProps {
    products: any[];
    isLoading: boolean;
    isFetching: boolean;
    urlSearchQuery?: string;
    urlPriceMin?: number;
    urlPriceMax?: number;
    updateSearchParams: (updates: Record<string, any>) => void;
    clearAllFilters: () => void;
}

export default function ProductGrid({
                                        products,
                                        isLoading,
                                        isFetching,
                                        urlSearchQuery,
                                        urlPriceMin,
                                        urlPriceMax,
                                        updateSearchParams,
                                        clearAllFilters,
                                    }: ProductGridProps) {
    const hasActiveFilters = !!urlSearchQuery || !!urlPriceMin || !!urlPriceMax;

    return (
        <div className="flex-1 p-4 lg:p-6">
            {/* Active Filter Chips */}
            {hasActiveFilters && (
                <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex flex-wrap gap-2">
                        {urlSearchQuery && (
                            <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                Search: &#34;{urlSearchQuery}&#34;
                <button onClick={() => updateSearchParams({ q: undefined })}>
                  <X className="w-3 h-3" />
                </button>
              </span>
                        )}
                        {(urlPriceMin !== undefined || urlPriceMax !== undefined) && (
                            <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                Price: KSh {urlPriceMin ?? 0} - KSh {urlPriceMax ?? 5000}
                                <button
                                    onClick={() =>
                                        updateSearchParams({ priceMin: undefined, priceMax: undefined })
                                    }
                                >
                  <X className="w-3 h-3" />
                </button>
              </span>
                        )}
                    </div>
                </div>
            )}

            {/* Product Grid */}
            {isLoading || isFetching ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <Skeleton key={i} className="h-[420px] w-full rounded-lg" />
                    ))}
                </div>
            ) : products.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <div className="max-w-md mx-auto">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Filter className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            No products found
                        </h3>
                        <p className="text-gray-600 mb-6">Try adjusting your filters</p>
                        <Button onClick={clearAllFilters} variant="outline">
                            Clear Filters
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product: any) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
}