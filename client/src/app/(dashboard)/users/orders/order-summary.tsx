// app/orders/order-summary.tsx
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import {Badge, Package} from "lucide-react";

const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: "KES",
        minimumFractionDigits: 0,
    }).format(price);

interface OrderItem {
    product: {
        name: string;
        imageUrl?: string | null;
        price: any;
    };
    quantity: number;
    price: any;
}

interface OrderSummaryProps {
    order: {
        id: number;
        price: any;
        status: string;
        createdAt: string;
        items: OrderItem[];
    };
}

export default function OrderSummary({ order }: OrderSummaryProps) {
    return (
        <Card>
            <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-semibold">Order #{order.id}</h3>
                        <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <Badge className="capitalize">{order.status.toLowerCase()}</Badge>
                </div>

                <Separator />

                <div className="space-y-4">
                    {order.items.map((item, index) => (
                        <div key={index} className="flex gap-4">
                            <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                {item.product.imageUrl ? (
                                    <Image
                                        src={item.product.imageUrl}
                                        alt={item.product.name}
                                        width={64}
                                        height={64}
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                                        <Package className="w-8 h-8 text-gray-500" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="font-medium">{item.product.name}</p>
                                <p className="text-sm text-gray-600">
                                    Qty: {item.quantity} × {formatPrice(item.price.toNumber())}
                                </p>
                            </div>
                            <p className="font-medium">{formatPrice(item.price.toNumber() * item.quantity)}</p>
                        </div>
                    ))}
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatPrice(order.price.toNumber())}</span>
                </div>
            </CardContent>
        </Card>
    );
}