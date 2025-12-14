"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Package,
    ChevronLeft,
    ChevronRight,
    Check,
    Star,
    Shield,
    Truck,
} from "lucide-react";
import { toast } from "sonner";
import { useGetProductQuery, useGetAuthUserQuery } from "@/state/api";
import BreadCrumb from "@/components/BreadCrumb";
import TruncatedDescription from "@/app/(dashboard)/admins/products/[id]/TruncatedDescription";
import ProductActionsSidebar from "@/app/(dashboard)/admins/products/[id]/ProductActionsSidebar";
import React from "react";

export default function ProductDetailPage({
                                              params,
                                          }: {
    params: Promise<{ id: string }>;
}) {
    const router = useRouter();
    const { id } = React.use(params);
    const productId = Number(id);

    const { data: authUser } = useGetAuthUserQuery();
    const { data: product, isLoading, isError } = useGetProductQuery(productId);

    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [isHoveringMainImage, setIsHoveringMainImage] = useState(false);
    const [thumbnailStartIndex, setThumbnailStartIndex] = useState(0);
    const THUMBNAILS_PER_PAGE = 5;

    useEffect(() => {
        if (authUser && authUser.userRole !== "admin") {
            toast("Access Denied");
            router.push("/");
        }
    }, [authUser, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="w-full max-w-screen-2xl mx-auto px-4 animate-pulse space-y-12">
                    <div className="h-6 bg-gray-200 rounded w-64 mb-8"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                        <div className="lg:col-span-5 h-[500px] bg-gray-200 rounded-xl"></div>
                        <div className="lg:col-span-7 space-y-6">
                            <div className="h-12 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-8 bg-gray-200 rounded w-32"></div>
                            <div className="space-y-4">
                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (isError || !product) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center space-y-6">
                    <p className="text-2xl text-gray-600">Product not found</p>
                    <Button onClick={() => router.push("/admins/products")}>
                        Back to Products List
                    </Button>
                </div>
            </div>
        );
    }

    const imageUrls: string[] =
        (product as any).imageUrls || (product.imageUrl ? [product.imageUrl] : []);
    const images = imageUrls.filter(Boolean);
    const selectedImage = images[selectedImageIndex] || null;

    const visibleThumbnails = images.slice(
        thumbnailStartIndex,
        thumbnailStartIndex + THUMBNAILS_PER_PAGE
    );

    const showNextThumbnails = () => {
        if (thumbnailStartIndex + THUMBNAILS_PER_PAGE < images.length) {
            setThumbnailStartIndex((prev) => prev + THUMBNAILS_PER_PAGE);
        }
    };

    const showPrevThumbnails = () => {
        if (thumbnailStartIndex > 0) {
            setThumbnailStartIndex((prev) => Math.max(0, prev - THUMBNAILS_PER_PAGE));
        }
    };

    const handleThumbnailClick = (index: number) => {
        setSelectedImageIndex(index);
    };

    const specs = Array.isArray(product.specs) ? product.specs : [];
    const features = Array.isArray(product.features) ? product.features : [];

    return (
        <div className="min-h-screen bg-white">
            <div className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
                {/* Breadcrumb */}
                <div className="mb-8">
                    <BreadCrumb
                        items={[
                            { label: "Dashboard", href: "/admins" },
                            { label: "Products", href: "/admins/products" },
                            { label: product.name },
                        ]}
                    />
                </div>

                {/* Top Section: Image + Description */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    {/* Left: Image + Thumbnails */}
                    <div className="lg:col-span-5 flex flex-col lg:flex-row gap-4 items-start">
                        {images.length > 1 && (
                            <div className="hidden lg:flex lg:flex-col items-center gap-2 w-20">
                                {/* Prev Button */}
                                {images.length > THUMBNAILS_PER_PAGE && (
                                    <div className="flex justify-center mb-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={showPrevThumbnails}
                                            disabled={thumbnailStartIndex === 0}
                                            className="h-8 w-full p-0 hover:bg-gray-100 rounded-lg"
                                        >
                                            <ChevronLeft className="h-5 w-5" />
                                        </Button>
                                    </div>
                                )}

                                {/* Thumbnails */}
                                {visibleThumbnails.map((url, localIndex) => {
                                    const globalIndex = thumbnailStartIndex + localIndex;
                                    return (
                                        <button
                                            key={globalIndex}
                                            onMouseEnter={() => setSelectedImageIndex(globalIndex)}
                                            onClick={() => handleThumbnailClick(globalIndex)}
                                            className={`relative aspect-square w-16 rounded-md overflow-hidden border transition-all duration-200 group ${
                                                selectedImageIndex === globalIndex
                                                    ? "border-orange-500 shadow-sm"
                                                    : "border-gray-200 hover:border-gray-400"
                                            }`}
                                        >
                                            <Image
                                                src={url}
                                                alt={`Thumbnail ${globalIndex + 1}`}
                                                fill
                                                sizes="112px"
                                                className="object-cover group-hover:opacity-90"
                                            />
                                            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
                                        </button>
                                    );
                                })}

                                {/* Next Button */}
                                {images.length > THUMBNAILS_PER_PAGE && (
                                    <div className="flex justify-center mt-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={showNextThumbnails}
                                            disabled={
                                                thumbnailStartIndex + THUMBNAILS_PER_PAGE >= images.length
                                            }
                                            className="h-8 w-full p-0 hover:bg-gray-100 rounded-lg"
                                        >
                                            <ChevronRight className="h-5 w-5" />
                                        </Button>
                                    </div>
                                )}

                                {/* Counter */}
                                {images.length > THUMBNAILS_PER_PAGE && (
                                    <div className="text-center text-xs text-gray-500 mt-2 px-1">
                                        {thumbnailStartIndex + 1}–{" "}
                                        {Math.min(thumbnailStartIndex + THUMBNAILS_PER_PAGE, images.length)}{" "}
                                        of {images.length}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Main Image */}
                        <div className="w-[380px] shrink-0">
                            <div
                                className="relative bg-white border rounded-sm overflow-hidden cursor-zoom-in"
                                onMouseEnter={() => setIsHoveringMainImage(true)}
                                onMouseLeave={() => setIsHoveringMainImage(false)}
                            >
                                {selectedImage ? (
                                    <div className="relative aspect-[1/1]">
                                        <Image
                                            src={selectedImage}
                                            alt={product.name}
                                            fill
                                            sizes="(max-width: 640px) 90vw, 380px"
                                            className={`object-contain transition-transform duration-300 ${
                                                isHoveringMainImage ? "scale-[1.03]" : "scale-100"
                                            }`}
                                            priority
                                        />
                                        <div
                                            className="absolute inset-0 hover:bg-black/5 transition"
                                            onClick={() => window.open(selectedImage, "_blank")}
                                        />
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center aspect-[1/1] bg-gray-50">
                                        <Package className="h-16 w-16 text-gray-300 mb-2" />
                                        <p className="text-gray-500 text-xs">No image available</p>
                                    </div>
                                )}
                                {images.length > 1 && (
                                    <div className="absolute bottom-1 right-1 bg-black/70 text-white px-1.5 py-0.5 rounded text-[10px]">
                                        {selectedImageIndex + 1} / {images.length}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Sticky Product Info */}
                    <div className="lg:col-span-7 sticky top-8 space-y-6 text-sm">
                        {/* Title */}
                        <h1 className="text-2xl lg:text-3xl font-semibold text-gray-900 leading-tight">
                            {product.name}
                        </h1>

                        {/* Category & Rating */}
                        <div className="flex items-center gap-3 text-sm">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className="h-4 w-4 fill-yellow-400 text-yellow-400"
                                />
                            ))}
                            <span className="ml-1 text-xs text-blue-600 hover:underline cursor-pointer">
                128 ratings
              </span>
                            <div className="w-px h-4 bg-gray-300"></div>
                            {product.category && (
                                <span className="text-xs text-blue-600 hover:underline cursor-pointer">
                  Category: {product.category.name}
                </span>
                            )}
                        </div>

                        {/* Price */}
                        <div className="pt-2">
                            <div className="flex items-baseline gap-2">
                <span className="text-3xl lg:text-4xl font-bold text-gray-900">
                  KES {Number(product.price).toLocaleString()}
                </span>
                                <span className="text-sm text-gray-500 line-through">
                  KES {(Number(product.price) * 1.2).toLocaleString()}
                </span>
                                <Badge variant="secondary" className="text-xs font-semibold px-2 py-0.5">
                                    20% off
                                </Badge>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Inclusive of all taxes</p>
                        </div>

                        {/* Stock */}
                        <div className="pt-2">
                            <Badge
                                variant={product.stock > 0 ? "default" : "destructive"}
                                className="text-sm px-3 py-1 rounded-lg"
                            >
                                {product.stock > 0 ? (
                                    <div className="flex items-center gap-1.5">
                                        <Check className="h-4 w-4" />
                                        <span>In Stock • {product.stock} units</span>
                                    </div>
                                ) : (
                                    "Out of Stock"
                                )}
                            </Badge>
                        </div>

                        {/* Delivery & Return */}
                        <div className="border-t border-gray-200 pt-4 space-y-3 text-sm">
                            <div className="flex items-start gap-2.5">
                                <Truck className="h-5 w-5 text-gray-500 mt-0.5" />
                                <div>
                                    <p className="font-medium text-gray-900">Free delivery</p>
                                    <p className="text-xs text-gray-600">Order within 2 hrs 14 mins</p>
                                    <p className="text-xs text-green-600 font-medium">
                                        Delivery to Nairobi - Estimated by Dec 25
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2.5">
                                <Shield className="h-5 w-5 text-gray-500 mt-0.5" />
                                <div>
                                    <p className="font-medium text-gray-900">30-Day Return Policy</p>
                                    <p className="text-xs text-gray-600">
                                        Free returns within 30 days of purchase
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="border-t border-gray-200 pt-4">
                            <ProductActionsSidebar
                                price={Number(product.price)}
                                stock={product.stock}
                                isAdmin={true}
                                onEditClick={() =>
                                    router.push(`/admins/products/edit/${product.id}`)
                                }
                            />
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Full Description + Features + Specs */}
                <div className="mt-12 lg:mt-16 border-t border-gray-200 pt-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Description + Features */}
                    <div className="lg:col-span-7 space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Description</h2>
                        {product.description ? (
                            <div className="prose prose-sm max-w-none">
                                <TruncatedDescription description={product.description} />
                            </div>
                        ) : (
                            <p className="text-gray-500 italic text-sm">No description available.</p>
                        )}

                        {features.length > 0 && (
                            <div className="bg-gray-50 rounded-xl p-4 mt-4">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Key Features</h3>
                                <ul className="space-y-2">
                                    {features.map((feature: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-700 text-sm">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                    </div>

                    {/* Specs */}
                    {specs.length > 0 && (
                        <div className="lg:col-span-5 sticky top-8">
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50">
                                    <h3 className="text-xl font-bold text-gray-900">Technical Specifications</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Complete product details and features
                                    </p>
                                </div>
                                <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                                    {specs.map((spec: { key: string; value: string }, index: number) => (
                                        <div
                                            key={index}
                                            className="px-6 py-4 hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-start">
                                                <div className="sm:w-2/5 mb-2 sm:mb-0">
                                                    <span className="text-sm font-medium text-gray-700">{spec.key}</span>
                                                </div>
                                                <div className="sm:w-3/5">
                                                    <span className="text-gray-900 text-sm leading-relaxed">{spec.value}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                </div>
                                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/30">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center text-gray-500">
                                            <Package className="h-4 w-4 mr-2" />
                                            <span>Manufacturer specifications</span>
                                        </div>
                                        <Badge variant="secondary" className="font-normal">{specs.length} specs</Badge>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
