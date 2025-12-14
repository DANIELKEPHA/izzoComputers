"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Edit, Trash2 } from "lucide-react";
import { Product } from "@/types/prismaTypes";

type CardViewProps = {
    products: Product[];
    onEdit: (id: number) => void;
    onDeleteClick: (id: number) => void;
};

export default function CardView({ products, onEdit, onDeleteClick }: CardViewProps) {
    const router = useRouter();

    if (products.length === 0) {
        return (
            <div className="col-span-full text-center py-16 text-gray-500">
                No products found
            </div>
        );
    }

    const getRibbon = (product: Product) => {
        if (product.stock === 0) return { text: "Out of Stock", bg: "bg-red-600" };
        if (product.stock > 0 && product.stock <= 5)
            return { text: "Low Stock", bg: "bg-orange-500" };
        // Placeholder — replace with real best-seller logic later
        // if (product.isBestSeller) return { text: "Best Seller", bg: "bg-gradient-to-r from-purple-600 to-pink-600" };
        return null;
    };

    const handleCardClick = (id: number) => {
        router.push(`/admins/products/${id}`);
    };

    const handleEditClick = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        onEdit(id);
    };

    const handleDeleteClick = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        onDeleteClick(id);
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
            {products.map((product) => {
                const ribbon = getRibbon(product);

                // Properly type specs
                const specs: { key: string; value: string }[] = Array.isArray(product.specs)
                    ? product.specs
                    : [];

                // Primary image: prefer imageUrls[0], fallback to imageUrl
                const primaryImage = product.imageUrls?.[0] || product.imageUrl || null;

                return (
                    <Card
                        key={product.id}
                        className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
                        onClick={() => handleCardClick(product.id)}
                    >
                        {/* Image with Ribbon */}
                        <div className="aspect-square relative bg-gray-100">
                            {primaryImage ? (
                                <Image
                                    src={primaryImage}
                                    alt={product.name}
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <Package className="h-16 w-16 text-gray-400" />
                                </div>
                            )}

                            {/* Ribbon */}
                            {ribbon && (
                                <div
                                    className={`absolute top-6 -left-8 w-40 ${ribbon.bg} text-white text-center text-xs font-bold py-2 transform rotate-[-45deg] shadow-lg
                    before:absolute before:inset-0 before:-z-10 before:bg-inherit
                    before:[clip-path:polygon(0_0,100%_0,100%_100%,0_100%,10%_50%)]
                    after:absolute after:inset-0 after:-z-10 after:bg-inherit after:opacity-70
                    after:[clip-path:polygon(0_50%,10%_0,20%_50%,10%_100%)]`}
                                >
                                    {ribbon.text}
                                </div>
                            )}
                        </div>

                        <CardContent className="p-4 space-y-3">
                            <h3 className="font-semibold text-lg truncate group-hover:text-blue-600 transition-colors">
                                {product.name}
                            </h3>

                            <p className="text-sm text-gray-600">
                                {product.category?.name || "Uncategorized"}
                            </p>

                            {/* Dynamic Specs as Badges */}
                            {specs.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {specs.slice(0, 4).map((spec, index) => (
                                        <Badge
                                            key={`${spec.key}-${spec.value}-${index}`}
                                            variant="secondary"
                                            className="text-xs"
                                        >
                                            {spec.key}: {spec.value}
                                        </Badge>
                                    ))}
                                    {specs.length > 4 && (
                                        <Badge variant="outline" className="text-xs">
                                            +{specs.length - 4} more
                                        </Badge>
                                    )}
                                </div>
                            )}

                            {product.description ? (
                                <p className="text-sm text-gray-500 line-clamp-2">
                                    {product.description}
                                </p>
                            ) : (
                                <p className="text-sm text-gray-400 italic">No description provided</p>
                            )}

                            <p className="text-xl font-bold text-blue-600">
                                KES {Number(product.price).toLocaleString()}
                            </p>

                            <Badge variant={product.stock > 0 ? "default" : "secondary"}>
                                {product.stock > 0 ? `In Stock (${product.stock})` : "Out of Stock"}
                            </Badge>
                        </CardContent>

                        <CardFooter className="p-4 pt-0 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="sm" onClick={(e) => handleEditClick(e, product.id)}>
                                <Edit className="h-4 w-4 mr-1" /> Edit
                            </Button>
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={(e) => handleDeleteClick(e, product.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </CardFooter>
                    </Card>
                );
            })}
        </div>
    );
}