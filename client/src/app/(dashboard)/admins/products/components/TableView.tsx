import Image from "next/image";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Edit, Trash2, Star, Percent, Shield } from "lucide-react";
import { Product } from "@/types/prismaTypes";

type TableViewProps = {
    products: Product[];
    onEdit: (id: number) => void;
    onDeleteClick: (id: number) => void;
};

export default function TableView({ products, onEdit, onDeleteClick }: TableViewProps) {
    if (products.length === 0) {
        return (
            <TableRow>
                <TableCell colSpan={9} className="text-center py-16 text-gray-500">
                    No products found
                </TableCell>
            </TableRow>
        );
    }

    return (
        <>
            {products.map((product) => {
                const specs = Array.isArray(product.specs) ? product.specs : [];
                const primaryImage = product.imageUrls?.[0] || product.imageUrl || null;

                // Rating
                const rating = product.averageRating
                    ? typeof product.averageRating === "object"
                        ? product.averageRating.toNumber()
                        : parseFloat(product.averageRating as any)
                    : 0;
                const reviewCount = product.reviewCount ?? 0;

                // Discount & Warranty
                const discountPercent = product.discountPercent ?? 0;
                const warranty = product.warranty || null;

                return (
                    <TableRow key={product.id} className="hover:bg-gray-50 transition-colors">
                        {/* Image */}
                        <TableCell>
                            {primaryImage ? (
                                <Image
                                    src={primaryImage}
                                    alt={product.name}
                                    width={64}
                                    height={64}
                                    className="rounded-md object-cover border"
                                />
                            ) : (
                                <div className="bg-gray-200 border-2 border-dashed rounded-md w-16 h-16 flex items-center justify-center">
                                    <Package className="h-8 w-8 text-gray-400" />
                                </div>
                            )}
                        </TableCell>

                        {/* Product Name */}
                        <TableCell className="font-medium max-w-xs">
                            <div className="truncate">{product.name}</div>
                        </TableCell>

                        {/* Specifications */}
                        <TableCell className="max-w-xs">
                            {specs.length > 0 ? (
                                <div className="space-y-1">
                                    {specs.slice(0, 3).map((spec: { key: string; value: string }, index: number) => (
                                        <div key={`${spec.key}-${spec.value}-${index}`} className="text-sm">
                                            <span className="font-medium">{spec.key}:</span> {spec.value}
                                        </div>
                                    ))}
                                    {specs.length > 3 && (
                                        <div className="text-xs text-gray-500">+{specs.length - 3} more</div>
                                    )}
                                </div>
                            ) : (
                                <span className="text-gray-400">—</span>
                            )}
                        </TableCell>

                        {/* Category */}
                        <TableCell>{product.category?.name || "—"}</TableCell>

                        {/* Price */}
                        <TableCell className="font-semibold">
                            KES {Number(product.price).toLocaleString()}
                        </TableCell>

                        {/* Rating */}
                        <TableCell>
                            {rating > 0 ? (
                                <div className="flex items-center gap-2">
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-4 h-4 ${
                                                    i < Math.floor(rating)
                                                        ? "fill-yellow-400 text-yellow-400"
                                                        : i < rating
                                                            ? "fill-yellow-400/30 text-yellow-400"
                                                            : "text-gray-300"
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-sm text-gray-600">
                    {rating.toFixed(1)} ({reviewCount})
                  </span>
                                </div>
                            ) : (
                                <span className="text-gray-400">—</span>
                            )}
                        </TableCell>

                        {/* Discount */}
                        <TableCell>
                            {discountPercent > 0 ? (
                                <Badge className="bg-red-100 text-red-700">
                                    <Percent className="w-3 h-3 mr-1" />
                                    {discountPercent}%
                                </Badge>
                            ) : (
                                <span className="text-gray-400">—</span>
                            )}
                        </TableCell>

                        {/* Warranty */}
                        <TableCell>
                            {warranty ? (
                                <div className="flex items-center gap-2 text-sm">
                                    <Shield className="w-4 h-4 text-blue-600" />
                                    <span className="truncate max-w-xs">{warranty}</span>
                                </div>
                            ) : (
                                <span className="text-gray-400">—</span>
                            )}
                        </TableCell>

                        {/* Stock Status */}
                        <TableCell>
                            <Badge variant={product.stock > 0 ? "default" : "secondary"}>
                                {product.stock > 0 ? `In Stock (${product.stock})` : "Out of Stock"}
                            </Badge>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right space-x-2">
                            <Button size="sm" variant="ghost" onClick={() => onEdit(product.id)}>
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => onDeleteClick(product.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </TableCell>
                    </TableRow>
                );
            })}
        </>
    );
}