"use client";

import { useState } from "react";
import { useGetCategoriesQuery, useDeleteCategoryMutation } from "@/state/api";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import AddCategoryDialog from "./AddCategoryDialog";
import EditCategoryDialog from "./EditCategoryDialog";

export default function CategoryList() {
    const { data: categories = [], isLoading, refetch } = useGetCategoriesQuery();
    const [deleteCategory] = useDeleteCategoryMutation();

    const [addOpen, setAddOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<any>(null);

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this category?")) return;

        try {
            await deleteCategory(id).unwrap();
            toast.success("Category deleted");
        } catch (err) {
            // toast handled in mutation
        }
    };

    const handleEdit = (cat: any) => {
        setSelectedCategory(cat);
        setEditOpen(true);
    };

    return (
        <>
            <div className="p-6 max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Categories</h1>
                    <Button onClick={() => setAddOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Category
                    </Button>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Cover</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.map((cat) => (
                                <TableRow key={cat.id}>
                                    <TableCell>
                                        {cat.coverImageUrl ? (
                                            <img
                                                src={cat.coverImageUrl}
                                                alt={cat.name}
                                                className="h-12 w-20 object-cover rounded"
                                            />
                                        ) : (
                                            <div className="h-12 w-20 bg-gray-200 rounded flex items-center justify-center text-xs">
                                                No image
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium">{cat.name}</TableCell>
                                    <TableCell className="text-muted-foreground">{cat.slug}</TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleEdit(cat)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(cat.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>

            <AddCategoryDialog
                open={addOpen}
                onOpenChange={setAddOpen}
                onSuccess={refetch}
            />

            <EditCategoryDialog
                open={editOpen}
                onOpenChange={setEditOpen}
                category={selectedCategory}
                onSuccess={refetch}
            />
        </>
    );
}