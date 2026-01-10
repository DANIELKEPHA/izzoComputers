"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import { Loader2, Upload, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { useCreateCategoryMutation } from "@/state/api";

interface AddCategoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export default function AddCategoryDialog({
                                              open,
                                              onOpenChange,
                                              onSuccess,
                                          }: AddCategoryDialogProps) {
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [createCategory, { isLoading }] = useCreateCategoryMutation();

    const handleNameChange = (value: string) => {
        setName(value);
        // Auto-generate slug only if user hasn't manually edited it
        const generated = value
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "");
        if (!slug || slug === name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")) {
            setSlug(generated);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Please select a valid image file");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image must be smaller than 5MB");
            return;
        }

        setCoverImage(file);
        const reader = new FileReader();
        reader.onloadend = () => setPreviewUrl(reader.result as string);
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setCoverImage(null);
        setPreviewUrl(null);
        const input = document.getElementById("add-cover-input") as HTMLInputElement;
        if (input) input.value = "";
    };

    const resetForm = () => {
        setName("");
        setSlug("");
        setCoverImage(null);
        setPreviewUrl(null);
    };

    const handleSubmit = async () => {
        const trimmedName = name.trim();

        if (trimmedName.length < 2 || trimmedName.length > 50) {
            toast.error("Category name must be 2–50 characters");
            return;
        }

        try {
            await createCategory({
                name: trimmedName,
                slug: slug || undefined,
                coverImage: coverImage || undefined,
            }).unwrap();

            toast.success("Category created successfully!");
            resetForm();
            onOpenChange(false);
            onSuccess?.();
        } catch (err) {
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle className="text-2xl">Add New Category</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="add-name">Category Name *</Label>
                        <Input
                            id="add-name"
                            placeholder="e.g., Graphics Cards"
                            value={name}
                            onChange={(e) => handleNameChange(e.target.value)}
                            disabled={isLoading}
                            autoFocus
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="add-slug">
                            Slug <span className="text-muted-foreground text-sm">(optional)</span>
                        </Label>
                        <Input
                            id="add-slug"
                            placeholder="auto-generated if empty"
                            value={slug}
                            onChange={(e) =>
                                setSlug(
                                    e.target.value
                                        .toLowerCase()
                                        .replace(/\s+/g, "-")
                                        .replace(/[^a-z0-9-]/g, "")
                                )
                            }
                            disabled={isLoading}
                        />
                        {slug && (
                            <p className="text-sm text-muted-foreground">
                                URL: /categories/<strong>{slug}</strong>
                            </p>
                        )}
                    </div>

                    <div className="space-y-3">
                        <Label>Cover Image {previewUrl ? "" : "(optional)"}</Label>

                        {/* Preview */}
                        {previewUrl ? (
                            <div className="relative rounded-lg overflow-hidden border-2 border-dashed">
                                <img
                                    src={previewUrl}
                                    alt="Cover preview"
                                    className="w-full h-64 object-cover"
                                />
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2"
                                    onClick={removeImage}
                                    disabled={isLoading}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <p className="text-sm text-muted-foreground mb-4">
                                    Recommended: 1200×600px, up to 5MB
                                </p>
                            </div>
                        )}

                        {/* Upload / Change Button */}
                        <div className="flex justify-center gap-3">
                            {/* This label ACTS as the clickable button */}
                            <label htmlFor="cover-image-input" className="cursor-pointer">
                                <Input
                                    id="cover-image-input"
                                    type="file"
                                    accept="image/*"
                                    className="hidden" // Must be hidden
                                    onChange={handleImageChange}
                                    disabled={isLoading}
                                />
                                <Button
                                    type="button"
                                    variant={previewUrl ? "outline" : "default"}
                                    disabled={isLoading}
                                    className="gap-2"
                                    asChild // Important: prevents button from submitting forms
                                >
        <span>
          <Upload className="h-4 w-4" />
            {previewUrl ? "Change Image" : "Upload Cover Image"}
        </span>
                                </Button>
                            </label>

                            {/* Remove button (only if image is selected) */}
                            {previewUrl && (
                                <Button
                                    variant="ghost"
                                    onClick={removeImage}
                                    disabled={isLoading}
                                    className="gap-2"
                                >
                                    <X className="h-4 w-4" />
                                    Remove
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
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