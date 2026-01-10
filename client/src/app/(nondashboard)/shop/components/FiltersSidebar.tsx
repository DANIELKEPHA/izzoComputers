"use client";

import React, { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { X, Filter, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FiltersSidebarProps {
    categories: any[];
    categoriesLoading: boolean;
    activeCategoryId?: number;
    priceRange: [number, number];
    setPriceRange: (value: [number, number]) => void;
    applyPriceFilter: () => void;
    handleCategoryChange: (categoryId: number, checked: boolean) => void;
    isMobileOpen: boolean;
    onMobileClose: () => void;
}

export default function FiltersSidebar({
                                           categories,
                                           categoriesLoading,
                                           activeCategoryId,
                                           priceRange,
                                           setPriceRange,
                                           applyPriceFilter,
                                           handleCategoryChange,
                                           isMobileOpen,
                                           onMobileClose,
                                       }: FiltersSidebarProps) {
    const [expandedSections, setExpandedSections] = useState({
        category: true,
        price: true,
    });
    const [activeFiltersCount, setActiveFiltersCount] = useState(0);

    useEffect(() => {
        let count = 0;
        if (activeCategoryId) count++;
        if (priceRange[0] > 0 || priceRange[1] < 5000) count++;
        setActiveFiltersCount(count);
    }, [activeCategoryId, priceRange]);

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const resetFilters = () => {
        setPriceRange([0, 5000]);
        applyPriceFilter();
        // Note: You might need a function to reset categories too
    };

    const sidebarContent = (
        <div className="p-6 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-blue-600" />
                    <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                    {activeFiltersCount > 0 && (
                        <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700">
                            {activeFiltersCount} active
                        </Badge>
                    )}
                </div>
                {activeFiltersCount > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetFilters}
                        className="text-gray-500 hover:text-gray-700 text-sm"
                    >
                        Clear all
                    </Button>
                )}
            </div>

            {/* Category Filter */}
            <div className="border border-gray-100 rounded-xl bg-gray-50/50 p-4">
                <button
                    onClick={() => toggleSection('category')}
                    className="flex items-center justify-between w-full mb-2"
                >
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 text-lg">Categories</h3>
                        <Sparkles className="w-4 h-4 text-blue-500" />
                    </div>
                    {expandedSections.category ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                </button>

                {expandedSections.category && (
                    <div className="pt-2">
                        {categoriesLoading ? (
                            <div className="space-y-3">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <Skeleton key={i} className="h-10 w-full rounded-lg" />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                                {categories.map((category: any) => (
                                    <div
                                        key={category.id}
                                        className={`
                                            flex items-center space-x-3 p-3 rounded-lg transition-all duration-200
                                            ${activeCategoryId === category.id
                                            ? 'bg-white border border-blue-200 shadow-sm'
                                            : 'hover:bg-white hover:border hover:border-gray-200'
                                        }
                                        `}
                                    >
                                        <div className="relative">
                                            <Checkbox
                                                id={`category-${category.id}`}
                                                checked={activeCategoryId === category.id}
                                                onCheckedChange={(checked) =>
                                                    handleCategoryChange(category.id, checked as boolean)
                                                }
                                                className={`
                                                    data-[state=checked]:bg-blue-600 
                                                    data-[state=checked]:border-blue-600
                                                `}
                                            />
                                        </div>
                                        <Label
                                            htmlFor={`category-${category.id}`}
                                            className="text-sm font-medium cursor-pointer flex-1 py-1 text-gray-700"
                                        >
                                            {category.name}
                                        </Label>
                                        <Badge
                                            variant="outline"
                                            className="text-xs font-normal text-gray-500"
                                        >
                                            {category.count || 0}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Price Filter */}
            <div className="border border-gray-100 rounded-xl bg-gray-50/50 p-4">
                <button
                    onClick={() => toggleSection('price')}
                    className="flex items-center justify-between w-full mb-2"
                >
                    <h3 className="font-semibold text-gray-900 text-lg">Price Range</h3>
                    {expandedSections.price ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                </button>

                {expandedSections.price && (
                    <div className="pt-2 space-y-6">
                        {/* Price Range Display */}
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                                <div className="text-center">
                                    <p className="text-xs text-gray-500 mb-1">Min Price</p>
                                    <p className="text-lg font-bold text-gray-900">KSh {priceRange[0]}</p>
                                </div>
                                <div className="w-8 h-px bg-gray-300" />
                                <div className="text-center">
                                    <p className="text-xs text-gray-500 mb-1">Max Price</p>
                                    <p className="text-lg font-bold text-gray-900">KSh {priceRange[1]}</p>
                                </div>
                            </div>

                            <Slider
                                value={priceRange}
                                onValueChange={(value) => setPriceRange(value as [number, number])}
                                onValueCommit={applyPriceFilter}
                                max={5000}
                                min={0}
                                step={100}
                                className="w-full [&>span]:h-2 [&>span]:bg-gray-200 [&>span>span]:bg-blue-600"
                            />
                        </div>

                        {/* Price Inputs */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Minimum</Label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                                        KSh
                                    </div>
                                    <Input
                                        type="number"
                                        value={priceRange[0]}
                                        onChange={(e) => {
                                            const value = Math.max(0, Math.min(Number(e.target.value), priceRange[1]));
                                            setPriceRange([value, priceRange[1]]);
                                        }}
                                        onBlur={applyPriceFilter}
                                        onKeyDown={(e) => e.key === 'Enter' && applyPriceFilter()}
                                        className="pl-12 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                        min={0}
                                        max={priceRange[1]}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Maximum</Label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                                        KSh
                                    </div>
                                    <Input
                                        type="number"
                                        value={priceRange[1]}
                                        onChange={(e) => {
                                            const value = Math.min(5000, Math.max(Number(e.target.value), priceRange[0]));
                                            setPriceRange([priceRange[0], value]);
                                        }}
                                        onBlur={applyPriceFilter}
                                        onKeyDown={(e) => e.key === 'Enter' && applyPriceFilter()}
                                        className="pl-12 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                        min={priceRange[0]}
                                        max={10000}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <Button
                                onClick={applyPriceFilter}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg"
                            >
                                Apply Price
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setPriceRange([0, 5000]);
                                    applyPriceFilter();
                                }}
                                className="py-3 rounded-lg border-gray-300"
                            >
                                Reset
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="w-80 flex-shrink-0 hidden lg:block border-r border-gray-200 bg-white sticky top-0 max-h-screen overflow-y-auto shadow-sm">

                {sidebarContent}
                <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
                    <Button
                        onClick={applyPriceFilter}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 rounded-lg shadow-sm"
                    >
                        Apply All Filters
                    </Button>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 z-50 lg:hidden bg-black/60 backdrop-blur-sm transition-all duration-300"
                    onClick={onMobileClose}
                >
                    <div
                        className="absolute left-0 top-0 bottom-0 w-full max-w-sm bg-white overflow-y-auto shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Mobile Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 z-20">
                            <div className="flex items-center justify-between p-6">
                                <div>
                                    <h3 className="font-bold text-xl text-gray-900">Filters</h3>
                                    {activeFiltersCount > 0 && (
                                        <p className="text-sm text-blue-600 mt-1">{activeFiltersCount} filter(s) active</p>
                                    )}
                                </div>
                                <button
                                    onClick={onMobileClose}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="w-6 h-6 text-gray-600" />
                                </button>
                            </div>
                        </div>

                        {/* Mobile Content */}
                        <div className="p-6">
                            {sidebarContent}
                        </div>

                        {/* Mobile Footer */}
                        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 shadow-lg">
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        resetFilters();
                                        onMobileClose();
                                    }}
                                    className="flex-1 py-3 rounded-lg border-gray-300"
                                >
                                    Clear All
                                </Button>
                                <Button
                                    onClick={() => {
                                        applyPriceFilter();
                                        onMobileClose();
                                    }}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg"
                                >
                                    Show Results
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}