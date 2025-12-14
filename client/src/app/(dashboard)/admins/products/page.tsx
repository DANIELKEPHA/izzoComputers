"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Plus, Search, Table as TableIcon, Grid3X3 as Grid } from "lucide-react";
import { toast } from "sonner";

import {
    useGetProductsQuery,
    useGetCategoriesQuery,
    useDeleteProductMutation,
    useGetAuthUserQuery,
} from "@/state/api";
import { useAppDispatch, useAppSelector } from "@/state/redux";
import { setViewMode } from "@/state";

import CardView from "./components/CardView";
import TableView from "./components/TableView";

const PAGE_SIZES = [10, 20, 50, 100];

export default function AdminProductsPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { data: authUser } = useGetAuthUserQuery();
    const viewMode = useAppSelector((state) => state.global.viewMode); // "table" | "card"

    const [search, setSearch] = useState("");
    const [categoryId, setCategoryId] = useState<string>("all");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const { data: categories = [] } = useGetCategoriesQuery();
    const { data: productsData, isLoading } = useGetProductsQuery({
        search,
        categoryId: categoryId === "all" ? undefined : Number(categoryId),
        page,
        pageSize,
    });
    const [deleteProduct, { isLoading: deleting }] = useDeleteProductMutation();

    const products = productsData?.products || [];
    const total = productsData?.total || 0;
    const totalPages = Math.ceil(total / pageSize);

    // Auth check
    useEffect(() => {
        if (authUser && authUser.userRole !== "admin") {
            toast("Access Denied");
            router.push("/");
        }
    }, [authUser, router]);

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await deleteProduct(deleteId).unwrap();
            toast.success("Product deleted successfully");
            setDeleteId(null);
        } catch (err) {
            toast.error("Failed to delete product");
        }
    };

    const handleEdit = (id: number) => {
        router.push(`/admins/products/edit/${id}`);
    };

    const handleDeleteClick = (id: number) => {
        setDeleteId(id);
    };

    if (isLoading) {
        return (
            <div className="p-8">
                <div className="animate-pulse space-y-8">
                    <div className="h-12 bg-gray-200 rounded w-96"></div>
                    <div className="h-screen bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="p-4 md:p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                            Products Management
                        </h1>
                        <p className="text-sm text-gray-600">Total: {total} products</p>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* View Mode Toggle */}
                        <div className="flex items-center bg-gray-100 rounded-lg p-1">
                            <Button
                                variant={viewMode === "table" ? "default" : "ghost"}
                                size="sm"
                                onClick={() => dispatch(setViewMode("table"))}
                                className="rounded-md"
                            >
                                <TableIcon className="h-4 w-4 mr-1" /> Table
                            </Button>
                            <Button
                                variant={viewMode === "card" ? "default" : "ghost"}
                                size="sm"
                                onClick={() => dispatch(setViewMode("card"))}
                                className="rounded-md"
                            >
                                <Grid className="h-4 w-4 mr-1" /> Cards
                            </Button>
                        </div>
                        <Button
                            onClick={() => router.push("/admins/products/new")}
                            className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
                        >
                            <Plus className="mr-2 h-4 w-4" /> Add New Product
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search products..."
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setPage(1);
                                    }}
                                    className="pl-10"
                                />
                            </div>
                            <Select
                                value={categoryId}
                                onValueChange={(v) => {
                                    setCategoryId(v);
                                    setPage(1);
                                }}
                            >
                                <SelectTrigger className="w-full md:w-64">
                                    <SelectValue placeholder="All Categories" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {categories.map((cat: any) => (
                                        <SelectItem key={cat.id} value={cat.id.toString()}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Products View */}
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-0">
                        {viewMode === "table" ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                    <tr className="bg-gray-50">
                                        <th className="w-20 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Image
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="w-48 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Description
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Price
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Stock
                                        </th>
                                        <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    <TableView
                                        products={products}
                                        onEdit={handleEdit}
                                        onDeleteClick={handleDeleteClick}
                                    />
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <CardView
                                products={products}
                                onEdit={handleEdit}
                                onDeleteClick={handleDeleteClick}
                            />
                        )}

                        {/* Pagination */}
                        {total > 0 && (
                            <div className="border-t px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <p className="text-sm text-gray-600">
                                    Showing {(page - 1) * pageSize + 1} to{" "}
                                    {Math.min(page * pageSize, total)} of {total} products
                                </p>
                                <div className="flex items-center gap-3">
                                    <Select
                                        value={pageSize.toString()}
                                        onValueChange={(v) => {
                                            setPageSize(Number(v));
                                            setPage(1);
                                        }}
                                    >
                                        <SelectTrigger className="w-32">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {PAGE_SIZES.map((size) => (
                                                <SelectItem key={size} value={size.toString()}>
                                                    {size} per page
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={page === 1}
                                            onClick={() => setPage(page - 1)}
                                        >
                                            Previous
                                        </Button>
                                        <span className="text-sm font-medium">
                      Page {page} of {totalPages}
                    </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={page === totalPages}
                                            onClick={() => setPage(page + 1)}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Delete Confirmation Dialog */}
                <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Product</DialogTitle>
                            <DialogDescription>
                                This action cannot be undone. This will permanently delete the product.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteId(null)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                                {deleting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                                    </>
                                ) : (
                                    "Delete Product"
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}