"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import ProductFormTabs from "./components/ProductFormTabs";
import ProductPreview from "./components/ProductPreview";
import ProductSummary from "./components/ProductSummary";
import { useGetCategoriesQuery } from "@/state/api";
import AddCategoryDialog from "@/app/(dashboard)/admins/products/category/AddCategoryDialog";

export default function NewProductPage() {
    const router = useRouter();
    const [showAddCategory, setShowAddCategory] = useState(false);

    // Use the RTK Query hook to get refetch function
    const { refetch: refetchCategories } = useGetCategoriesQuery(undefined, {
        skip: !showAddCategory, // Optional: only fetch when needed
    });

    const handleSubmitSuccess = () => {
        router.push("/admins/products");
    };

    const handleCategoryAdded = () => {
        refetchCategories(); // Refresh category list in the form (e.g., in category dropdown)
        setShowAddCategory(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 md:px-10 py-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Create New Product</h1>
                            <p className="text-gray-600 mt-2">
                                Add a new product to your computer shop inventory
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button variant="secondary" onClick={() => setShowAddCategory(true)}>
                                Add Category
                            </Button>
                            <Button variant="outline" onClick={() => router.push("/admins/products")}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 max-w-7xl mx-auto w-full px-6 md:px-10 py-8">
                <ProductFormTabs onSubmitSuccess={handleSubmitSuccess}>
                    <div className="h-full grid grid-cols-1 lg:grid-cols-7 gap-8">
                        <div className="lg:col-span-5">
                            <ProductPreview />
                        </div>
                        <div className="lg:col-span-2 flex flex-col gap-6">
                            <ProductSummary />
                        </div>
                    </div>
                </ProductFormTabs>
            </div>

            {/* Add Category Dialog */}
            <AddCategoryDialog
                open={showAddCategory}
                onOpenChange={setShowAddCategory}
                onSuccess={handleCategoryAdded}
            />
        </div>
    );
}