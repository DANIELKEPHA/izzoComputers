"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import {
    useGetProductQuery,
    useUpdateProductMutation,
    useGetCategoriesQuery,
    useGetAuthUserQuery,
} from "@/state/api";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
    Loader2,
    Upload,
    X,
    Package,
    DollarSign,
    Layers,
    Hash,
    Plus,
    Trash2,
    ArrowLeft,
    Star,
    Percent,
    Shield,
} from "lucide-react";
import { toast } from "sonner";
import {productSchema} from "@/lib/schemas";

// Realistic rating options (same as create form)
const ratingOptions = [
    { rating: 4.8, reviews: 1250, label: "4.8 ★★★★☆ (1,250 reviews)" },
    { rating: 4.7, reviews: 980,  label: "4.7 ★★★★☆ (980 reviews)" },
    { rating: 4.6, reviews: 750,  label: "4.6 ★★★★☆ (750 reviews)" },
    { rating: 4.5, reviews: 520,  label: "4.5 ★★★★☆ (520 reviews)" },
    { rating: 4.4, reviews: 380,  label: "4.4 ★★★★☆ (380 reviews)" },
    { rating: 4.3, reviews: 210,  label: "4.3 ★★★★☆ (210 reviews)" },
    { rating: 4.2, reviews: 150,  label: "4.2 ★★★★☆ (150 reviews)" },
    { rating: 4.1, reviews: 90,   label: "4.1 ★★★★☆ (90 reviews)" },
    { rating: 4.0, reviews: 60,   label: "4.0 ★★★★☆ (60 reviews)" },
    { rating: 3.9, reviews: 45,   label: "3.9 ★★★☆☆ (45 reviews)" },
    { rating: 3.5, reviews: 30,   label: "3.5 ★★★☆☆ (30 reviews)" },
    { rating: null, reviews: 0,   label: "No rating yet" },
];

type ProductFormData = z.infer<typeof productSchema>;

type EditProductFormProps = {
    productId: number;
};

const categoryIcons: Record<string, string> = {
    Laptops: "💻",
    Desktops: "🖥️",
    Monitors: "🖥️",
    SSDs: "💾",
    RAM: "🧠",
    Networking: "🌐",
    Accessories: "🎧",
    Components: "🔧",
};

