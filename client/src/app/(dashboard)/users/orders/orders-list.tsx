"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useGetOrdersQuery } from "@/state/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Truck, CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react";

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    PENDING: { label: "Pending", color: "bg-yellow-100 text-yellow-800", icon: <Clock className="w-4 h-4" /> },
    PROCESSING: { label: "Processing", color: "bg-blue-100 text-blue-800", icon: <RefreshCw className="w-4 h-4" /> },
    SHIPPED: { label: "Shipped", color: "bg-purple-100 text-purple-800", icon: <Truck className="w-4 h-4" /> },
    DELIVERED: { label: "Delivered", color: "bg-green-100 text-green-800", icon: <CheckCircle className="w-4 h-4" /> },
    CANCELLED: { label: "Cancelled", color: "bg-red-100 text-red-800", icon: <XCircle className="w-4 h-4" /> },
};

const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: "KES",
        minimumFractionDigits: 0,
    }).format(price);

const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-KE", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

export default function OrdersList() {
    const [page, setPage] = useState(1);
    const { data, isLoading, isError, refetch } = useGetOrdersQuery({ page, pageSize: 10 });

    const orders = data?.orders ?? [];
    const pagination = data?.pagination;

    if (isLoading) {
        return (
            <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                    <Card key={i}>
                        <CardContent className="p-6">
                            <Skeleton className="h-32 w-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (isError) {
        return (
            <Card>
                <CardContent className="p-12 text-center">
                    <p className="text-red-600 mb-4">Failed to load your orders. Please try again.</p>
                    <Button onClick={() => refetch()}>Retry</Button>
                </CardContent>
            </Card>
        );
    }

    if (orders.length === 0) {
        return (
            <Card>
                <CardContent className="p-12 text-center">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Orders Yet</h2>
                    <p className="text-gray-600 mb-6">When you place an order, it will appear here.</p>
                    <Button asChild>
                        <Link href="/shop">Start Shopping</Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Items</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.map((order) => {
                            const status = statusConfig[order.status] || statusConfig.PENDING;
                            const itemCount = order.items.reduce((sum: number, item: any) => sum + item.quantity, 0);

                            return (
                                <TableRow key={order.id} className="hover:bg-gray-50">
                                    <TableCell className="font-medium">#{order.id}</TableCell>
                                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                                    <TableCell>{itemCount} item{itemCount !== 1 ? "s" : ""}</TableCell>
                                    <TableCell className="font-semibold">{formatPrice(order.price.toNumber())}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className={`flex items-center gap-1 w-fit ${status.color}`}>
                                            {status.icon}
                                            {status.label}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/order-confirmation/${order.id}`}>View Details</Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        Previous
                    </Button>
                    <span className="flex items-center px-4">
            Page {page} of {pagination.totalPages}
          </span>
                    <Button
                        variant="outline"
                        onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                        disabled={page === pagination.totalPages}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
}