"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { useCreateCategoryMutation } from "@/state/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface AddCategoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export default function AddCategoryDialog({ open, onOpenChange, onSuccess }: AddCategoryDialogProps) {
    const [name, setName] = useState("");
    const [createCategory, { isLoading }] = useCreateCategoryMutation();

    const handleSubmit = async () => {
        if (!name.trim() || name.trim().length < 2) {
            toast.error("Category name must be at least 2 characters");
            return;
        }

        try {
            await createCategory({ name: name.trim() }).unwrap();
            toast.success("Category created successfully!");
            setName("");
            onOpenChange(false);
            onSuccess?.();
        } catch (err) {
            // Error toast handled by mutation
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-96">
                <CardHeader>
                    <CardTitle>Add New Category</CardTitle>
                </CardHeader>
                <CardContent>
                    <Input
                        placeholder="e.g., Graphics Cards"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                        autoFocus
                    />
                </CardContent>
                <CardFooter className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isLoading || !name.trim()}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            "Create Category"
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}