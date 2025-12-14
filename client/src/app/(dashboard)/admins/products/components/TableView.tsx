import Image from "next/image";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Edit, Trash2 } from "lucide-react";
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
                <TableCell colSpan={8} className="text-center py-16 text-gray-500">
                    No products found
                </TableCell>
            </TableRow>
        );
    }

    return (
        <>
            {products.map((product) => {
                const specs = Array.isArray(product.specs) ? product.specs : [];

                // Prefer first image from imageUrls[], fallback to imageUrl
                const primaryImage = product.imageUrls?.[0] || product.imageUrl || null;

                return (
                    <TableRow key={product.id} className="hover:bg-gray-50 transition-colors">
                        <TableCell>
                            {primaryImage ? (
                                <Image
                                    src={primaryImage}
                                    alt={product.name}
                                    width={64}
                                    height={64}
                                    className="rounded-md object-cover border"
                                    priority={false}
                                />
                            ) : (
                                <div className="bg-gray-200 border-2 border-dashed rounded-md w-16 h-16 flex items-center justify-center">
                                    <Package className="h-8 w-8 text-gray-400" />
                                </div>
                            )}
                        </TableCell>

                        <TableCell className="font-medium">{product.name}</TableCell>

                        {/* Specifications Column */}
                        <TableCell className="max-w-xs">
                            {specs.length > 0 ? (
                                <div className="space-y-1">
                                    {specs.slice(0, 3).map((spec: { key: string; value: string }, index: number) => (
                                        <div
                                            key={`${spec.key}-${spec.value}-${index}`}
                                            className="text-sm"
                                        >
                                            <span className="font-medium">{spec.key}:</span> {spec.value}
                                        </div>
                                    ))}

                                    {specs.length > 3 && (
                                        <div className="text-xs text-gray-500">
                                            +{specs.length - 3} more
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <span className="text-gray-400">—</span>
                            )}
                        </TableCell>

                        <TableCell>{product.category?.name || "—"}</TableCell>

                        <TableCell className="font-semibold">
                            KES {Number(product.price).toLocaleString()}
                        </TableCell>

                        <TableCell>
                            <Badge variant={product.stock > 0 ? "default" : "secondary"}>
                                {product.stock > 0 ? `In Stock (${product.stock})` : "Out of Stock"}
                            </Badge>
                        </TableCell>

                        <TableCell className="text-right space-x-2">
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => onEdit(product.id)}
                            >
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