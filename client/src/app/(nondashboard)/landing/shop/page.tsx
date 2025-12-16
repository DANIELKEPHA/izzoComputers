"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useGetProductsQuery, useGetCategoriesQuery } from "@/state/api";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCard from "@/components/Card";
import { Filter, X, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdvertBanner from "@/app/(nondashboard)/landing/shop/AdvertBanner";

export default function ShopPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Read filters from URL
    const urlCategoryId = searchParams.get("categoryId") ? Number(searchParams.get("categoryId")) : undefined;
    const urlPriceMin = searchParams.get("priceMin") ? Number(searchParams.get("priceMin")) : undefined;
    const urlPriceMax = searchParams.get("priceMax") ? Number(searchParams.get("priceMax")) : undefined;

    // Local state for price slider
    const [priceRange, setPriceRange] = useState<[number, number]>([
        urlPriceMin || 0,
        urlPriceMax || 5000,
    ]);

    // Mobile filter state
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    // Sync priceRange with URL on mount
    useEffect(() => {
        setPriceRange([urlPriceMin || 0, urlPriceMax || 5000]);
    }, [urlPriceMin, urlPriceMax]);

    // Fetch categories
    const { data: categories = [], isLoading: categoriesLoading } = useGetCategoriesQuery();

    // Fetch products with current filters
    const { data, isLoading, isFetching } = useGetProductsQuery({
        categoryId: urlCategoryId,
        priceMin: urlPriceMin,
        priceMax: urlPriceMax,
        page: 1,
        pageSize: 20,
    });

    const products = data?.products || [];
    const total = data?.total || 0;

    // Update URL when filters change
    const updateSearchParams = (updates: Record<string, string | number | undefined>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value === undefined || value === "" || value === null) {
                params.delete(key);
            } else {
                params.set(key, String(value));
            }
        });
        router.push(`${pathname}?${params.toString()}`);
    };

    // Handle category change
    const handleCategoryChange = (categoryId: number, checked: boolean) => {
        if (checked) {
            updateSearchParams({ categoryId, priceMin: undefined, priceMax: undefined });
            setPriceRange([0, 5000]); // Reset price when changing category
        } else {
            updateSearchParams({ categoryId: undefined });
        }
    };

    // Handle price apply
    const applyPriceFilter = () => {
        const [min, max] = priceRange;
        if (min === 0 && max === 5000) {
            updateSearchParams({ priceMin: undefined, priceMax: undefined });
        } else {
            updateSearchParams({ priceMin: min, priceMax: max > min ? max : min + 1 });
        }
    };

    // Clear all filters
    const clearAllFilters = () => {
        updateSearchParams({
            categoryId: undefined,
            priceMin: undefined,
            priceMax: undefined,
        });
        setPriceRange([0, 5000]);
    };

    return (
        <div className="min-h-screen w-full bg-[#f5f5f5]">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                {/* FULL WIDTH BANNER */}
                <AdvertBanner categoryId={urlCategoryId} />

                {/* PAGE CONTENT CONTAINER */}
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between gap-4 py-4">
                        {/* Active filters */}
                        {(urlCategoryId || urlPriceMin || urlPriceMax) && (
                            <button
                                onClick={clearAllFilters}
                                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                            >
                                <X className="w-4 h-4" />
                                Clear all filters
                            </button>
                        )}

                        {/* Mobile filter button */}
                        <Button
                            variant="outline"
                            className="lg:hidden flex items-center gap-2 border-gray-300"
                            onClick={() => setIsMobileFilterOpen(true)}
                        >
                            <Filter className="w-4 h-4" />
                            Filters
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex w-full h-full">
                {/* Desktop Sidebar */}
                <aside className="w-72 flex-shrink-0 hidden lg:block border-r border-gray-200 bg-white">
                    <div className="p-6 space-y-8 sticky top-0 h-screen overflow-y-auto">
                        {/* Category Filter */}
                        <div>
                            <h3 className="font-bold text-gray-900 mb-4">Category</h3>
                            {categoriesLoading ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map((i) => (
                                        <Skeleton key={i} className="h-6 w-full rounded" />
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {categories.map((category) => (
                                        <div key={category.id} className="flex items-center space-x-3">
                                            <Checkbox
                                                id={`category-${category.id}`}
                                                checked={urlCategoryId === category.id}
                                                onCheckedChange={(checked) =>
                                                    handleCategoryChange(category.id, checked as boolean)
                                                }
                                                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                            />
                                            <Label
                                                htmlFor={`category-${category.id}`}
                                                className="text-sm font-medium cursor-pointer hover:text-blue-600 flex-1 py-2"
                                            >
                                                {category.name}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Price Filter */}
                        <div className="border-t border-gray-200 pt-6">
                            <h3 className="font-bold text-gray-900 mb-4">Price Range (KES)</h3>
                            <div className="space-y-6">
                                <Slider
                                    value={priceRange}
                                    onValueChange={(value) => setPriceRange(value as [number, number])}
                                    onValueCommit={applyPriceFilter}
                                    max={5000}
                                    min={0}
                                    step={50}
                                    className="w-full"
                                />
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <Label htmlFor="min-price" className="text-xs text-gray-500 mb-1 block">Min</Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">KSh</span>
                                            <Input
                                                id="min-price"
                                                type="number"
                                                value={priceRange[0]}
                                                onChange={(e) =>
                                                    setPriceRange([Number(e.target.value), priceRange[1]])
                                                }
                                                onBlur={applyPriceFilter}
                                                className="pl-12"
                                                min={0}
                                                max={priceRange[1]}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <Label htmlFor="max-price" className="text-xs text-gray-500 mb-1 block">Max</Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">KSh</span>
                                            <Input
                                                id="max-price"
                                                type="number"
                                                value={priceRange[1]}
                                                onChange={(e) =>
                                                    setPriceRange([priceRange[0], Number(e.target.value)])
                                                }
                                                onBlur={applyPriceFilter}
                                                className="pl-12"
                                                min={priceRange[0]}
                                                max={10000}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    onClick={applyPriceFilter}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md py-2"
                                >
                                    Apply Price Filter
                                </Button>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Mobile Filter Overlay */}
                {isMobileFilterOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileFilterOpen(false)} />
                        <div className="absolute left-0 top-0 bottom-0 w-80 bg-white overflow-y-auto p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-lg text-gray-900">Filters</h3>
                                <button
                                    onClick={() => setIsMobileFilterOpen(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Mobile Category Filter */}
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-4">Category</h3>
                                    <div className="space-y-3">
                                        {categories.map((category) => (
                                            <div key={category.id} className="flex items-center space-x-3">
                                                <Checkbox
                                                    id={`mobile-category-${category.id}`}
                                                    checked={urlCategoryId === category.id}
                                                    onCheckedChange={(checked) => {
                                                        handleCategoryChange(category.id, checked as boolean);
                                                        setIsMobileFilterOpen(false);
                                                    }}
                                                />
                                                <Label
                                                    htmlFor={`mobile-category-${category.id}`}
                                                    className="text-sm font-medium cursor-pointer hover:text-blue-600 flex-1 py-2"
                                                >
                                                    {category.name}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Mobile Price Filter */}
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-4">Price Range</h3>
                                    <div className="space-y-4">
                                        <Slider
                                            value={priceRange}
                                            onValueChange={(value) => setPriceRange(value as [number, number])}
                                            max={5000}
                                            min={0}
                                            step={50}
                                            className="w-full"
                                        />
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex-1">
                                                <Input
                                                    type="number"
                                                    value={priceRange[0]}
                                                    onChange={(e) =>
                                                        setPriceRange([Number(e.target.value), priceRange[1]])
                                                    }
                                                    className="w-full"
                                                    min={0}
                                                    max={priceRange[1]}
                                                />
                                            </div>
                                            <span className="text-gray-500">to</span>
                                            <div className="flex-1">
                                                <Input
                                                    type="number"
                                                    value={priceRange[1]}
                                                    onChange={(e) =>
                                                        setPriceRange([priceRange[0], Number(e.target.value)])
                                                    }
                                                    className="w-full"
                                                    min={priceRange[0]}
                                                    max={10000}
                                                />
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() => {
                                                applyPriceFilter();
                                                setIsMobileFilterOpen(false);
                                            }}
                                            className="w-full"
                                        >
                                            Apply
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="flex-1 p-4 lg:p-6">
                    {/* Active Filters Display */}
                    {(urlCategoryId || urlPriceMin || urlPriceMax) && (
                        <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                            <div className="flex flex-wrap gap-2">
                                {urlCategoryId && (
                                    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                                        Category: {categories.find(c => c.id === urlCategoryId)?.name}
                                        <button
                                            onClick={() => updateSearchParams({ categoryId: undefined })}
                                            className="ml-1 hover:bg-blue-100 rounded-full p-0.5"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                )}
                                {(urlPriceMin || urlPriceMax) && (
                                    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                                        Price: KSh {urlPriceMin || 0} - KSh {urlPriceMax || 5000}
                                        <button
                                            onClick={() => updateSearchParams({ priceMin: undefined, priceMax: undefined })}
                                            className="ml-1 hover:bg-blue-100 rounded-full p-0.5"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Product Grid */}
                    {isLoading ? (
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
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                                <p className="text-gray-600 mb-6">
                                    Try adjusting your filters or browse other categories
                                </p>
                                <Button
                                    onClick={clearAllFilters}
                                    variant="outline"
                                    className="border-blue-600 text-blue-600 hover:bg-blue-50"
                                >
                                    Clear all filters
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}