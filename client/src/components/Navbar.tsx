"use client";

import { NAVBAR_HEIGHT } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { useGetAuthUserQuery, useGetCategoriesQuery } from "@/state/api";
import {useRouter, useSearchParams} from "next/navigation";
import { signOut } from "aws-amplify/auth";
import {
    Search,
    ShoppingCart,
    User,
    Heart,
    ChevronDown,
    ChevronRight,
    Package,
    Sparkles,
    ShoppingBag
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "./ui/hover-card";

import SearchSuggestions from "@/app/(nondashboard)/shop/SearchSuggestions";
import { useCart } from "@/hooks/useCart";
import { Separator } from "./ui/separator";
import DeliveryLocation from "@/components/DeliveryLocation";
import DeliveryLocationDropdown from "@/components/DeliveryLocation";

const Navbar = () => {
    const { data: authUser } = useGetAuthUserQuery();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { items, count, total, isLoading: cartLoading } = useCart();

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [favoritesCount, setFavoritesCount] = useState(0);
    const [isCartOpen, setIsCartOpen] = useState(false);

    const searchWrapperRef = useRef<HTMLDivElement>(null);

    // Fetch categories from API
    const {
        data: rawCategories = [],
        isLoading: categoriesLoading,
        isError: categoriesError,
    } = useGetCategoriesQuery();

    // Build categories list: always include "All" first
    const categories = [
        { id: "all", name: "All" },
        ...rawCategories.map((cat) => ({
            id: cat.id.toString(),
            name: cat.name,
        })),
    ];

    // Determine what to display in the dropdown trigger
    const displayCategoryText = categoriesLoading
        ? "Loading..."
        : categoriesError
            ? "Categories unavailable"
            : selectedCategory;

    // Load favorites count from localStorage (for guest users)
    useEffect(() => {
        const updateCount = () => {
            const saved = localStorage.getItem("guestFavorites");
            const count = saved ? JSON.parse(saved).length : 0;
            setFavoritesCount(count);
        };

        updateCount();
        window.addEventListener("storage", updateCount);
        window.addEventListener("favoritesUpdated", updateCount);

        return () => {
            window.removeEventListener("storage", updateCount);
            window.removeEventListener("favoritesUpdated", updateCount);
        };
    }, []);

    // Close search suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                searchWrapperRef.current &&
                !searchWrapperRef.current.contains(event.target as Node)
            ) {
                setSearchQuery("");
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const currentCategoryId = searchParams.get("categoryId");

        if (!currentCategoryId) {
            setSelectedCategory("All");
            return;
        }

        const matchingCat = categories.find((c) => c.id === currentCategoryId);

        setSelectedCategory(matchingCat ? matchingCat.name : "All");
    }, [searchParams, categories]);

    const handleSignOut = async () => {
        try {
            await signOut();
            window.location.href = "/";
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const handleCategorySelect = (categoryId: string, categoryName: string) => {
        setSelectedCategory(categoryName);

        if (categoryId === "all") {
            router.push("/shop");
            return;
        }

        // Otherwise → go to shop with categoryId
        router.push(`/shop?categoryId=${categoryId}`);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        const selectedCat = categories.find((c) => c.name === selectedCategory);
        const categoryParam = selectedCat && selectedCat.id !== "all" ? `&categoryId=${selectedCat.id}` : "";

        router.push(
            `/shop?q=${encodeURIComponent(searchQuery.trim())}${categoryParam}`
        );

        setSearchQuery("");
        setSelectedCategory("All");
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-KE", {
            style: "currency",
            currency: "KES",
            minimumFractionDigits: 0,
        }).format(price);
    };

    const getImageSrc = (product: any) => {
        // Check imageUrls array first
        if (product.imageUrls && Array.isArray(product.imageUrls) && product.imageUrls.length > 0) {
            return product.imageUrls[0];
        }
        // Check single imageUrl
        if (product.imageUrl && typeof product.imageUrl === 'string') {
            return product.imageUrl;
        }
        // Fallback
        return "/placeholder-laptop.jpg";
    };


    // Amazon-style cart widget component
    const CartWidget = () => (
        <HoverCard openDelay={200} closeDelay={100}>
            <HoverCardTrigger asChild>
                <Button
                    variant="ghost"
                    onClick={() => router.push("/cart")}
                    className="p-2.5 hover:bg-orange-50/50 rounded-lg relative group transition-all duration-300"
                >
                    {/* Professional cart icon with subtle badge */}
                    <div className="relative">
                        {/* Main cart icon */}
                        <ShoppingCart className="w-8 h-8 text-gray-700 group-hover:text-[#ff9900] transition-all duration-300" />

                        {/* Elegant badge - positioned to not overlap icon */}
                        {count > 0 && (
                            <span className="absolute -top-1.5 -right-2 w-5 h-5 bg-gradient-to-br from-red-500 to-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md border-2 border-white transition-transform duration-300 group-hover:scale-110">
                            {count > 99 ? "99+" : count}
                        </span>
                        )}

                        {/* Subtle pulse effect only on hover */}
                        {count > 0 && (
                            <div className="absolute -top-1.5 -right-2 w-5 h-5 bg-gradient-to-br from-red-500 to-orange-500 rounded-full opacity-0 group-hover:opacity-30 blur-[2px] transition-opacity duration-300" />
                        )}
                    </div>
                </Button>
            </HoverCardTrigger>

            <HoverCardContent
                className="w-80 p-0 rounded-xl shadow-lg border border-gray-100 bg-white"
                align="end"
                sideOffset={8}
            >
                {/* Mini Cart Preview */}
                <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <ShoppingBag className="w-5 h-5 text-[#ff9900]" />
                            <h3 className="font-bold text-gray-900">Shopping Cart</h3>
                        </div>
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-600">
                            {count} {count === 1 ? "item" : "items"}
                        </Badge>
                    </div>

                    {count === 0 ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <ShoppingCart className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-600 text-sm">Your cart is empty</p>
                            <Button
                                size="sm"
                                className="mt-4 bg-[#ff9900] hover:bg-[#ffad33] text-white w-full"
                                onClick={() => router.push("/shop")}
                            >
                                Start Shopping
                            </Button>
                        </div>
                    ) : (
                        <>
                            {/* Cart Items Preview */}
                            <div className="max-h-64 overflow-y-auto space-y-3 mb-4">
                                {items.slice(0, 3).map((item) => {
                                    const product = item.product;
                                    if (!product) return null;

                                    const itemPrice = typeof product.price.toNumber === "function"
                                        ? product.price.toNumber()
                                        : Number(product.price);
                                    const discount = product.discountPercent || 0;
                                    const finalPrice = discount > 0 ? itemPrice * (1 - discount / 100) : itemPrice;

                                    return (
                                        <div key={item.productId} className="flex gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                            <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                                                <Image
                                                    src={getImageSrc(product)}
                                                    alt={product.name}
                                                    width={64}
                                                    height={64}
                                                    className="object-contain w-full h-full p-1"
                                                    onError={(e) => {
                                                        e.currentTarget.src = "/placeholder-laptop.jpg";
                                                    }}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {product.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Qty: {item.quantity}
                                                </p>
                                                <p className="text-sm font-bold text-gray-900">
                                                    {formatPrice(finalPrice * item.quantity)}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}

                                {items.length > 3 && (
                                    <div className="text-center py-2">
                                        <p className="text-xs text-gray-500">
                                            +{items.length - 3} more items
                                        </p>
                                    </div>
                                )}
                            </div>

                            <Separator />

                            {/* Cart Summary */}
                            <div className="space-y-3 pt-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Subtotal:</span>
                                    <span className="font-bold text-gray-900">{formatPrice(total)}</span>
                                </div>

                                {/* Free Shipping Progress */}
                                {total < 20000 && (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-green-600 font-medium">
                                                Add {formatPrice(20000 - total)} for FREE shipping!
                                            </span>
                                            <span className="text-gray-500">
                                                {Math.round((total / 20000) * 100)}%
                                            </span>
                                        </div>
                                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full"
                                                style={{ width: `${Math.min((total / 20000) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                <Button
                                    className="w-full bg-gradient-to-r from-[#ff9900] to-[#ffad33] hover:from-[#ffad33] hover:to-[#ff9900] text-white font-bold py-2"
                                    onClick={() => router.push("/cart")}
                                >
                                    View Cart & Checkout
                                    <ChevronRight className="ml-2 w-4 h-4" />
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </HoverCardContent>
        </HoverCard>
    );

    return (
        <>
            <nav
                className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-white to-gray-50 border-b border-gray-200 shadow-sm"
                style={{ height: `${NAVBAR_HEIGHT}px` }}
            >
                <div className="h-full py-4 px-6 lg:px-8">
                    <div className="flex items-center justify-between max-w-7xl mx-auto">
                        {/* Logo */}
                        <Link href="/" className="flex-shrink-0">
                            <div className="relative group">
                                <Image
                                    src="/Izzo-computers-logo.png"
                                    alt="IzzoComputers Logo"
                                    width={200}
                                    height={94}
                                    className="h-auto hover:scale-105 transition-transform duration-200"
                                />
                                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#ff9900] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                        </Link>

                        {/*<div className="flex items-center ml-4 px-3 py-1.5 border border-gray-200 rounded-md hover:border-amber-500 transition-colors duration-150 bg-white shadow-sm">*/}
                        {/*    <DeliveryLocationDropdown />*/}
                        {/*</div>*/}

                        <div ref={searchWrapperRef} className="flex-1 max-w-2xl mx-8 relative">
                            <form
                                onSubmit={handleSearch}
                                className="flex w-full h-[48px] bg-white border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 focus-within:border-[#ff9900] focus-within:shadow-md focus-within:ring-2 focus-within:ring-orange-100"
                            >
                                {/* Categories Dropdown */}
                                <div className="relative">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button
                                                type="button"
                                                disabled={categoriesLoading || categoriesError}
                                                className="h-full px-4 bg-gradient-to-b from-gray-50 to-gray-100 border-r border-gray-200 text-sm text-gray-700 hover:from-gray-100 hover:to-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[100px] rounded-l-xl disabled:hover:from-gray-50 disabled:hover:to-gray-100 transition-all duration-200"
                                            >
                                                <span className="truncate font-medium">
                                                    {displayCategoryText}
                                                </span>
                                                {!categoriesLoading && !categoriesError && (
                                                    <ChevronDown className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                                                )}
                                                {(categoriesLoading || categoriesError) && (
                                                    <div className="w-3.5 h-3.5 flex items-center justify-center">
                                                        {categoriesLoading && (
                                                            <div className="w-2.5 h-2.5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                                        )}
                                                        {categoriesError && (
                                                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                                                        )}
                                                    </div>
                                                )}
                                            </button>
                                        </DropdownMenuTrigger>

                                        <DropdownMenuContent
                                            className="w-56 max-h-80 overflow-y-auto shadow-xl border border-gray-200 rounded-xl text-sm"
                                            align="start"
                                        >
                                            {categories.map((category) => (
                                                <DropdownMenuItem
                                                    key={category.id}
                                                    onSelect={() => handleCategorySelect(category.id, category.name)}
                                                    className="px-4 py-2.5 hover:bg-orange-50 hover:text-orange-700 cursor-pointer transition-colors duration-150 rounded-lg m-1"
                                                >
                                                    <span className="text-gray-700 hover:text-orange-700">{category.name}</span>
                                                </DropdownMenuItem>
                                            ))}
                                            {categories.length === 1 && !categoriesLoading && (
                                                <div className="px-4 py-3 text-gray-400 text-sm text-center italic border-t border-gray-100">
                                                    No categories available
                                                </div>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                {/* Search Input */}
                                <input
                                    type="text"
                                    placeholder="Search products, brands, and more..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="flex-1 px-4 text-sm text-gray-900 placeholder-gray-400 bg-transparent focus:outline-none focus:ring-0"
                                    autoComplete="off"
                                />

                                {/* Search Button */}
                                <button
                                    type="submit"
                                    className="h-full px-6 bg-gradient-to-r from-[#ff9900] to-[#ffad33] hover:from-[#ffad33] hover:to-[#ff9900] border-l border-orange-300/30 flex items-center justify-center transition-all duration-200 group rounded-r-xl"
                                >
                                    <Search className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                                </button>
                            </form>

                            {/* Search Suggestions Dropdown */}
                            {searchQuery.trim().length > 1 && (
                                <div className="absolute left-0 right-0 top-[52px] bg-white border-2 border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden backdrop-blur-sm bg-white/95">
                                    <div className="border-b border-gray-100 px-4 py-2">
                                        <p className="text-xs font-medium text-gray-500">Suggestions for &#34;{searchQuery.trim()}&#34;</p>
                                    </div>
                                    <SearchSuggestions
                                        query={searchQuery.trim()}
                                        onSelect={() => setSearchQuery("")}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Account, Favorites & Cart - SIMPLIFIED */}
                        <div className="flex items-center gap-2 lg:gap-4">
                            {/* Account - Simplified to just icon */}
                            {authUser ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            className="p-2 hover:bg-gray-100 rounded-xl group"
                                        >
                                            <User className="w-6 h-6 text-gray-700 group-hover:text-[#ff9900] transition-colors" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56 rounded-xl shadow-lg border border-gray-200">
                                        <div className="px-3 py-2 border-b border-gray-100">
                                            <p className="font-bold text-gray-900">
                                                {authUser.userInfo?.name}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {authUser.userInfo?.email}
                                            </p>
                                        </div>
                                        <DropdownMenuItem
                                            onClick={() => {
                                                if (authUser?.userInfo?.role === "admin") {
                                                    router.push("/admins/dashboard");
                                                } else {
                                                    router.push("/users/dashboard");
                                                }
                                            }}
                                            className="px-4 py-2.5 text-sm hover:bg-gray-100 cursor-pointer"
                                        >
                                            <Package className="w-4 h-4 mr-3" />
                                            Dashboard
                                        </DropdownMenuItem>

                                        <DropdownMenuItem
                                            onClick={() => router.push("/admins/settings")}
                                            className="px-4 py-2.5 text-sm hover:bg-gray-100 cursor-pointer"
                                        >
                                            <Sparkles className="w-4 h-4 mr-3" />
                                            My Settings
                                        </DropdownMenuItem>
                                        <Separator />
                                        <DropdownMenuItem
                                            onClick={handleSignOut}
                                            className="px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                                        >
                                            Sign Out
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <Button
                                    variant="ghost"
                                    onClick={() => router.push("/signin")}
                                    className="p-2 hover:bg-gray-100 rounded-xl group"
                                >
                                    <User className="w-6 h-6 text-gray-700 group-hover:text-[#ff9900] transition-colors" />
                                </Button>
                            )}

                            {/* Favorites - Simplified to just icon */}
                            <Button
                                variant="ghost"
                                onClick={() => router.push("/favorites")}
                                className="p-2 hover:bg-gray-100 rounded-xl relative group"
                            >
                                <Heart className="w-6 h-6 text-gray-700 group-hover:text-red-500 transition-colors" />
                                {favoritesCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-red-500 to-pink-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-sm border-2 border-white">
                                        {favoritesCount > 99 ? "99+" : favoritesCount}
                                    </span>
                                )}
                            </Button>

                            {/* Cart - Simplified to just icon with badge */}
                            <CartWidget />
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
};

// Simple Badge component for cart preview
const Badge = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <span className={`px-2 py-1 text-xs font-bold rounded-full text-white ${className}`}>
        {children}
    </span>
);

export default Navbar;