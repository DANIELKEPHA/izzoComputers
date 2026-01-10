"use client";
import React, { useState } from "react";
import {
    useGetOrdersQuery,
    useUpdateOrderStatusMutation,
    useGetOrderByIdQuery,
} from "@/state/api";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import {
    Package,
    Truck,
    CheckCircle,
    Clock,
    XCircle,
    RefreshCw,
    MapPin,
    Phone,
    Mail,
    User,
    StickyNote,
} from "lucide-react";
import { toast } from "sonner";

const statusConfig: Record<
    string,
    { label: string; color: string; icon: React.ReactNode }
> = {
    PENDING: {
        label: "Pending",
        color: "bg-yellow-100 text-yellow-800",
        icon: <Clock className="w-4 h-4" />,
    },
    PROCESSING: {
        label: "Processing",
        color: "bg-blue-100 text-blue-800",
        icon: <RefreshCw className="w-4 h-4" />,
    },
    SHIPPED: {
        label: "Shipped",
        color: "bg-purple-100 text-purple-800",
        icon: <Truck className="w-4 h-4" />,
    },
    DELIVERED: {
        label: "Delivered",
        color: "bg-green-100 text-green-800",
        icon: <CheckCircle className="w-4 h-4" />,
    },
    CANCELLED: {
        label: "Cancelled",
        color: "bg-red-100 text-red-800",
        icon: <XCircle className="w-4 h-4" />,
    },
};

const formatPrice = (price: any): string => {
    let value = 0;
    if (price === null || price === undefined) {
        value = 0;
    } else if (typeof price?.toNumber === "function") {
        value = price.toNumber();
    } else if (typeof price === "number") {
        value = price;
    } else {
        value = Number(price) || 0;
    }
    return new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: "KES",
        minimumFractionDigits: 0,
    }).format(value);
};

const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-KE", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

