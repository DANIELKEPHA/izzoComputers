// app/(dashboard)/admins/products/new/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

import AddCategoryDialog from "@/app/(dashboard)/admins/products/components/AddCategoryDialog";
import ProductFormTabs from "./components/ProductFormTabs";
import ProductPreview from "./components/ProductPreview";
import ProductSummary from "./components/ProductSummary";

export default function NewProductPage() {
    const router = useRouter();
    const [showAddCategory, setShowAddCategory] = useState(false);

    const handleSubmitSuccess = () => {
        router.push("/admins/products");
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-screen-2xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
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
            <div className="max-w-screen-2xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Form Tabs */}
                    <div className="lg:col-span-2">
                        <ProductFormTabs onSubmitSuccess={handleSubmitSuccess}>
                            {/* Right side components now as children */}
                            <div className="space-y-6">
                                <ProductPreview />
                                <ProductSummary />
                            </div>
                        </ProductFormTabs>
                    </div>
                </div>
            </div>

            <AddCategoryDialog
                open={showAddCategory}
                onOpenChange={setShowAddCategory}
                onSuccess={() => {}}
            />
        </div>
    );
}