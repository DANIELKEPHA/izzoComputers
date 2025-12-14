"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ShoppingCart,
    Truck,
    Shield,
    RotateCcw,
    CreditCard,
    CheckCircle,
    Package,
    Star,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

interface ProductActionsSidebarProps {
    price: number;
    stock: number;
    isAdmin?: boolean;
    onEditClick?: () => void;
}

export default function ProductActionsSidebar({
                                                  price,
                                                  stock,
                                                  isAdmin = true,
                                                  onEditClick
                                              }: ProductActionsSidebarProps) {
    const [quantity, setQuantity] = useState(1);
    const [isWarrantyExpanded, setIsWarrantyExpanded] = useState(false);

    const isInStock = stock > 0;

    const handleAddToCart = () => {
        if (!isInStock) {
            toast.error("This product is currently out of stock");
            return;
        }

        toast.success(`Added ${quantity} item${quantity > 1 ? 's' : ''} to cart`, {
            description: `KES ${(price * quantity).toLocaleString()} total`,
            action: {
                label: "View Cart",
                onClick: () => console.log("Navigate to cart"),
            },
        });
    };

    const handleBuyNow = () => {
        if (!isInStock) {
            toast.error("This product is currently out of stock");
            return;
        }

        toast.success("Proceeding to checkout", {
            description: `Total: KES ${(price * quantity).toLocaleString()}`,
        });
    };

    const handleQuantityChange = (value: number) => {
        if (value < 1) return;
        if (value > stock) {
            toast.warning(`Only ${stock} items available`);
            return;
        }
        setQuantity(value);
    };

    return (
        <div className="sticky top-6 bg-white border border-gray-200 rounded-xl shadow-lg p-6 space-y-6">
            {/* Price Section */}
            <div className="space-y-3">
                <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-gray-900">
            KES {price.toLocaleString()}
          </span>
                    {price > 10000 && (
                        <Badge variant="outline" className="text-sm font-normal bg-green-50 text-green-700 border-green-200">
                            -12% OFF
                        </Badge>
                    )}
                </div>

                <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500">List Price:</span>
                    <span className="text-gray-400 line-through">KES {(price * 1.12).toLocaleString()}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    <span>Save KES {(price * 0.12).toLocaleString()} (12%)</span>
                </div>
            </div>

            {/* Stock Status */}
            <div className={`p-3 rounded-lg ${isInStock ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-center gap-2">
                    {isInStock ? (
                        <>
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <div>
                                <p className="font-medium text-green-800">In Stock</p>
                                <p className="text-sm text-green-700">
                                    {stock > 10 ? 'Order now for delivery within 24 hours' : `Only ${stock} left in stock`}
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            <Package className="h-5 w-5 text-red-600" />
                            <div>
                                <p className="font-medium text-red-800">Currently Unavailable</p>
                                <p className="text-sm text-red-700">We don&#39;t know when this will be back in stock</p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Quantity Selector */}
            {isInStock && (
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Quantity:</label>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center border border-gray-300 rounded-lg">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleQuantityChange(quantity - 1)}
                                className="h-10 w-10 rounded-r-none text-gray-600 hover:text-gray-900"
                                disabled={quantity <= 1}
                            >
                                −
                            </Button>
                            <div className="w-12 text-center">
                                <span className="text-lg font-semibold">{quantity}</span>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleQuantityChange(quantity + 1)}
                                className="h-10 w-10 rounded-l-none text-gray-600 hover:text-gray-900"
                                disabled={quantity >= stock}
                            >
                                +
                            </Button>
                        </div>
                        <span className="text-sm text-gray-500">
              ({stock} available)
            </span>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
                {isAdmin ? (
                    // Admin View
                    <>
                        <Button
                            size="lg"
                            onClick={onEditClick}
                            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md hover:shadow-lg transition-all"
                        >
                            Edit Product Details
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            onClick={handleAddToCart}
                            className="w-full border-orange-300 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                        >
                            <ShoppingCart className="mr-2 h-5 w-5" />
                            Add to Cart (Preview)
                        </Button>
                    </>
                ) : (
                    // Customer View
                    <>
                        <Button
                            size="lg"
                            onClick={handleBuyNow}
                            disabled={!isInStock}
                            className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                        >
                            Buy Now
                        </Button>
                        <Button
                            size="lg"
                            onClick={handleAddToCart}
                            disabled={!isInStock}
                            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                        >
                            <ShoppingCart className="mr-2 h-5 w-5" />
                            Add to Cart
                        </Button>
                    </>
                )}
            </div>

        </div>
    );
}