export default function EditProductForm({ productId }: EditProductFormProps) {
    const router = useRouter();

    // Remove all useParams() logic — we now trust the productId prop
    const isInvalidId = isNaN(productId);

    const { data: authUser } = useGetAuthUserQuery();
    const { data: categories = [] } = useGetCategoriesQuery();

    // Use the productId from props directly
    const { data: product, isLoading: productLoading } = useGetProductQuery(productId, {
        skip: isInvalidId,
    });

    const [updateProduct, { isLoading: updating }] = useUpdateProductMutation();

    const [activeTab, setActiveTab] = useState("basic");
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [newImages, setNewImages] = useState<File[]>([]);
    const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
    const [specs, setSpecs] = useState<{ key: string; value: string }[]>([]);

    // Marketing fields
    const [selectedRatingOption, setSelectedRatingOption] = useState<string>("");
    const [discountPercent, setDiscountPercent] = useState<string>("");
    const [warranty, setWarranty] = useState<string>("");

    const {
        control,
        handleSubmit,
        watch,
        trigger,
        reset,
        formState: { errors },
    } = useForm<ProductFormData>({
        resolver: zodResolver(productSchema),
        mode: "onChange",
        defaultValues: {
            name: "",
            description: "",
            price: "",
            stock: 0,
            categoryId: 0,
        },
    });

    const { data } = useGetProductQuery(productId);

    if (data) {
        const prod = data.product;
        console.log(prod.name);
    }

    useEffect(() => {
        if (product?.product) {
            const prod = product.product;

            reset({
                name: prod.name || "",
                description: prod.description || "",
                price: prod.price.toString(),
                stock: prod.stock,
                categoryId: prod.categoryId,
            });

            // Specs
            const productSpecs: { key: string; value: string }[] = Array.isArray(prod.specs)
                ? (prod.specs as { key: string; value: string }[])
                : [];
            setSpecs(productSpecs);

            // Images
            const images: string[] = prod.imageUrls?.filter(Boolean) || (prod.imageUrl ? [prod.imageUrl] : []);
            setExistingImages(images);

            // Rating & Reviews
            if (prod.averageRating !== null && prod.reviewCount !== null) {
                const avgRatingNumber =
                    typeof prod.averageRating === "object"
                        ? (prod.averageRating as any).toNumber()
                        : parseFloat(prod.averageRating as unknown as string);

                const matchingOption = ratingOptions.find(
                    (opt) => opt.rating === avgRatingNumber && opt.reviews === prod.reviewCount
                );

                setSelectedRatingOption(matchingOption?.label || "No rating yet");
            } else {
                setSelectedRatingOption("No rating yet");
            }

            // Discount & Warranty
            setDiscountPercent(prod.discountPercent?.toString() || "");
            setWarranty(prod.warranty || "");
        }
    }, [product, reset]);


    useEffect(() => {
        if (authUser && authUser.userRole !== "admin") {
            toast.error("Access Denied");
            router.push("/");
        }
    }, [authUser, router]);

    // Image handlers
    const handleNewImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const validFiles = files.filter((f) => f.type.startsWith("image/") && f.size <= 10 * 1024 * 1024);

        if (validFiles.length === 0) {
            toast.error("No valid images selected (max 10MB each)");
            return;
        }

        const totalImages = existingImages.length + newImages.length + validFiles.length;
        if (totalImages > 10) {
            toast.error("Maximum 10 images allowed");
            return;
        }

        setNewImages((prev) => [...prev, ...validFiles]);
        validFiles.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewImagePreviews((prev) => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeExistingImage = (url: string) =>
        setExistingImages((prev) => prev.filter((u) => u !== url));

    const removeNewImage = (index: number) => {
        setNewImages((prev) => prev.filter((_, i) => i !== index));
        setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
    };

    // Specs handlers
    const addSpec = () => setSpecs([...specs, { key: "", value: "" }]);

    const updateSpec = (index: number, field: "key" | "value", value: string) => {
        const updated = [...specs];
        updated[index][field] = value;
        setSpecs(updated);
    };

    const removeSpec = (index: number) => setSpecs(specs.filter((_, i) => i !== index));

    const handleTabChange = async (value: string) => {
        let valid = true;
        if (activeTab === "basic") {
            valid = await trigger(["name", "description", "categoryId"]);
        } else if (activeTab === "details") {
            valid = await trigger(["price", "stock"]);
        }
        if (valid) setActiveTab(value);
    };

    const onSubmit = async (data: ProductFormData) => {
        try {
            const selectedOption = ratingOptions.find(
                (opt) => opt.label === selectedRatingOption
            );

            const validSpecs = specs
                .map((s) => ({ key: s.key.trim(), value: s.value.trim() }))
                .filter((s) => s.key && s.value);

            await updateProduct({
                productId,
                ...data,
                images: newImages.length > 0 ? newImages : undefined,
                keepImageUrls: existingImages,
                specs: validSpecs.length > 0 ? validSpecs : null,
                averageRating: selectedOption?.rating ?? null,
                reviewCount: selectedOption?.reviews ?? null,
                discountPercent: discountPercent ? parseInt(discountPercent) : null,
                warranty: warranty.trim() || null,
            }).unwrap();

            toast.success("Product updated successfully!");
            router.push("/admins/products");
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to update product");
        }
    };

    const price = watch("price");
    const stock = watch("stock");
    const estimatedRevenue = parseFloat(price || "0") * Number(stock || 0);
    const selectedCategoryId = watch("categoryId");
    const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
    const primaryPreviewImage = newImagePreviews[0] || existingImages[0] || "/placeholder-laptop.jpg";

    // For live preview
    const currentRating = ratingOptions.find(
        (opt) => opt.label === selectedRatingOption
    )?.rating ?? 0;
    const finalPreviewPrice = discountPercent
        ? parseFloat(price || "0") * (1 - parseInt(discountPercent || "0", 10) / 100)
        : parseFloat(price || "0");

    // Early returns (loading / errors)
    if (isInvalidId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-2xl text-red-600 font-medium">Invalid product ID</p>
            </div>
        );
    }

    if (productLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                <span className="ml-4 text-xl text-gray-600">Loading product...</span>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Package className="mx-auto h-20 w-20 text-gray-300 mb-6" />
                    <p className="text-2xl font-medium text-gray-600">Product not found</p>
                    <Button onClick={() => router.push("/admins/products")} className="mt-6">
                        Back to Products
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-screen-2xl mx-auto px-6 py-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Button variant="ghost" size="icon" onClick={() => router.back()}>
                                <ArrowLeft className="h-6 w-6" />
                            </Button>
                            <div>
                                <h1 className="text-4xl font-bold text-gray-900">Edit Product</h1>
                                <p className="text-lg text-gray-600 mt-2">
                                    Update product details, pricing, images, and specifications
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => router.push("/admins/products")}
                            >
                                Cancel
                            </Button>
                            <Button
                                size="lg"
                                onClick={handleSubmit(onSubmit)}
                                disabled={updating}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {updating ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    "Save Changes"
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-screen-2xl mx-auto px-6 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Form Section */}
                    <div className="lg:col-span-8">
                        <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 py-10 px-10">
                                <CardTitle className="text-3xl font-bold text-gray-900">
                                    Product Information
                                </CardTitle>
                                <CardDescription className="text-lg mt-3 text-gray-700">
                                    Edit all product details in the tabs below
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="p-10">
                                <Tabs value={activeTab} onValueChange={handleTabChange}>
                                    <TabsList className="grid grid-cols-5 w-full mb-12 bg-gray-100 p-2 rounded-2xl">
                                        <TabsTrigger value="basic" className="rounded-xl py-4 text-base font-medium data-[state=active]:bg-white data-[state=active]:shadow-md">
                                            <Package className="w-5 h-5 mr-2" /> Basic Info
                                        </TabsTrigger>
                                        <TabsTrigger value="details" className="rounded-xl py-4 text-base font-medium data-[state=active]:bg-white data-[state=active]:shadow-md">
                                            <DollarSign className="w-5 h-5 mr-2" /> Pricing & Stock
                                        </TabsTrigger>
                                        <TabsTrigger value="marketing" className="rounded-xl py-4 text-base font-medium data-[state=active]:bg-white data-[state=active]:shadow-md">
                                            <Star className="w-5 h-5 mr-2" /> Marketing
                                        </TabsTrigger>
                                        <TabsTrigger value="specs" className="rounded-xl py-4 text-base font-medium data-[state=active]:bg-white data-[state=active]:shadow-md">
                                            Specifications
                                        </TabsTrigger>
                                        <TabsTrigger value="images" className="rounded-xl py-4 text-base font-medium data-[state=active]:bg-white data-[state=active]:shadow-md">
                                            <Layers className="w-5 h-5 mr-2" /> Images
                                        </TabsTrigger>
                                    </TabsList>

                                    {/* Basic Info */}
                                    <TabsContent value="basic" className="space-y-8">
                                        <div className="space-y-6">
                                            <div>
                                                <Label className="text-base font-medium">Product Name *</Label>
                                                <Controller
                                                    name="name"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Input {...field} placeholder="e.g., MacBook Pro M3 2024" className="mt-2 text-lg py-6 rounded-xl" />
                                                    )}
                                                />
                                                {errors.name && <p className="text-red-600 mt-2">{errors.name.message}</p>}
                                            </div>
                                            <div>
                                                <Label className="text-base font-medium">Category *</Label>
                                                <Controller
                                                    name="categoryId"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select value={field.value?.toString()} onValueChange={(v) => field.onChange(parseInt(v))}>
                                                            <SelectTrigger className="mt-2 py-6 text-base rounded-xl">
                                                                <SelectValue placeholder="Select a category" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {categories.map((cat) => (
                                                                    <SelectItem key={cat.id} value={cat.id.toString()}>
                                                                        <div className="flex items-center gap-3">
                                                                            <span className="text-xl">{categoryIcons[cat.name] || "📦"}</span>
                                                                            <span>{cat.name}</span>
                                                                        </div>
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                                {errors.categoryId && <p className="text-red-600 mt-2">{errors.categoryId.message}</p>}
                                            </div>
                                            <div>
                                                <Label className="text-base font-medium">Description *</Label>
                                                <Controller
                                                    name="description"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Textarea
                                                            {...field}
                                                            rows={8}
                                                            placeholder="Write a detailed description..."
                                                            className="mt-2 text-base rounded-xl"
                                                        />
                                                    )}
                                                />
                                                {errors.description && <p className="text-red-600 mt-2">{errors.description.message}</p>}
                                            </div>
                                        </div>
                                    </TabsContent>

                                    {/* Pricing & Stock */}
                                    <TabsContent value="details" className="space-y-8">
                                        <div className="grid md:grid-cols-2 gap-8">
                                            <div>
                                                <Label className="text-base font-medium">Price (KES) *</Label>
                                                <div className="relative mt-2">
                                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl font-medium text-gray-600">KES</span>
                                                    <Controller
                                                        name="price"
                                                        control={control}
                                                        render={({ field }) => (
                                                            <Input {...field} type="number" step="0.01" placeholder="0.00" className="pl-20 py-6 text-lg rounded-xl" />
                                                        )}
                                                    />
                                                </div>
                                                {errors.price && <p className="text-red-600 mt-2">{errors.price.message}</p>}
                                            </div>
                                            <div>
                                                <Label className="text-base font-medium">Stock Quantity *</Label>
                                                <div className="relative mt-2">
                                                    <Hash className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500" />
                                                    <Controller
                                                        name="stock"
                                                        control={control}
                                                        render={({ field }) => (
                                                            <Input {...field} type="number" placeholder="0" className="pl-16 py-6 text-lg rounded-xl" />
                                                        )}
                                                    />
                                                </div>
                                                {errors.stock && <p className="text-red-600 mt-2">{errors.stock.message}</p>}
                                            </div>
                                        </div>
                                        <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200 mt-8">
                                            <CardContent className="py-8">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-lg font-medium text-gray-700">Estimated Stock Value</p>
                                                        <p className="text-4xl font-bold text-gray-900 mt-2">
                                                            KES {estimatedRevenue.toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                                                        </p>
                                                    </div>
                                                    <Badge className={`text-lg px-6 py-3 ${estimatedRevenue > 0 ? "bg-green-600" : "bg-gray-400"}`}>
                                                        {estimatedRevenue > 0 ? "In Stock" : "Out of Stock"}
                                                    </Badge>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </TabsContent>

                                    {/* Marketing Tab */}
                                    <TabsContent value="marketing" className="space-y-8">
                                        <div className="space-y-8 bg-gray-50/60 rounded-3xl p-8 border">
                                            {/* Rating */}
                                            <div className="space-y-3">
                                                <Label className="text-lg font-medium flex items-center gap-3">
                                                    <Star className="w-6 h-6 text-yellow-500" />
                                                    Customer Rating & Reviews
                                                </Label>
                                                <Select value={selectedRatingOption} onValueChange={setSelectedRatingOption}>
                                                    <SelectTrigger className="text-base py-6 rounded-xl">
                                                        <SelectValue placeholder="Select rating..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {ratingOptions.map((opt) => (
                                                            <SelectItem key={opt.label} value={opt.label}>
                                                                {opt.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Discount */}
                                            <div className="space-y-3">
                                                <Label className="text-lg font-medium flex items-center gap-3">
                                                    <Percent className="w-6 h-6 text-red-600" />
                                                    Discount Percentage
                                                </Label>
                                                <div className="relative">
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        value={discountPercent}
                                                        onChange={(e) => setDiscountPercent(e.target.value)}
                                                        placeholder="e.g., 15"
                                                        className="pr-16 py-6 text-lg rounded-xl"
                                                    />
                                                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xl text-gray-600">%</span>
                                                </div>
                                            </div>

                                            {/* Warranty */}
                                            <div className="space-y-3">
                                                <Label className="text-lg font-medium flex items-center gap-3">
                                                    <Shield className="w-6 h-6 text-blue-600" />
                                                    Warranty
                                                </Label>
                                                <Input
                                                    value={warranty}
                                                    onChange={(e) => setWarranty(e.target.value)}
                                                    placeholder="e.g., 2-year warranty included"
                                                    className="py-6 text-base rounded-xl"
                                                />
                                            </div>
                                        </div>
                                    </TabsContent>

                                    {/* Specifications */}
                                    <TabsContent value="specs" className="space-y-8">
                                        <div className="bg-gray-50 rounded-3xl p-10 border">
                                            <div className="flex justify-between items-center mb-8">
                                                <h3 className="text-2xl font-bold text-gray-900">Product Specifications</h3>
                                                <Button onClick={addSpec} className="bg-blue-600 hover:bg-blue-700">
                                                    <Plus className="mr-2 h-5 w-5" /> Add Specification
                                                </Button>
                                            </div>
                                            {specs.length === 0 ? (
                                                <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-300">
                                                    <Package className="mx-auto h-24 w-24 text-gray-300 mb-6" />
                                                    <p className="text-2xl font-medium text-gray-600">No specifications added</p>
                                                    <p className="text-gray-500 mt-3">Add technical details like RAM, storage, processor, etc.</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    {specs.map((spec, index) => (
                                                        <Card key={index} className="p-6 shadow-sm">
                                                            <div className="grid md:grid-cols-3 gap-6">
                                                                <div>
                                                                    <Label className="font-medium">Key</Label>
                                                                    <Input
                                                                        value={spec.key}
                                                                        onChange={(e) => updateSpec(index, "key", e.target.value)}
                                                                        placeholder="e.g., RAM"
                                                                        className="mt-2"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <Label className="font-medium">Value</Label>
                                                                    <Input
                                                                        value={spec.value}
                                                                        onChange={(e) => updateSpec(index, "value", e.target.value)}
                                                                        placeholder="e.g., 16GB"
                                                                        className="mt-2"
                                                                    />
                                                                </div>
                                                                <div className="flex items-end">
                                                                    <Button variant="destructive" onClick={() => removeSpec(index)} className="w-full">
                                                                        <Trash2 className="mr-2 h-5 w-5" /> Remove
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </Card>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </TabsContent>

                                    {/* Images */}
                                    <TabsContent value="images" className="space-y-8">
                                        <div>
                                            <Label className="text-xl font-medium mb-4 block">Product Images</Label>
                                            <div className="border-4 border-dashed border-gray-300 rounded-3xl p-16 text-center hover:border-blue-400 transition">
                                                <Input type="file" accept="image/*" multiple onChange={handleNewImageUpload} className="hidden" id="image-upload" />
                                                <label htmlFor="image-upload" className="cursor-pointer">
                                                    <Upload className="w-20 h-20 mx-auto text-gray-400 mb-6" />
                                                    <p className="text-2xl font-medium text-gray-700 mb-3">Click to upload or drag & drop</p>
                                                    <p className="text-gray-500">PNG, JPG, GIF up to 10MB • Max 10 images</p>
                                                </label>
                                            </div>
                                            {(existingImages.length > 0 || newImagePreviews.length > 0) && (
                                                <div className="mt-10">
                                                    <div className="flex justify-between items-center mb-6">
                                                        <Label className="text-xl font-medium">
                                                            Current Images ({existingImages.length + newImagePreviews.length}/10)
                                                        </Label>
                                                    </div>
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                                                        {existingImages.map((url) => (
                                                            <div key={url} className="relative group aspect-square rounded-2xl overflow-hidden border-2 border-gray-200 shadow-md">
                                                                <Image src={url} alt="Product" fill className="object-cover" />
                                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition" />
                                                                <Button
                                                                    size="icon"
                                                                    variant="destructive"
                                                                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition"
                                                                    onClick={() => removeExistingImage(url)}
                                                                >
                                                                    <X className="h-5 w-5" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                        {newImagePreviews.map((preview, index) => (
                                                            <div key={`new-${index}`} className="relative group aspect-square rounded-2xl overflow-hidden border-2 border-gray-200 shadow-md bg-gray-100">
                                                                <Image src={preview} alt="New" fill className="object-cover" />
                                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition" />
                                                                <Button
                                                                    size="icon"
                                                                    variant="destructive"
                                                                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition"
                                                                    onClick={() => removeNewImage(index)}
                                                                >
                                                                    <X className="h-5 w-5" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Sidebar - Live Preview & Summary */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Live Preview */}
                        <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 py-8">
                                <CardTitle className="text-2xl font-bold">Live Preview</CardTitle>
                                <CardDescription className="text-base mt-2">
                                    How customers will see this product
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="relative h-96 bg-gray-100">
                                    <Image
                                        src={primaryPreviewImage}
                                        alt="Product preview"
                                        fill
                                        className="object-cover"
                                        priority
                                    />
                                </div>

                                <div className="p-8 space-y-6">
                                    <h3 className="text-2xl font-bold text-gray-900 line-clamp-2">
                                        {watch("name") || "Product Name"}
                                    </h3>

                                    <div className="flex items-baseline gap-4">
                    <span className="text-3xl font-bold text-blue-600">
                      KES {finalPreviewPrice.toLocaleString("en-KE")}
                    </span>
                                        {discountPercent && parseInt(discountPercent) > 0 && (
                                            <>
                        <span className="text-xl text-gray-500 line-through">
                          KES {parseFloat(price || "0").toLocaleString("en-KE")}
                        </span>
                                                <Badge className="bg-red-100 text-red-700 text-lg px-4 py-2">
                                                    Save {discountPercent}%
                                                </Badge>
                                            </>
                                        )}
                                    </div>

                                    {currentRating > 0 && (
                                        <div className="flex items-center gap-3">
                                            <div className="flex">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-6 h-6 ${
                                                            i < Math.floor(currentRating)
                                                                ? "fill-yellow-400 text-yellow-400"
                                                                : "text-gray-300"
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-lg text-gray-700">{selectedRatingOption}</span>
                                        </div>
                                    )}

                                    <p className="text-gray-600 leading-relaxed line-clamp-4">
                                        {watch("description") || "No description provided yet."}
                                    </p>

                                    {warranty && (
                                        <div className="flex items-center gap-3 text-gray-700">
                                            <Shield className="w-6 h-6" />
                                            <span className="text-lg">{warranty}</span>
                                        </div>
                                    )}

                                    {selectedCategory && (
                                        <div className="flex items-center gap-4 pt-6 border-t">
                      <span className="text-4xl">
                        {categoryIcons[selectedCategory.name] || "📦"}
                      </span>
                                            <div>
                                                <p className="text-sm text-gray-500">Category</p>
                                                <p className="font-semibold text-xl">{selectedCategory.name}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Summary */}
                        <Card className="border-0 shadow-2xl rounded-3xl">
                            <CardHeader className="py-8">
                                <CardTitle className="text-2xl font-bold">Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-8">
                                <div className="space-y-6 text-lg">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total Images</span>
                                        <span className="font-semibold">
                      {existingImages.length + newImages.length}/10
                    </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Specifications</span>
                                        <span className="font-semibold">
                      {specs.filter((s) => s.key && s.value).length}
                    </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Rating</span>
                                        <span className="font-semibold">{selectedRatingOption || "Not set"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Discount</span>
                                        <span className="font-semibold">
                      {discountPercent ? `${discountPercent}%` : "None"}
                    </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Warranty</span>
                                        <span className="font-semibold">{warranty || "Not set"}</span>
                                    </div>
                                    <div className="pt-6 border-t">
                                        <div className="flex justify-between items-end">
                      <span className="text-gray-700 font-medium text-xl">
                        Estimated Stock Value
                      </span>
                                            <span className="font-bold text-3xl text-green-600">
                        KES {estimatedRevenue.toLocaleString("en-KE")}
                      </span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-6">
                                <Button
                                    size="lg"
                                    onClick={handleSubmit(onSubmit)}
                                    disabled={updating}
                                    className="w-full py-8 text-xl font-semibold bg-blue-600 hover:bg-blue-700 rounded-2xl"
                                >
                                    {updating ? (
                                        <>
                                            <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                                            Saving Changes...
                                        </>
                                    ) : (
                                        "Save Changes"
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}