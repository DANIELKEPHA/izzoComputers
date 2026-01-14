"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
    Heart,
    ShoppingCart,
    Star,
    Shield,
    Truck,
    ChevronLeft,
    Share2,
    ArrowLeft,
    Minus,
    Plus,
    ChevronDown,
    ChevronUp,
    RotateCcw,
    Package,
    ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

import {
    useGetProductQuery,
    useAddToCartMutation,
    useGetRelatedProductsQuery,
    useGetProductReviewsQuery,
} from "@/state/api";

import ProductCard from "@/components/Card";
import { ProductDetailsResponse, ProductSpec } from "@/state";
import BreadCrumb from "@/components/BreadCrumb";
import {calculateRatingStats} from "@/lib/review-utils";
import ReviewSection from "@/app/(nondashboard)/shop/products/reviews/ReviewSection";

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const productId = parseInt(params.id as string);

    // State
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [isFavorited, setIsFavorited] = useState(false);
    const [showMoreSpecs, setShowMoreSpecs] = useState(false);

    // Pagination for related products
    const [page, setPage] = useState(1);
    const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
    const [hasMore, setHasMore] = useState(true);

    // Mutations
    const [addToCart, { isLoading: isAdding }] = useAddToCartMutation();

    // Fetch main product
    const {
        data: productData,
        isLoading,
        error,
    } = useGetProductQuery(productId) as {
        data: ProductDetailsResponse;
        isLoading: boolean;
        error: any;
    };

    // Fetch reviews for stats
    const { data: reviews = [] } = useGetProductReviewsQuery(productId);

    const product = productData?.product;
    const categoryId = product?.category?.id;

    // Initialize with related products from main query
    useEffect(() => {
        if (productData?.relatedProducts && relatedProducts.length === 0) {
            setRelatedProducts(productData.relatedProducts || []);
            // If we got fewer than 8, likely no more to load
            setHasMore((productData.relatedProducts?.length || 0) >= 8);
        }
    }, [productData?.relatedProducts]);

    // Fetch additional related products (page 2+)
    const {
        data: paginatedData,
        isFetching: isFetchingMore,
    } = useGetRelatedProductsQuery(
        {
            categoryId: categoryId!,
            page,
            pageSize: 8,
            inStock: "true",
            excludeProductId: productId,
        },
        {
            skip: !categoryId || page === 1 || !hasMore,
        }
    );

    // Append new products when fetched
    useEffect(() => {
        if (paginatedData && page > 1) {
            const newProducts = paginatedData.products || [];

            if (newProducts.length > 0) {
                setRelatedProducts((prev) => {
                    const existingIds = new Set(prev.map((p) => p.id));
                    const filtered = newProducts.filter((p: any) => !existingIds.has(p.id));
                    return [...prev, ...filtered];
                });
            }

            // Determine if there are more items
            const totalLoaded = relatedProducts.length + newProducts.length;
            const totalAvailable = paginatedData.total || 0;
            setHasMore(totalLoaded < totalAvailable && newProducts.length === 8);
        }
    }, [paginatedData, page, relatedProducts.length]);

    // Calculate rating distribution
    const { average } = calculateRatingStats(reviews);
    const averageRating = product?.averageRating
        ? (typeof product.averageRating === "number"
            ? product.averageRating
            : parseFloat(product.averageRating || "0"))
        : average;

    const loadMoreProducts = () => {
        if (!isFetchingMore && hasMore) {
            setPage((prev) => prev + 1);
        }
    };

    const breadcrumbItems = [
        { label: "Home", href: "/" },
        { label: "Shop", href: "/shop" },
        ...(product?.category
            ? [{ label: product.category.name, href: `/shop?categoryId=${product.category.id}` }]
            : []),
        { label: product?.name || "Product" },
    ];

    useEffect(() => {
        if (product) {
            const favorites = JSON.parse(localStorage.getItem("guestFavorites") || "[]");
            setIsFavorited(favorites.includes(product.id));
        }
    }, [product]);

    const toggleFavorite = () => {
        if (!product) return;
        const favorites = JSON.parse(localStorage.getItem("guestFavorites") || "[]");
        const id = product.id;
        if (favorites.includes(id)) {
            const updated = favorites.filter((fid: number) => fid !== id);
            localStorage.setItem("guestFavorites", JSON.stringify(updated));
            setIsFavorited(false);
        } else {
            favorites.push(id);
            localStorage.setItem("guestFavorites", JSON.stringify(favorites));
            setIsFavorited(true);
        }
    };

    const shareProduct = () => {
        if (navigator.share) {
            navigator.share({
                title: product?.name,
                text: `Check out this product: ${product?.name}`,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert("Link copied to clipboard!");
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-KE", {
            style: "currency",
            currency: "KES",
        }).format(price);
    };

    const handleAddToCart = async () => {
        if (!product || quantity < 1) return;
        try {
            await addToCart({ productId: product.id, quantity }).unwrap();
        } catch (err) {
            console.error("Failed to add to cart:", err);
        }
    };

    const handleBuyNow = async () => {
        if (!product || quantity < 1) return;
        try {
            await addToCart({ productId: product.id, quantity }).unwrap();
            router.push("/users/checkout");
        } catch (err) {
            console.error("Buy Now failed:", err);
            router.push("/users/checkout");
        }
    };

    const specs = product?.specs || [];
    const keySpecs = showMoreSpecs ? specs : specs.slice(0, 6);

    const images = product?.imageUrls?.filter(Boolean) || ["/placeholder-product.jpg"];

    const originalPrice = product?.price || 0;
    const discountPercent = product?.discountPercent || 0;
    const hasDiscount = discountPercent > 0;
    const discountedPrice = hasDiscount ? originalPrice * (1 - discountPercent / 100) : originalPrice;

    if (isLoading) {
        return <ProductDetailSkeleton />;
    }

    if (error || !product) {
        return (
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
                        <p className="text-gray-600 mb-8">
                            The product you&#39;re looking for doesn&#39;t exist or has been removed.
                        </p>
                        <Button onClick={() => router.push("/shop")} className="bg-blue-600 hover:bg-blue-700">
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            Back to Shop
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <BreadCrumb items={breadcrumbItems} />

            {/* Main Product Section */}
            <div className="container mx-auto px-4 py-4">
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <Button variant="ghost" onClick={() => router.back()} className="lg:hidden mb-4 -ml-2">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>

                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Images */}
                        <div>
                            <div className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden mb-4">
                                <Image
                                    src={images[selectedImageIndex] || "/placeholder-product.jpg"}
                                    alt={product.name}
                                    fill
                                    className="object-contain p-8"
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                    priority
                                />
                                {hasDiscount && (
                                    <div className="absolute top-4 left-4">
                                        <Badge className="bg-red-600 text-white px-3 py-1 text-sm font-bold">
                                            {discountPercent}% OFF
                                        </Badge>
                                    </div>
                                )}
                                {product.stock < 10 && product.stock > 0 && (
                                    <div className="absolute top-4 right-4">
                                        <Badge className="bg-orange-500 text-white px-3 py-1 text-sm">
                                            Only {product.stock} left
                                        </Badge>
                                    </div>
                                )}
                            </div>

                            {images.length > 1 && (
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {images.map((img: string, index: number) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedImageIndex(index)}
                                            className={`flex-shrink-0 relative w-20 h-20 rounded-md border-2 overflow-hidden ${
                                                selectedImageIndex === index ? "border-blue-600" : "border-gray-200"
                                            }`}
                                        >
                                            <Image src={img} alt={`${product.name} view ${index + 1}`} fill className="object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>

                            {product.brand && (
                                <p className="text-gray-600 mb-4">
                                    Brand: <span className="font-medium">{product.brand}</span>
                                </p>
                            )}

                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-5 h-5 ${
                                                i < Math.floor(averageRating || 0)
                                                    ? "fill-yellow-400 text-yellow-400"
                                                    : "text-gray-300"
                                            }`}
                                        />
                                    ))}
                                </div>
                                <span className="text-blue-600 font-medium">
                                    {averageRating.toFixed(1)}
                                </span>
                                <Separator orientation="vertical" className="h-4" />
                                <button
                                    onClick={() => document.getElementById("reviews")?.scrollIntoView()}
                                    className="text-blue-600 hover:underline"
                                >
                                    {product.reviewCount || reviews.length || 0} ratings
                                </button>
                                <Separator orientation="vertical" className="h-4" />
                                <span className="text-gray-600">{product.soldCount || 0} sold</span>
                            </div>

                            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-baseline gap-3 mb-2">
                                    <span className="text-3xl font-bold text-gray-900">
                                        {formatPrice(hasDiscount ? discountedPrice : originalPrice)}
                                    </span>
                                    {hasDiscount && (
                                        <>
                                            <span className="text-xl text-gray-500 line-through">{formatPrice(originalPrice)}</span>
                                            <Badge className="bg-red-100 text-red-800 px-2 py-1">
                                                Save {formatPrice(originalPrice - discountedPrice)}
                                            </Badge>
                                        </>
                                    )}
                                </div>
                                {hasDiscount && (
                                    <p className="text-green-600 font-medium">
                                        You save {discountPercent}% ({formatPrice(originalPrice - discountedPrice)})
                                    </p>
                                )}
                            </div>

                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-900 mb-3">Quantity:</h3>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center border border-gray-300 rounded-md">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            disabled={quantity <= 1}
                                            className="h-10 w-10 rounded-none"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </Button>
                                        <Input
                                            type="number"
                                            value={quantity}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value);
                                                if (!isNaN(val) && val >= 1 && val <= (product.stock || 10)) {
                                                    setQuantity(val);
                                                }
                                            }}
                                            className="w-16 text-center border-0 focus-visible:ring-0"
                                            min={1}
                                            max={product.stock || 10}
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setQuantity(Math.min(product.stock || 10, quantity + 1))}
                                            disabled={quantity >= (product.stock || 10)}
                                            className="h-10 w-10 rounded-none"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <span className="text-gray-600">{product.stock} available</span>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 mb-8">
                                <Button
                                    size="lg"
                                    className="flex-1 bg-[#FFD814] hover:bg-[#F7CA00] text-gray-900 font-semibold py-6"
                                    onClick={handleAddToCart}
                                    disabled={isAdding || product.stock === 0}
                                >
                                    <ShoppingCart className="w-5 h-5 mr-2" />
                                    {isAdding ? "Adding..." : "Add to Cart"}
                                </Button>
                                <Button
                                    size="lg"
                                    className="flex-1 bg-[#FFA41C] hover:bg-[#FA8900] text-gray-900 font-semibold py-6"
                                    onClick={handleBuyNow}
                                    disabled={isAdding || product.stock === 0}
                                >
                                    Buy Now
                                </Button>
                                <Button variant="outline" size="icon" onClick={toggleFavorite} className="h-14 w-14">
                                    <Heart className={`w-6 h-6 ${isFavorited ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
                                </Button>
                            </div>

                            <Card className="p-4 mb-6">
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <Truck className="w-5 h-5 text-gray-600 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-gray-900">Free Delivery</p>
                                            <p className="text-sm text-gray-600">Delivery within 3-7 business days</p>
                                            <button className="text-sm text-blue-600 hover:underline mt-1">
                                                Enter your location for delivery options
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <RotateCcw className="w-5 h-5 text-gray-600 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-gray-900">Free Returns</p>
                                            <p className="text-sm text-gray-600">30-day return policy. Free return shipping.</p>
                                        </div>
                                    </div>
                                    {product.warranty && (
                                        <div className="flex items-start gap-3">
                                            <Shield className="w-5 h-5 text-gray-600 mt-0.5" />
                                            <div>
                                                <p className="font-semibold text-gray-900">Warranty</p>
                                                <p className="text-sm text-gray-600">{product.warranty}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Card>

                            <div className="flex items-center gap-4">
                                <Button variant="ghost" onClick={shareProduct} className="text-gray-600 hover:text-gray-900">
                                    <Share2 className="w-4 h-4 mr-2" />
                                    Share
                                </Button>
                                {product.sku && <span className="text-sm text-gray-500">SKU: {product.sku}</span>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow-sm mb-8 overflow-hidden">
                    <Tabs defaultValue="description" className="w-full">
                        <TabsList className="w-full justify-start border-b rounded-none h-14 px-6 bg-gray-50">
                            <TabsTrigger value="description" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                Description
                            </TabsTrigger>
                            <TabsTrigger value="specifications" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                Specifications
                            </TabsTrigger>
                            <TabsTrigger
                                value="reviews"
                                id="reviews"
                                className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
                            >
                                Reviews ({product.reviewCount || reviews.length || 0})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="description" className="p-6">
                            <div className="prose max-w-none">
                                <p className="text-gray-700 whitespace-pre-line">
                                    {product.description || "No description available."}
                                </p>
                            </div>
                        </TabsContent>

                        <TabsContent value="specifications" className="p-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-4">Product Details</h3>
                                    <dl className="space-y-3">
                                        {keySpecs.map((spec: ProductSpec, index: number) => (
                                            <div key={index} className="grid grid-cols-2 gap-4 py-2 border-b border-gray-100">
                                                <dt className="text-gray-600 font-medium">{spec.key}</dt>
                                                <dd className="text-gray-900">{spec.value}</dd>
                                            </div>
                                        ))}
                                    </dl>
                                    {specs.length > 6 && (
                                        <Button
                                            variant="ghost"
                                            onClick={() => setShowMoreSpecs(!showMoreSpecs)}
                                            className="mt-4 text-blue-600 hover:text-blue-700"
                                        >
                                            {showMoreSpecs ? (
                                                <>
                                                    <ChevronUp className="w-4 h-4 mr-2" /> Show Less
                                                </>
                                            ) : (
                                                <>
                                                    <ChevronDown className="w-4 h-4 mr-2" /> Show More Specifications
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>

                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-4">Additional Information</h3>
                                    <div className="space-y-4">
                                        {product.category && (
                                            <div>
                                                <span className="text-gray-600">Category:</span>
                                                <span className="ml-2 text-gray-900">{product.category.name}</span>
                                            </div>
                                        )}
                                        {product.weight && (
                                            <div>
                                                <span className="text-gray-600">Weight:</span>
                                                <span className="ml-2 text-gray-900">{product.weight} kg</span>
                                            </div>
                                        )}
                                        {product.dimensions && (
                                            <div>
                                                <span className="text-gray-600">Dimensions:</span>
                                                <span className="ml-2 text-gray-900">{product.dimensions}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="reviews" className="p-0 border-0">
                            {product && (
                                <div className="p-6">
                                    <ReviewSection
                                        productId={product.id}
                                        averageRating={averageRating}
                                        reviewCount={product.reviewCount || reviews.length || 0}
                                    />
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Related Products with Load More */}
                {relatedProducts.length > 0 && (
                    <div className="mb-12">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Related Products</h2>
                            <Link
                                href={`/shop?categoryId=${product.category?.id}`}
                                className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                            >
                                View All <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedProducts.map((relatedProduct) => (
                                <ProductCard key={relatedProduct.id} product={relatedProduct} />
                            ))}
                        </div>

                        {/* Load More Button */}
                        {hasMore && (
                            <div className="text-center mt-12">
                                <Button
                                    onClick={loadMoreProducts}
                                    disabled={isFetchingMore}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 rounded-full text-lg font-semibold"
                                    size="lg"
                                >
                                    {isFetchingMore ? (
                                        <>
                                            <div className="w-5 h-5 animate-spin rounded-full border-2 border-white border-t-transparent inline-block mr-3" />
                                            Loading more...
                                        </>
                                    ) : (
                                        <>
                                            <ChevronDown className="w-5 h-5 mr-2" />
                                            Load More
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}

                        {/* No More Products */}
                        {!hasMore && relatedProducts.length > 8 && (
                            <div className="text-center mt-12 py-12 bg-gray-50 rounded-lg">
                                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">That&#39;s all!</h3>
                                <p className="text-gray-600 mb-6">You&#39;ve seen all related products in this category.</p>
                                <Link href={`/shop?categoryId=${product.category?.id}`}>
                                    <Button className="bg-blue-600 hover:bg-blue-700">Browse More in {product.category?.name}</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Mobile Bottom Bar */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="flex-1">
                        <div className="flex items-baseline gap-2">
                            <span className="text-xl font-bold text-gray-900">
                                {formatPrice(hasDiscount ? discountedPrice : originalPrice)}
                            </span>
                            {hasDiscount && <span className="text-sm text-gray-500 line-through">{formatPrice(originalPrice)}</span>}
                        </div>
                        <p className="text-xs text-green-600">In Stock</p>
                    </div>
                    <Button
                        size="lg"
                        className="flex-1 bg-[#FFD814] hover:bg-[#F7CA00] text-gray-900 font-semibold"
                        onClick={handleAddToCart}
                        disabled={isAdding || product.stock === 0}
                    >
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        {isAdding ? "Adding..." : "Add to Cart"}
                    </Button>
                    <Button
                        size="lg"
                        className="flex-1 bg-[#FFA41C] hover:bg-[#FA8900] text-gray-900 font-semibold"
                        onClick={handleBuyNow}
                        disabled={isAdding || product.stock === 0}
                    >
                        Buy Now
                    </Button>
                </div>
            </div>
        </div>
    );
}

function ProductDetailSkeleton() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="grid lg:grid-cols-2 gap-8">
                        <div>
                            <Skeleton className="aspect-square w-full rounded-lg mb-4" />
                            <div className="flex gap-2">
                                {[...Array(4)].map((_, i) => (
                                    <Skeleton key={i} className="w-20 h-20 rounded-md" />
                                ))}
                            </div>
                        </div>
                        <div className="space-y-6">
                            <Skeleton className="h-8 w-3/4" />
                            <Skeleton className="h-6 w-1/2" />
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-12 w-1/3" />
                            <div className="space-y-4">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}