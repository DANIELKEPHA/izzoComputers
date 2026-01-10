"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useGetProductsQuery, useGetCategoriesQuery } from "@/state/api";
import BreadCrumb from "@/components/BreadCrumb";
import ProductGrid from "@/app/(nondashboard)/shop/components/ProductGrid";
import FiltersSidebar from "@/app/(nondashboard)/shop/components/FiltersSidebar";
import { Filter, X } from "lucide-react";
import FeaturesSection from "@/app/(nondashboard)/landing/FeaturesSection";
import Footer from "@/app/(nondashboard)/landing/FooterSection";

interface ShopPageProps {
    initialCategorySlug?: string;
}

export default function ShopPage({ initialCategorySlug }: ShopPageProps = {}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const urlSearchQuery = searchParams.get("q") || undefined;
    const urlPriceMin = searchParams.get("priceMin") ? Number(searchParams.get("priceMin")) : undefined;
    const urlPriceMax = searchParams.get("priceMax") ? Number(searchParams.get("priceMax")) : undefined;

    const [priceRange, setPriceRange] = useState<[number, number]>([
        urlPriceMin || 0,
        urlPriceMax || 5000,
    ]);

    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    useEffect(() => {
        setPriceRange([urlPriceMin || 0, urlPriceMax || 5000]);
    }, [urlPriceMin, urlPriceMax]);

    const { data: categories = [], isLoading: categoriesLoading } = useGetCategoriesQuery();

    const currentCategory = initialCategorySlug
        ? categories.find(
            (cat: any) => cat.slug.toLowerCase() === initialCategorySlug.toLowerCase()
        )
        : null;

    const activeCategoryId =
        currentCategory?.id ||
        (searchParams.get("categoryId") ? Number(searchParams.get("categoryId")) : undefined);

    const { data, isLoading, isFetching } = useGetProductsQuery({
        search: urlSearchQuery,
        categoryId: activeCategoryId,
        priceMin: urlPriceMin,
        priceMax: urlPriceMax,
        page: 1,
        pageSize: 20,
    });

    const products = data?.products || [];

    const updateSearchParams = (updates: Record<string, string | number | undefined>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value === undefined || value === "" || value === null) {
                params.delete(key);
            } else {
                params.set(key, String(value));
            }
        });
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const handleCategoryChange = (categoryId: number, checked: boolean) => {
        const category = categories.find((c: any) => c.id === categoryId);
        if (!category) return;

        if (checked) {
            router.push(`/shop/categories/${category.slug}`);
            setPriceRange([0, 5000]);
        } else {
            router.push("/shop");
        }
    };

    const applyPriceFilter = () => {
        const [min, max] = priceRange;
        if (min === 0 && max === 5000) {
            updateSearchParams({ priceMin: undefined, priceMax: undefined });
        } else {
            updateSearchParams({
                priceMin: min,
                priceMax: max > min ? max : min + 1,
            });
        }
    };

    const clearAllFilters = () => {
        const basePath = initialCategorySlug
            ? `/shop/categories/${initialCategorySlug}`
            : "/shop";
        router.push(basePath);
        setPriceRange([0, 5000]);
    };

    const breadcrumbItems = [
        { label: "Home", href: "/" },
        { label: "Shop", href: "/shop" },
        ...(currentCategory ? [{ label: currentCategory.name }] : []),
    ];

    return (
        <>
            {/* Main Shop Content - Fixed height to account for navbar */}
            <div
                className="min-h-screen bg-gray-50"
                // style={{ paddingTop: `${NAVBAR_HEIGHT}px` }}
            >
                <div className="p-2 space-y-8">
                    {/* Header with Breadcrumb */}
                    <div className="bg-white border-b border-gray-200 py-6">
                        <div className="container mx-auto px-4">
                            <BreadCrumb items={breadcrumbItems} />
                            <div className="flex items-center justify-between gap-4 mt-6">
                                {(activeCategoryId || urlPriceMin || urlPriceMax || urlSearchQuery) && (
                                    <button
                                        onClick={clearAllFilters}
                                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                                    >
                                        <X className="w-4 h-4" />
                                        Clear all filters
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsMobileFilterOpen(true)}
                                    className="lg:hidden flex items-center gap-2 border border-gray-300 rounded-md px-4 py-2"
                                >
                                    <Filter className="w-4 h-4" />
                                    Filters
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Layout: Sidebar + Product Grid */}
                    <div className="flex w-full gap-8 container mx-auto px-4">
                        <FiltersSidebar
                            categories={categories}
                            categoriesLoading={categoriesLoading}
                            activeCategoryId={activeCategoryId}
                            priceRange={priceRange}
                            setPriceRange={setPriceRange}
                            applyPriceFilter={applyPriceFilter}
                            handleCategoryChange={handleCategoryChange}
                            isMobileOpen={isMobileFilterOpen}
                            onMobileClose={() => setIsMobileFilterOpen(false)}
                        />

                        <ProductGrid
                            products={products}
                            isLoading={isLoading}
                            isFetching={isFetching}
                            urlSearchQuery={urlSearchQuery}
                            urlPriceMin={urlPriceMin}
                            urlPriceMax={urlPriceMax}
                            updateSearchParams={updateSearchParams}
                            clearAllFilters={clearAllFilters}
                        />
                    </div>
                </div>

                <FeaturesSection />

                <Footer />
            </div>
        </>
    );
}