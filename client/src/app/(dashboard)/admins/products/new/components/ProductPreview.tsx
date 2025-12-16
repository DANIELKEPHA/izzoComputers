"use client";

import Image from "next/image";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Shield, Package } from "lucide-react";
import { useProductFormContext } from "@/app/(dashboard)/admins/products/new/components/ProductFormTabs";

const categoryIcons: Record<string, string> = {
    Laptops: "💻",
    Desktops: "🖥️",
    Monitors: "🖥️",
    SSDs: "💾",
    RAM: "🧠",
    Networking: "🌐",
    Accessories: "🎧",
    Components: "🔧",
};

export default function ProductPreview() {
    const {
        imagePreviews,
        selectedRatingOption,
        discountPercent,
        warranty,
        selectedCategory,
        name,
        price,
        description,
        currentRating,
    } = useProductFormContext();

    const finalPrice = discountPercent
        ? parseFloat(price || "0") * (1 - parseInt(discountPercent) / 100)
        : parseFloat(price || "0");

    return (
        <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                <CardTitle className="text-xl font-bold">Product Preview</CardTitle>
                <CardDescription>How your product will appear to customers</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    {imagePreviews[0] ? (
                        <Image
                            src={imagePreviews[0]}
                            alt="Product preview"
                            width={600}
                            height={600}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="text-center p-8">
                            <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500">No image yet</p>
                        </div>
                    )}
                </div>

                <div className="p-6 space-y-4">
                    <h3 className="text-xl font-bold text-gray-900">
                        {name || "Product Name"}
                    </h3>

                    <div className="flex items-baseline gap-3">
            <span className="text-2xl font-bold text-blue-600">
              KES {finalPrice.toLocaleString("en-KE")}
            </span>
                        {discountPercent && parseInt(discountPercent) > 0 && (
                            <>
                <span className="text-lg text-gray-500 line-through">
                  KES {parseFloat(price || "0").toLocaleString("en-KE")}
                </span>
                                <Badge className="bg-red-100 text-red-700 rounded-xl">
                                    Save {discountPercent}%
                                </Badge>
                            </>
                        )}
                    </div>

                    {currentRating > 0 && (
                        <div className="flex items-center gap-2">
                            <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-5 h-5 ${
                                            i < Math.floor(currentRating)
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "text-gray-300"
                                        }`}
                                    />
                                ))}
                            </div>
                            <span className="text-sm text-gray-600">{selectedRatingOption}</span>
                        </div>
                    )}

                    <p className="text-gray-600 text-sm line-clamp-3">
                        {description || "No description yet"}
                    </p>

                    {warranty && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Shield className="w-4 h-4" />
                            <span>{warranty}</span>
                        </div>
                    )}

                    {selectedCategory && (
                        <div className="pt-4 border-t border-gray-100">
                            <p className="text-sm text-gray-500">Category</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span>{categoryIcons[selectedCategory.name] || "📦"}</span>
                                <span className="font-medium">{selectedCategory.name}</span>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}