"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
    Loader2,
    Search,
    Package,
    ArrowLeft,
    HeartOff,
} from "lucide-react";
import { toast } from "sonner";

import {
    useGetProductsQuery,
    useGetCategoriesQuery,
    useAddFavoriteProductMutation,
    useRemoveFavoriteProductMutation,
    useGetAuthUserQuery,
} from "@/state/api";
import ProductCard from "@/components/Card";

const PAGE_SIZES = [12, 24, 36];

export default function FavoritesPage() {
    const router = useRouter();

    const { data: authUser, isLoading: authLoading } = useGetAuthUserQuery();
    const isLoggedIn = !!authUser;

    const [search, setSearch] = useState("");
    const [categoryId, setCategoryId] = useState<string>("all");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(12);

    const { data: categories = [] } = useGetCategoriesQuery();

    // Fetch favorites (onlyFavorites: true returns user's favorites if logged in)
    const {
        data: productsData,
        isLoading: productsLoading,
        refetch,
    } = useGetProductsQuery({
        search: search || undefined,
        categoryId: categoryId === "all" ? undefined : Number(categoryId),
        page,
        pageSize,
        onlyFavorites: true,
    });

    const [addFavorite] = useAddFavoriteProductMutation();
    const [removeFavorite] = useRemoveFavoriteProductMutation();

    const products = productsData?.products || [];
    const total = productsData?.total || 0;
    const totalPages = Math.ceil(total / pageSize);

    // === Guest Mode: localStorage fallback ===
    const [guestFavorites, setGuestFavorites] = useState<number[]>([]);

    useEffect(() => {
        if (!isLoggedIn) {
            const saved = localStorage.getItem("guestFavorites");
            if (saved) {
                setGuestFavorites(JSON.parse(saved));
            }
        }
    }, [isLoggedIn]);

    const handleRemoveFavorite = async (productId: number) => {
        if (isLoggedIn && authUser?.userInfo?.cognitoId) {
            try {
                await removeFavorite({
                    cognitoId: authUser.userInfo.cognitoId,
                    productId,
                }).unwrap();
                toast.success("Removed from favorites");
                refetch();
            } catch {
                toast.error("Failed to remove from favorites");
            }
        } else {
            // Guest mode
            const updated = guestFavorites.filter((id) => id !== productId);
            setGuestFavorites(updated);
            localStorage.setItem("guestFavorites", JSON.stringify(updated));
            toast.success("Removed from favorites");
            // Trigger re-render by updating query params (hack for guest)
            window.location.reload(); // or better: use client-side filtering
        }
    };

    if (authLoading || productsLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
                    <p className="mt-4 text-lg text-gray-600">Loading your favorites...</p>
                </div>
            </div>
        );
    }

    const displayedProducts = isLoggedIn ? products : []; // Guest: we'll simulate below

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-screen-2xl mx-auto p-4 md:p-8 space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.back()}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                                My Favorites
                            </h1>
                            <p className="text-gray-600 mt-1">
                                {isLoggedIn
                                    ? `${total} ${total === 1 ? "item" : "items"} saved`
                                    : `${guestFavorites.length} ${guestFavorites.length === 1 ? "item" : "items"} saved (guest)`}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Input
                                    placeholder="Search your favorites..."
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setPage(1);
                                    }}
                                    className="pl-11 text-lg"
                                />
                            </div>

                            <Select value={categoryId} onValueChange={(v) => {
                                setCategoryId(v);
                                setPage(1);
                            }}>
                                <SelectTrigger className="w-full md:w-64 text-lg">
                                    <SelectValue placeholder="All Categories" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {categories.map((cat: any) => (
                                        <SelectItem key={cat.id} value={cat.id.toString()}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Favorites Grid */}
                {displayedProducts.length === 0 && guestFavorites.length === 0 ? (
                    <div className="text-center py-20">
                        <HeartOff className="mx-auto h-32 w-32 text-gray-300 mb-8" />
                        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                            Your favorites list is empty
                        </h2>
                        <p className="text-gray-500 max-w-md mx-auto mb-8">
                            Start browsing and click the heart icon on products you love to save them here.
                        </p>
                        <Button size="lg" onClick={() => router.push("/shop")}>
                            Continue Shopping
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {displayedProducts.map((product) => (
                                <div key={product.id} className="relative">
                                    <ProductCard product={product} />
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        className="absolute top-4 right-4 z-10 opacity-0 hover:opacity-100 transition-opacity rounded-full shadow-lg"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleRemoveFavorite(product.id);
                                        }}
                                    >
                                        <HeartOff className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}

                            {/* Guest mode: show placeholder or fetch products by ID */}
                            {/* For full guest support, you'd need to fetch products by IDs from localStorage */}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-4 mt-12">
                                <Button
                                    variant="outline"
                                    disabled={page === 1}
                                    onClick={() => setPage(page - 1)}
                                >
                                    Previous
                                </Button>
                                <span className="text-sm font-medium">
                  Page {page} of {totalPages}
                </span>
                                <Button
                                    variant="outline"
                                    disabled={page === totalPages}
                                    onClick={() => setPage(page + 1)}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}