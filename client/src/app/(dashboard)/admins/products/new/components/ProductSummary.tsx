"use client";

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useProductFormContext } from "@/app/(dashboard)/admins/products/new/components/ProductFormTabs";

export default function ProductSummary() {
    const {
        imagePreviews,
        specs,
        selectedRatingOption,
        discountPercent,
        warranty,
        estimatedRevenue,
        creating,
        onFormSubmit,
    } = useProductFormContext();

    return (
        <Card className="border-0 shadow-lg rounded-2xl">
            <CardHeader>
                <CardTitle className="text-xl font-bold">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Status</span>
                        <Badge variant="outline" className="rounded-xl">Draft</Badge>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Images</span>
                        <span className="font-medium">{imagePreviews.length} uploaded</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Specifications</span>
                        <span className="font-medium">
              {specs.filter(s => s.key && s.value).length} added
            </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Rating</span>
                        <span className="font-medium">{selectedRatingOption || "Not set"}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Discount</span>
                        <span className="font-medium">
              {discountPercent ? `${discountPercent}%` : "None"}
            </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Warranty</span>
                        <span className="font-medium">{warranty || "Not set"}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Stock Value</span>
                        <span className="font-bold text-green-600">
              KES {estimatedRevenue.toLocaleString("en-KE", { minimumFractionDigits: 2 })}
            </span>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button
                    onClick={onFormSubmit}
                    disabled={creating}
                    className="w-full rounded-xl bg-blue-600 hover:bg-blue-700"
                >
                    {creating ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                        </>
                    ) : (
                        "Publish Product"
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
}