"use client";

import { useState, useEffect } from "react";
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
import { Loader2, Upload, X, Image as ImageIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useUpdateCategoryMutation } from "@/state/api";

interface Category {
    id: number;
    name: string;
    slug: string;
    coverImageUrl: string | null;
}

interface EditCategoryDialogProps {
    category: Category | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export default function EditCategoryDialog({
                                               category,
                                               open,
                                               onOpenChange,
                                               onSuccess,
                                           }: EditCategoryDialogProps) {
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [removeCover, setRemoveCover] = useState(false);

    const [updateCategory, { isLoading }] = useUpdateCategoryMutation();

    useEffect(() => {
        if (category && open) {
            setName(category.name);
            setSlug(category.slug);
            setPreviewUrl(category.coverImageUrl);
            setCoverImage(null);
            setRemoveCover(false);
        }
    }, [category, open]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) return toast.error("Invalid image");
        if (file.size > 5 * 1024 * 1024) return toast.error("Image too large");

        setCoverImage(file);
        setRemoveCover(false);
        const reader = new FileReader();
        reader.onloadend = () => setPreviewUrl(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        setCoverImage(null);
        setPreviewUrl(category?.coverImageUrl || null);
        setRemoveCover(true);
    };

    const handleSubmit = async () => {
        if (!category) return;

        const trimmedName = name.trim();
        if (trimmedName.length < 2 || trimmedName.length > 50) {
            return toast.error("Name must be 2–50 characters");
        }

        try {
            await updateCategory({
                id: category.id,
                name: trimmedName !== category.name ? trimmedName : undefined,
                slug: slug !== category.slug ? slug : undefined,
                coverImage: coverImage || undefined,
                keepCoverImage: !removeCover && !coverImage, // only send false if explicitly removing
            }).unwrap();

            toast.success("Category updated successfully!");
            onOpenChange(false);
            onSuccess?.();
        } catch (err) {
            // handled by mutation toast
        }
    };

    if (!open || !category) return null;

    const currentImageUrl = coverImage ? previewUrl : category.coverImageUrl;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle className="text-2xl">Edit Category</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                    <div className="space-y-2">
                        <Label>Name *</Label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading} />
                    </div>

                    <div className="space-y-2">
                        <Label>Slug</Label>
                        <Input
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
                    </div>

                    <div className="space-y-3">
                        <Label>Cover Image</Label>
                        {currentImageUrl && !removeCover ? (
                            <div className="relative rounded-lg overflow-hidden border-2 border-dashed">
                                <img src={currentImageUrl} alt="Cover" className="w-full h-64 object-cover" />
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2"
                                    onClick={handleRemoveImage}
                                    disabled={isLoading}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <p className="text-sm text-muted-foreground">No cover image</p>
                            </div>
                        )}

                        <div className="flex justify-center">
                            <label htmlFor="edit-cover-input" className="cursor-pointer">
                                <Input
                                    id="edit-cover-input"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageChange}
                                    disabled={isLoading}
                                />
                                <Button
                                    variant="outline"
                                    disabled={isLoading}
                                    className="gap-2"
                                    asChild
                                >
    <span>
      <Upload className="h-4 w-4" />
      Upload New Image
    </span>
                                </Button>
                            </label>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            "Save Changes"
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}