"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface OrderSummaryProps {
    items: Array<{
        product: {
            name: string;
            price: any;
            discountPercent?: number | null;
        };
        quantity: number;
    }>;
}

const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: "KES",
        minimumFractionDigits: 0,
    }).format(price);

export default function OrderSummary({ items }: OrderSummaryProps) {
    const subtotal = items.reduce((sum, item) => {
        const price = Number(item.product.price.toString());
        const discount = item.product.discountPercent || 0;
        const finalPrice = discount > 0 ? price * (1 - discount / 100) : price;
        return sum + finalPrice * item.quantity;
    }, 0);

    const tax = subtotal * 0.16;
    const shipping = subtotal >= 20000 ? 0 : 500;
    const total = subtotal + tax + shipping;

    return (
        <Card className="sticky top-24 shadow-lg">
            <CardContent className="p-6 space-y-4">
                <h2 className="text-2xl font-bold">Order Summary</h2>
                <Separator />

                <div className="space-y-3">
                    {items.map((item, index) => {
                        const finalPrice =
                            Number(item.product.price.toString()) *
                            (1 - (item.product.discountPercent || 0) / 100);
                        return (
                            <div key={index} className="flex justify-between text-sm">
                <span>
                  {item.product.name} × {item.quantity}
                </span>
                                <span>{formatPrice(finalPrice * item.quantity)}</span>
                            </div>
                        );
                    })}
                </div>

                <Separator />

                <div className="space-y-2 text-lg">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Tax (16%)</span>
                        <span>{formatPrice(tax)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Shipping</span>
                        <span className="text-green-600 font-medium">
              {shipping === 0 ? "FREE" : formatPrice(shipping)}
            </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-xl font-bold">
                        <span>Total</span>
                        <span>{formatPrice(total)}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}