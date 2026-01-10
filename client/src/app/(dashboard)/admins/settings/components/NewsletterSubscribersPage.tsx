"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
    useGetNewsletterSubscribersQuery,
    useUnsubscribeFromNewsletterMutation,
} from "@/state/api";
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import {
    Mail,
    Phone,
    User,
    Calendar,
    MoreHorizontal,
    ToggleLeft,
    ToggleRight,
    Search,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react";

type Subscriber = {
    id: number;
    email: string;
    name: string | null;
    isActive: boolean;
    subscribedAt: string;
    userId: number | null;
};

export default function NewsletterSubscribersPage() {
    const router = useRouter();
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [globalFilter, setGlobalFilter] = useState("");

    const { data, isLoading, isFetching, refetch } = useGetNewsletterSubscribersQuery(
        {
            page: 1,
            pageSize: 50,
            includeInactive: true, // Show both active & inactive
        }
    );

    const [unsubscribe] = useUnsubscribeFromNewsletterMutation();

    const subscribers: Subscriber[] = data?.subscribers || [];

    const handleUnsubscribe = async (email: string) => {
        try {
            await unsubscribe({ email }).unwrap();
            toast.success(`Successfully unsubscribed ${email}`);
            refetch();
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to unsubscribe");
        }
    };

    const columns: ColumnDef<Subscriber>[] = [
        {
            accessorKey: "email",
            header: "Email",
            cell: ({ row }) => (
                <div className="font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    {row.getValue("email")}
                </div>
            ),
        },
        {
            accessorKey: "name",
            header: "Name",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    {row.getValue("name") || <span className="text-gray-500 italic">No name</span>}
                </div>
            ),
        },
        {
            accessorKey: "isActive",
            header: "Status",
            cell: ({ row }) => (
                <Badge variant={row.getValue("isActive") ? "default" : "secondary"}>
                    {row.getValue("isActive") ? (
                        <>
                            <ToggleRight className="w-3 h-3 mr-1" />
                            Active
                        </>
                    ) : (
                        <>
                            <ToggleLeft className="w-3 h-3 mr-1" />
                            Unsubscribed
                        </>
                    )}
                </Badge>
            ),
        },
        {
            accessorKey: "subscribedAt",
            header: "Subscribed On",
            cell: ({ row }) => (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(row.getValue("subscribedAt")), "PPP")}
                </div>
            ),
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const subscriber = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {subscriber.isActive && (
                                <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => handleUnsubscribe(subscriber.email)}
                                >
                                    <ToggleLeft className="mr-2 h-4 w-4" />
                                    Unsubscribe
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    const table = useReactTable({
        data: subscribers,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: "includesString",
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            globalFilter,
        },
    });

    return (
        <div className="container mx-auto py-8 px-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Newsletter Subscribers</CardTitle>
                    <CardDescription>
                        Manage and view all subscribers to your newsletter.{" "}
                        {subscribers.length > 0 && (
                            <span className="font-medium">
                {subscribers.filter((s) => s.isActive).length} active out of {subscribers.length} total
              </span>
                        )}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Search */}
                    <div className="flex items-center py-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <Input
                                placeholder="Search by email or name..."
                                value={globalFilter ?? ""}
                                onChange={(e) => setGlobalFilter(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            <TableHead key={header.id}>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(header.column.columnDef.header, header.getContext())}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {isLoading || isFetching ? (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} className="h-24 text-center">
                                            <div className="space-y-3">
                                                {[...Array(8)].map((_, i) => (
                                                    <Skeleton key={i} className="h-12 w-full" />
                                                ))}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id}>
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} className="h-24 text-center">
                                            No subscribers found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between py-4">
                        <div className="text-sm text-gray-600">
                            Showing {table.getRowModel().rows.length} of {subscribers.length} subscribers
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => table.setPageIndex(0)}
                                disabled={!table.getCanPreviousPage()}
                            >
                                <ChevronsLeft className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                disabled={!table.getCanNextPage()}
                            >
                                <ChevronsRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}