export default function OrdersTable() {
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

    const {
        data,
        isLoading,
        isError,
        refetch,
    } = useGetOrdersQuery({
        page,
        pageSize: 20,
        status: statusFilter === "all" ? undefined : statusFilter,
    });

    const { data: orderDetails, isFetching: detailsLoading } =
        useGetOrderByIdQuery(selectedOrderId!, { skip: !selectedOrderId });

    const [updateOrderStatus] = useUpdateOrderStatusMutation();

    const orders = data?.orders ?? [];
    const pagination = data?.pagination;

    const handleStatusChange = async (orderId: number, newStatus: string) => {
        try {
            await updateOrderStatus({ orderId, status: newStatus }).unwrap();
            toast.success(`Order #${orderId} updated to ${newStatus}`);
        } catch (err) {
            toast.error("Could not update order status");
        }
    };

    const openDetails = (orderId: number) => setSelectedOrderId(orderId);
    const closeDetails = () => setSelectedOrderId(null);

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                ))}
            </div>
        );
    }

    if (isError) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600 mb-4">Failed to load orders</p>
                <Button onClick={() => refetch()}>Retry</Button>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-6">
                {/* Filters */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Orders</SelectItem>
                                {Object.entries(statusConfig).map(([key, config]) => (
                                    <SelectItem key={key} value={key}>
                                        {config.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <span className="text-sm text-gray-600">
              {pagination?.total || 0} total orders
            </span>
                    </div>
                </div>

                {/* Orders Table */}
                <div className="rounded-lg border bg-white overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Delivery</TableHead>
                                <TableHead>Items</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.map((order) => {
                                const status = statusConfig[order.status] || statusConfig.PENDING;
                                const itemCount = order.items.reduce(
                                    (sum: number, item: any) => sum + item.quantity,
                                    0
                                );

                                return (
                                    <TableRow
                                        key={order.id}
                                        className="hover:bg-gray-50 cursor-pointer"
                                        onClick={() => openDetails(order.id)}
                                    >
                                        <TableCell className="font-medium">#{order.id}</TableCell>
                                        <TableCell>{formatDate(order.createdAt)}</TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{order.name || "Guest"}</p>
                                                <p className="text-sm text-gray-500">
                                                    {order.user?.email || "N/A"}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Phone className="w-4 h-4 text-gray-500" />
                                                <span>{order.phone || "—"}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            <p className="font-medium">{order.city}</p>
                                            <p className="text-gray-500 truncate max-w-xs">
                                                {order.address}
                                            </p>
                                        </TableCell>
                                        <TableCell>{itemCount} items</TableCell>
                                        <TableCell className="font-bold">
                                            {formatPrice(order.price)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={`flex items-center gap-1 w-fit ${status.color}`}
                                            >
                                                {status.icon}
                                                {status.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell onClick={(e) => e.stopPropagation()}>
                                            <Select
                                                value={order.status}
                                                onValueChange={(value) =>
                                                    handleStatusChange(order.id, value)
                                                }
                                            >
                                                <SelectTrigger className="w-40">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(statusConfig).map(([key, config]) => (
                                                        <SelectItem key={key} value={key}>
                                                            <div className="flex items-center gap-2">
                                                                {config.icon}
                                                                {config.label}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
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
                            onClick={() =>
                                setPage((p) => Math.min(pagination.totalPages, p + 1))
                            }
                            disabled={page === pagination.totalPages}
                        >
                            Next
                        </Button>
                    </div>
                )}
            </div>

            {/* Order Details Modal */}
            <Dialog open={!!selectedOrderId} onOpenChange={(open) => !open && closeDetails()}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">
                            Order Details #{selectedOrderId}
                        </DialogTitle>
                    </DialogHeader>

                    {detailsLoading ? (
                        <div className="space-y-6">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-32 w-full" />
                            ))}
                        </div>
                    ) : orderDetails?.order ? (
                        <div className="space-y-8">
                            {/* Customer & Delivery Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card>
                                    <CardContent className="p-6">
                                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                                            <User className="w-5 h-5" />
                                            Customer Information
                                        </h3>
                                        <div className="space-y-3 text-sm">
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-gray-500" />
                                                <span className="font-medium">Name:</span>
                                                <span>{orderDetails.order.name || "Guest"}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-4 h-4 text-gray-500" />
                                                <span className="font-medium">Email:</span>
                                                <span>{orderDetails.order.user?.email || "N/A"}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-4 h-4 text-gray-500" />
                                                <span className="font-medium">Phone:</span>
                                                <span>{orderDetails.order.phone || "Not provided"}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-6">
                                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                                            <MapPin className="w-5 h-5" />
                                            Delivery Address
                                        </h3>
                                        <div className="space-y-3 text-sm">
                                            <p className="font-medium">{orderDetails.order.name}</p>
                                            <p>{orderDetails.order.address}</p>
                                            <p>{orderDetails.order.city}</p>
                                            <p className="text-gray-500">Kenya</p>
                                            {orderDetails.order.notes && (
                                                <div className="mt-4 pt-4 border-t">
                                                    <div className="flex items-start gap-2">
                                                        <StickyNote className="w-4 h-4 text-gray-500 mt-0.5" />
                                                        <div>
                                                            <span className="font-medium">Notes:</span>
                                                            <p className="text-gray-700 mt-1">
                                                                {orderDetails.order.notes}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Order Items & Summary */}
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="font-semibold text-xl">Order Items</h3>
                                        <Badge
                                            className={`text-lg px-4 py-2 ${
                                                statusConfig[orderDetails.order.status]?.color || ""
                                            }`}
                                        >
                                            {statusConfig[orderDetails.order.status]?.icon}
                                            {statusConfig[orderDetails.order.status]?.label ||
                                                orderDetails.order.status}
                                        </Badge>
                                    </div>

                                    <div className="space-y-4">
                                        {orderDetails.order.items.map((item: any) => (
                                            <div
                                                key={item.id}
                                                className="flex gap-4 p-4 bg-gray-50 rounded-lg"
                                            >
                                                <div className="w-20 h-20 bg-white rounded-lg overflow-hidden border flex-shrink-0">
                                                    <Image
                                                        src={
                                                            item.product.imageUrl ||
                                                            item.product.imageUrls?.[0] ||
                                                            "/placeholder-laptop.jpg"
                                                        }
                                                        alt={item.product.name}
                                                        width={80}
                                                        height={80}
                                                        className="object-contain"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-medium">{item.product.name}</h4>
                                                    <p className="text-sm text-gray-600">
                                                        Quantity: {item.quantity}
                                                    </p>
                                                    <p className="font-semibold mt-1">
                                                        {formatPrice(item.price * item.quantity)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <Separator className="my-6" />

                                    <div className="space-y-2 text-lg">
                                        <div className="flex justify-between">
                                            <span>Subtotal</span>
                                            <span>{formatPrice(orderDetails.order.price / 1.16)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Tax (16% VAT)</span>
                                            <span>{formatPrice((orderDetails.order.price * 0.16) / 1.16)}</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-xl pt-4 border-t">
                                            <span>Total Paid</span>
                                            <span>{formatPrice(orderDetails.order.price)}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Status Update */}
                            <Card>
                                <CardContent className="p-6">
                                    <h3 className="font-semibold mb-4">Update Order Status</h3>
                                    <Select
                                        value={orderDetails.order.status}
                                        onValueChange={(value) =>
                                            handleStatusChange(orderDetails.order.id, value)
                                        }
                                    >
                                        <SelectTrigger className="w-64">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(statusConfig).map(([key, config]) => (
                                                <SelectItem key={key} value={key}>
                                                    <div className="flex items-center gap-2">
                                                        {config.icon}
                                                        {config.label}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 py-8">No details available</p>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}