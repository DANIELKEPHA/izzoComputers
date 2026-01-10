// app/cart/page.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
    useGetCartQuery,
    useUpdateCartItemMutation,
    useRemoveFromCartMutation,
    useClearCartMutation,
} from "@/state/api";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

import {
    Plus,
    Minus,
    Trash2,
    ShoppingBag,
    ArrowRight,
    Package,
    Truck,
    Shield,
    RefreshCw,
    Gift,
    Tag,
    ChevronRight,
    Heart,
    AlertCircle,
    Lock,
    Sparkles,
    Star,
    Zap,
} from "lucide-react";

const GUEST_CART_KEY = "guestCart";

export default function CartPage() {
    const router = useRouter();

    const {
        data: cartData,
        isLoading,
        isError,
        refetch,
    } = useGetCartQuery(undefined, { refetchOnMountOrArgChange: true });

    const [updateCartItem] = useUpdateCartItemMutation();
    const [removeFromCart] = useRemoveFromCartMutation();
    const [clearCart] = useClearCartMutation();

    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
    const [showClearCartDialog, setShowClearCartDialog] = useState(false);

    const items = cartData?.cart?.items ?? [];
    const count = cartData?.totalItems ?? 0;

    // Constants
    const FREE_SHIPPING_THRESHOLD = 20000;
    const SHIPPING_COST = 500;
    const TAX_RATE = 0.16;

    // Calculations
    const subtotal = items.reduce((sum, item) => {
        const price = Number(item.product.price.toString());
        const discount = item.product.discountPercent || 0;
        const finalPrice = discount > 0 ? price * (1 - discount / 100) : price;
        return sum + finalPrice * item.quantity;
    }, 0);

    const tax = subtotal * TAX_RATE;
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
    const totalBeforeDiscount = subtotal + tax + shipping;
    const discountAmount = appliedCoupon ? totalBeforeDiscount * (appliedCoupon.discount / 100) : 0;
    const finalTotal = totalBeforeDiscount - discountAmount;
    const shippingProgress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);

    const formatPrice = (price: number) =>
        new Intl.NumberFormat("en-KE", {
            style: "currency",
            currency: "KES",
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(price);

    const applyCoupon = async () => {
        if (!couponCode.trim()) return;
        setIsApplyingCoupon(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (couponCode.toUpperCase() === "SAVE10") {
            setAppliedCoupon({ code: "SAVE10", discount: 10 });
            setCouponCode("");
        } else {
            alert("Invalid coupon code");
        }
        setIsApplyingCoupon(false);
    };

    const removeCoupon = () => setAppliedCoupon(null);

    const handleUpdateQuantity = (productId: number, newQuantity: number) => {
        if (newQuantity < 1) return;
        updateCartItem({ productId, quantity: newQuantity });
    };

    const handleRemoveItem = (productId: number) => removeFromCart(productId);

    const handleClearCart = () => {
        clearCart();
        setShowClearCartDialog(false);
    };

    // Loading State
    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-6xl mx-auto space-y-8">
                    <Skeleton className="h-10 w-64" />
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            {[1, 2, 3].map((i) => (
                                <Card key={i}>
                                    <CardContent className="p-6">
                                        <div className="flex gap-6">
                                            <Skeleton className="w-40 h-40" />
                                            <div className="flex-1 space-y-4">
                                                <Skeleton className="h-6 w-3/4" />
                                                <Skeleton className="h-4 w-1/2" />
                                                <Skeleton className="h-10 w-32" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                        <div>
                            <Skeleton className="h-[400px] w-full" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Error or empty cart handling
    if (isError || (count === 0 && items.length === 0)) {
        // Check for guest cart items
        const guestCartJson = typeof window !== "undefined" ? localStorage.getItem(GUEST_CART_KEY) : null;
        const guestItems = guestCartJson ? JSON.parse(guestCartJson) : [];
        const guestCount = Array.isArray(guestItems)
            ? guestItems.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0)
            : 0;

        // Guest has items → show sign-in prompt
        if (guestCount > 0) {
            return (
                <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <div className="text-center">
                            {/* Icon + Badge */}
                            <div className="relative inline-block mb-8">
                                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center shadow-lg">
                                    <ShoppingBag className="w-16 h-16 text-blue-600" />
                                </div>
                                <div className="absolute -top-2 -right-2">
                                    <Badge className="text-lg px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md">
                                        {guestCount} {guestCount === 1 ? "Item" : "Items"} in Cart
                                    </Badge>
                                </div>
                            </div>

                            {/* Main Message */}
                            <h1 className="text-4xl font-bold text-gray-900 mb-4">
                                Sign in to view your cart
                            </h1>
                            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                                You have <strong>{guestCount} item{guestCount > 1 ? "s" : ""}</strong> waiting in your cart.
                                Sign in to continue shopping, apply discounts, and complete your purchase securely.
                            </p>

                            {/* Benefits */}
                            <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                        <Lock className="w-8 h-8 text-green-600" />
                                    </div>
                                    <h3 className="font-semibold mb-2">Secure Checkout</h3>
                                    <p className="text-sm text-gray-600">Your information is protected</p>
                                </div>
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                        <Sparkles className="w-8 h-8 text-blue-600" />
                                    </div>
                                    <h3 className="font-semibold mb-2">Exclusive Offers</h3>
                                    <p className="text-sm text-gray-600">Unlock member-only discounts</p>
                                </div>
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                                        <Package className="w-8 h-8 text-purple-600" />
                                    </div>
                                    <h3 className="font-semibold mb-2">Order History</h3>
                                    <p className="text-sm text-gray-600">Track all your purchases</p>
                                </div>
                            </div>

                            {/* CTA Buttons */}
                            <div className="space-y-4 max-w-md mx-auto">
                                <Button
                                    size="lg"
                                    className="w-full text-lg py-7 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                                    onClick={() => router.push("/signin?redirect=/cart")}
                                >
                                    <Lock className="mr-3 w-6 h-6" />
                                    Sign In to Continue
                                </Button>

                                <p className="text-gray-600">
                                    Don&#39;t have an account?{" "}
                                    <Link href="/signup?redirect=/cart" className="text-blue-600 hover:underline font-medium">
                                        Create one here
                                    </Link>
                                </p>

                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="w-full"
                                    onClick={() => router.push("/shop")}
                                >
                                    <ArrowRight className="mr-2 w-5 h-5 rotate-180" />
                                    Continue Shopping as Guest
                                </Button>
                            </div>

                            {/* Trust Indicators */}
                            <div className="mt-12 pt-8 border-t">
                                <p className="text-sm text-gray-500 mb-4">Your cart items are saved and will be waiting when you return</p>
                                <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-green-500" />
                                        <span>Secure & Private</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <RefreshCw className="w-5 h-5 text-blue-500" />
                                        <span>No Commitment</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        // Logged-in user with truly empty cart
        return (
            <div className="container mx-auto px-4 py-12 min-h-screen">
                <div className="max-w-2xl mx-auto text-center">
                    <div className="relative mb-8">
                        <div className="w-48 h-48 mx-auto bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full flex items-center justify-center">
                            <ShoppingBag className="w-24 h-24 text-blue-400" />
                        </div>
                        <div className="absolute -top-2 -right-2">
                            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                                <Tag className="w-8 h-8 text-amber-600" />
                            </div>
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                        Your Cart is Empty
                    </h1>
                    <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                        Looks like you haven&#39;t added anything to your cart yet. Explore our collection and find something special!
                    </p>
                    <div className="space-y-4 max-w-sm mx-auto">
                        <Button
                            size="lg"
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                            onClick={() => router.push("/shop")}
                        >
                            <Sparkles className="mr-3 w-5 h-5" />
                            Start Shopping
                            <ArrowRight className="ml-3 w-5 h-5" />
                        </Button>
                        <div className="grid grid-cols-2 gap-4">
                            <Button variant="outline" onClick={() => router.push("/shop?category=bestsellers")}>
                                <Star className="mr-2 w-4 h-4" />
                                Bestsellers
                            </Button>
                            <Button variant="outline" onClick={() => router.push("/shop?category=deals")}>
                                <Zap className="mr-2 w-4 h-4" />
                                Hot Deals
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Main Cart View (logged-in with items)
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <div className="container mx-auto px-4 py-8 lg:py-12">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div>
                                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">My Shopping Cart</h1>
                                <p className="text-gray-600 mt-2">Review your items and proceed to checkout</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <Badge variant="outline" className="px-4 py-2 text-sm">
                                    {count} {count === 1 ? "Item" : "Items"}
                                </Badge>
                                <div className="hidden lg:block w-32">
                                    <Progress value={shippingProgress} className="h-2" />
                                    <p className="text-xs text-gray-500 mt-1">
                                        {subtotal >= FREE_SHIPPING_THRESHOLD
                                            ? "🎉 Free shipping unlocked!"
                                            : `Add ${formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} more for free shipping`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-6">
                            {items.map((item) => {
                                const product = item.product;
                                const price = Number(product.price.toString());
                                const discount = product.discountPercent || 0;
                                const finalPrice = discount > 0 ? price * (1 - discount / 100) : price;
                                const itemTotal = finalPrice * item.quantity;

                                return (
                                    <Card key={item.productId} className="overflow-hidden border hover:shadow-lg transition-all group">
                                        <CardContent className="p-0">
                                            <div className="flex flex-col sm:flex-row gap-6 p-6">
                                                <div className="sm:w-40 sm:h-40 flex-shrink-0 relative">
                                                    <div className="relative w-full h-full bg-gradient-to-br from-gray-50 to-white rounded-xl overflow-hidden border">
                                                        <Link href={`/shop/product/${product.id}`}>
                                                            <Image
                                                                src={product.imageUrl || product.imageUrls[0] || "/placeholder-laptop.jpg"}
                                                                alt={product.name}
                                                                fill
                                                                className="object-contain p-4 hover:scale-105 transition-transform"
                                                                sizes="(max-width: 768px) 100vw, 160px"
                                                            />
                                                        </Link>
                                                        {discount > 0 && (
                                                            <div className="absolute top-2 left-2">
                                                                <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white border-0">
                                                                    -{discount}%
                                                                </Badge>
                                                            </div>
                                                        )}
                                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Button
                                                                            size="icon"
                                                                            variant="secondary"
                                                                            className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm"
                                                                            onClick={() => handleRemoveItem(item.productId)}
                                                                        >
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent><p>Remove item</p></TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex-1 space-y-4">
                                                    <div>
                                                        <Link href={`/shop/product/${product.id}`} className="font-bold text-xl text-gray-900 hover:text-blue-600 line-clamp-2">
                                                            {product.name}
                                                        </Link>
                                                        <div className="flex items-center gap-3 mt-2">
                                                            <div className="flex items-center">
                                                                {[1, 2, 3, 4, 5].map((star) => (
                                                                    <Star
                                                                        key={star}
                                                                        className={`w-4 h-4 ${star <= 4 ? "text-amber-400 fill-amber-400" : "text-gray-300"}`}
                                                                    />
                                                                ))}
                                                                <span className="ml-2 text-sm text-gray-600">(4.5)</span>
                                                            </div>
                                                            {product.stock > 0 && (
                                                                <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                                                                    <Package className="w-3 h-3 mr-1" />
                                                                    In Stock
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-4">
                                                            <div className="text-2xl font-bold text-gray-900">
                                                                {formatPrice(finalPrice)}
                                                            </div>
                                                            {discount > 0 && (
                                                                <div className="text-lg text-gray-500 line-through">
                                                                    {formatPrice(price)}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {formatPrice(price)} each
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                                        <div className="flex items-center gap-2 text-green-600">
                                                            <Truck className="w-4 h-4" />
                                                            <span>Free Delivery</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-blue-600">
                                                            <Shield className="w-4 h-4" />
                                                            <span>{product.warranty || "1 Year Warranty"}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col items-end justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        size="icon"
                                                                        variant="outline"
                                                                        className="h-10 w-10 rounded-lg"
                                                                        onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                                                                        disabled={item.quantity <= 1}
                                                                    >
                                                                        <Minus className="w-4 h-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent><p>Decrease quantity</p></TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>

                                                        <div className="flex flex-col items-center">
                                                            <Input
                                                                type="number"
                                                                value={item.quantity}
                                                                onChange={(e) =>
                                                                    handleUpdateQuantity(
                                                                        item.productId,
                                                                        Math.max(1, Math.min(99, Number(e.target.value)))
                                                                    )
                                                                }
                                                                className="w-20 text-center h-10 font-semibold"
                                                                min={1}
                                                                max={99}
                                                            />
                                                            <span className="text-xs text-gray-500 mt-1">Qty</span>
                                                        </div>

                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        size="icon"
                                                                        variant="outline"
                                                                        className="h-10 w-10 rounded-lg"
                                                                        onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                                                                        disabled={item.quantity >= 99}
                                                                    >
                                                                        <Plus className="w-4 h-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent><p>Increase quantity</p></TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </div>

                                                    <div className="flex gap-2 mt-4">
                                                        <Button variant="ghost" size="sm">
                                                            <Heart className="w-4 h-4 mr-2" />
                                                            Save
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            onClick={() => handleRemoveItem(item.productId)}
                                                        >
                                                            <Trash2 className="w-4 h-4 mr-2" />
                                                            Remove
                                                        </Button>
                                                    </div>

                                                    <div className="text-right mt-4">
                                                        <div className="text-sm text-gray-500">Item Total</div>
                                                        <div className="text-2xl font-bold text-gray-900">
                                                            {formatPrice(itemTotal)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="px-6 py-3 bg-gradient-to-r from-gray-50 to-white border-t">
                                                <div className="flex justify-between items-center text-sm">
                                                    <div className="text-gray-600">
                                                        Est. delivery: <span className="font-semibold">2-3 business days</span>
                                                    </div>
                                                    <div className="text-green-600 font-semibold">✔ Eligible for free returns</div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}

                            {/* Cart Actions */}
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t">
                                <Button variant="outline" onClick={() => router.push("/shop")}>
                                    <ArrowRight className="mr-2 w-4 h-4 rotate-180" />
                                    Continue Shopping
                                </Button>
                                <div className="flex gap-3">
                                    <Button variant="outline" onClick={() => refetch()}>
                                        <RefreshCw className="mr-2 w-4 h-4" />
                                        Refresh Cart
                                    </Button>
                                    <Dialog open={showClearCartDialog} onOpenChange={setShowClearCartDialog}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                                <Trash2 className="mr-2 w-4 h-4" />
                                                Clear Cart
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle className="flex items-center gap-2">
                                                    <AlertCircle className="w-5 h-5 text-red-500" />
                                                    Clear Shopping Cart?
                                                </DialogTitle>
                                                <DialogDescription>
                                                    Are you sure you want to remove all items from your cart? This action cannot be undone.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <DialogFooter>
                                                <Button variant="outline" onClick={() => setShowClearCartDialog(false)}>
                                                    Cancel
                                                </Button>
                                                <Button variant="destructive" onClick={handleClearCart}>
                                                    Clear All Items
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>

                            {/* Trust Badges */}
                            <div className="pt-8 border-t">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <Lock className="w-5 h-5 text-green-500" />
                                        <div>
                                            <div className="font-semibold">Secure Checkout</div>
                                            <div className="text-xs">256-bit SSL encryption</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <Shield className="w-5 h-5 text-blue-500" />
                                        <div>
                                            <div className="font-semibold">Buyer Protection</div>
                                            <div className="text-xs">Money-back guarantee</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <Truck className="w-5 h-5 text-purple-500" />
                                        <div>
                                            <div className="font-semibold">Free Shipping</div>
                                            <div className="text-xs">Orders over {formatPrice(FREE_SHIPPING_THRESHOLD)}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <RefreshCw className="w-5 h-5 text-amber-500" />
                                        <div>
                                            <div className="font-semibold">Easy Returns</div>
                                            <div className="text-xs">30-day return policy</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Summary Sidebar */}
                        <div className="lg:col-span-1">
                            <Card className="sticky top-24 border-2 border-gray-100 shadow-xl">
                                <CardContent className="p-6 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-2xl font-bold text-gray-900">Order Summary</h2>
                                        <Badge variant="secondary" className="px-3 py-1">
                                            {count} {count === 1 ? "Item" : "Items"}
                                        </Badge>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between text-gray-600">
                                            <span>Subtotal</span>
                                            <span className="font-medium">{formatPrice(subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600">
                                            <span>Estimated Tax (16%)</span>
                                            <span className="font-medium">{formatPrice(tax)}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600">
                                            <span>Shipping</span>
                                            <span className="text-green-600 font-semibold">
                        {shipping === 0 ? "FREE" : formatPrice(shipping)}
                      </span>
                                        </div>

                                        {/* Coupon */}
                                        <div className="space-y-3 pt-2">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Gift className="w-4 h-4" />
                                                <span>Have a coupon?</span>
                                            </div>
                                            {appliedCoupon ? (
                                                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                                                    <div className="flex items-center gap-2">
                                                        <Badge className="bg-green-500">Applied</Badge>
                                                        <span className="font-medium">{appliedCoupon.code}</span>
                                                    </div>
                                                    <Button variant="ghost" size="sm" className="h-8 text-red-600" onClick={removeCoupon}>
                                                        Remove
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <Input
                                                        placeholder="Enter coupon code"
                                                        value={couponCode}
                                                        onChange={(e) => setCouponCode(e.target.value)}
                                                        disabled={isApplyingCoupon}
                                                    />
                                                    <Button
                                                        variant="outline"
                                                        onClick={applyCoupon}
                                                        disabled={isApplyingCoupon || !couponCode.trim()}
                                                    >
                                                        {isApplyingCoupon ? "Applying..." : "Apply"}
                                                    </Button>
                                                </div>
                                            )}
                                            {appliedCoupon && (
                                                <div className="flex justify-between text-green-600">
                                                    <span>Coupon Discount ({appliedCoupon.discount}%)</span>
                                                    <span className="font-semibold">-{formatPrice(discountAmount)}</span>
                                                </div>
                                            )}
                                        </div>

                                        <Separator />

                                        <div className="space-y-3">
                                            <div className="flex justify-between text-xl font-bold text-gray-900">
                                                <span>Total</span>
                                                <div className="text-right">
                                                    <div className="text-2xl">{formatPrice(finalTotal)}</div>
                                                    {appliedCoupon && (
                                                        <div className="text-sm text-gray-500 line-through">
                                                            {formatPrice(totalBeforeDiscount)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="text-sm text-gray-500 space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <Shield className="w-4 h-4 text-blue-500" />
                                                    <span>Secure payment • SSL encrypted</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Truck className="w-4 h-4 text-green-500" />
                                                    <span>Free delivery on orders over {formatPrice(FREE_SHIPPING_THRESHOLD)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        size="lg"
                                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 py-7 text-lg"
                                        onClick={() => router.push("/users/checkout")}
                                    >
                                        <Lock className="mr-3 w-5 h-5" />
                                        Proceed to Secure Checkout
                                        <ArrowRight className="ml-3 w-5 h-5" />
                                    </Button>

                                    <div className="pt-4 border-t">
                                        <p className="text-sm text-gray-600 mb-3">We accept</p>
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                                <span className="font-semibold text-gray-700">VISA</span>
                                            </div>
                                            <div className="flex-1 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                                <span className="font-semibold text-gray-700">MPESA</span>
                                            </div>
                                            <div className="flex-1 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                                <span className="font-semibold text-gray-700">MasterCard</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-center pt-4">
                                        <Link href="/shop" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium">
                                            ← Continue Shopping
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}