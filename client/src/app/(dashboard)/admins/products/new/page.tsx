"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    useCreateProductMutation,
    useGetAuthUserQuery,
    useGetCategoriesQuery,
    useCreateCategoryMutation,
} from "@/state/api";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import AddCategoryDialog from "@/app/(dashboard)/admins/products/components/AddCategoryDialog";

// Validation schema (core fields only — specs are dynamic)
const productSchema = z.object({
    name: z.string().min(3, "Product name must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    price: z.string().refine(
        (val) => {
            const num = parseFloat(val);
            return !isNaN(num) && num > 0;
        },
        "Price must be a positive number"
    ),
    stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
    categoryId: z.coerce.number().min(1, "Please select a category"),
});

type ProductFormData = z.infer<typeof productSchema>;

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

export default function NewProductPage() {
    const router = useRouter();
    const { data: authUser } = useGetAuthUserQuery();
    const [createProduct, { isLoading }] = useCreateProductMutation();
    const [createCategory] = useCreateCategoryMutation();
    const [showAddCategory, setShowAddCategory] = useState(false);

    const {
        data: categories = [],
        isLoading: categoriesLoading,
        isError: categoriesError,
    } = useGetCategoriesQuery();

    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState("basic");

    // Dynamic Specifications State
    const [specs, setSpecs] = useState<{ key: string; value: string }[]>([]);

    const addSpec = () => {
        setSpecs([...specs, { key: "", value: "" }]);
    };

    const updateSpec = (index: number, field: "key" | "value", value: string) => {
        const updated = [...specs];
        updated[index][field] = value;
        setSpecs(updated);
    };

    const removeSpec = (index: number) => {
        setSpecs(specs.filter((_, i) => i !== index));
    };

    const {
        control,
        handleSubmit,
        formState: { errors },
        watch,
        trigger,
    } = useForm<ProductFormData>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: "",
            description: "",
            price: "",
            stock: 0,
            categoryId: 0,
        },
        mode: "onChange",
    });

    useEffect(() => {
        if (authUser && authUser.userRole !== "admin") {
            toast("Access Denied", {
                description: "You don't have permission to create products.",
            });
            router.push("/");
        }
    }, [authUser, router]);

    useEffect(() => {
        if (categoriesError) {
            console.error("Categories query failed:", categoriesError);
            toast.error("Failed to load categories. Check connection or server.");
        }
    }, [categoriesError]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const validFiles = files.filter(
            (file) => file.type.startsWith("image/") && file.size <= 10 * 1024 * 1024
        );

        if (validFiles.length === 0) {
            toast.error("Invalid files", {
                description: "Please upload valid image files (max 10MB each)",
            });
            return;
        }

        if (images.length + validFiles.length > 10) {
            toast.error("Too many images", {
                description: "You can upload up to 10 images maximum",
            });
            return;
        }

        setImages((prev) => [...prev, ...validFiles]);
        validFiles.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews((prev) => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const handleRemoveImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
        setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const handleTabChange = async (value: string) => {
        if (activeTab === "basic") {
            const isValid = await trigger(["name", "description", "categoryId"]);
            if (!isValid) return;
        } else if (activeTab === "details") {
            const isValid = await trigger(["price", "stock"]);
            if (!isValid) return;
        }
        setActiveTab(value);
    };

    const onSubmit = async (data: ProductFormData) => {
        try {
            // Filter and clean specs
            const validSpecs = specs
                .map((s) => ({ key: s.key.trim(), value: s.value.trim() }))
                .filter((s) => s.key && s.value);

            await createProduct({
                ...data,
                images: images.length > 0 ? images : undefined,
                specs: validSpecs.length > 0 ? JSON.stringify(validSpecs) : undefined,
            }).unwrap();

            toast.success("Success!", {
                description: "Product created successfully",
            });
            router.push("/admins/products");
        } catch (error: any) {
            toast.error("Error", {
                description: error?.data?.message || "Failed to create product",
            });
        }
    };

    const price = watch("price");
    const stock = watch("stock");
    const estimatedRevenue = parseFloat(price || "0") * stock;
    const selectedCategoryId = watch("categoryId");
    const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

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
                            <Button
                                variant="secondary"
                                onClick={() => setShowAddCategory(true)}
                                className="rounded-xl"
                            >
                                Add Category
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => router.push("/admins/products")}
                                className="rounded-xl"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit(onSubmit)}
                                disabled={isLoading}
                                className="rounded-xl bg-blue-600 hover:bg-blue-700"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    "Create Product"
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-screen-2xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Form */}
                    <div className="lg:col-span-2">
                        <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                                <CardTitle className="text-2xl font-bold">Product Details</CardTitle>
                                <CardDescription>
                                    Fill in all required information for your new product
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
                                    <TabsList className="grid grid-cols-4 w-full mb-8">
                                        <TabsTrigger
                                            value="basic"
                                            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-xl"
                                        >
                                            <Package className="w-4 h-4 mr-2" /> Basic Info
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="details"
                                            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-xl"
                                        >
                                            <DollarSign className="w-4 h-4 mr-2" /> Pricing & Stock
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="specs"
                                            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-xl"
                                        >
                                            Specifications
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="images"
                                            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-xl"
                                        >
                                            <Layers className="w-4 h-4 mr-2" /> Images
                                        </TabsTrigger>
                                    </TabsList>

                                    {/* Basic Info */}
                                    <TabsContent value="basic" className="space-y-6">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="name" className="text-gray-700 font-medium">
                                                    Product Name *
                                                </Label>
                                                <Controller
                                                    name="name"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Input
                                                            {...field}
                                                            id="name"
                                                            placeholder="e.g., Gaming Laptop Pro Max 2024"
                                                            className={`rounded-xl ${errors.name ? "border-red-500" : ""}`}
                                                        />
                                                    )}
                                                />
                                                {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="category" className="text-gray-700 font-medium">
                                                    Category *
                                                </Label>
                                                <Controller
                                                    name="categoryId"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select
                                                            value={field.value?.toString()}
                                                            onValueChange={(value) => field.onChange(parseInt(value))}
                                                            disabled={categoriesLoading || categoriesError}
                                                        >
                                                            <SelectTrigger
                                                                className={`rounded-xl ${errors.categoryId ? "border-red-500" : ""}`}
                                                            >
                                                                <SelectValue
                                                                    placeholder={
                                                                        categoriesLoading
                                                                            ? "Loading categories..."
                                                                            : categoriesError
                                                                                ? "Failed to load categories"
                                                                                : "Select a category"
                                                                    }
                                                                />
                                                            </SelectTrigger>
                                                            <SelectContent className="rounded-xl">
                                                                {categories.map((category) => (
                                                                    <SelectItem
                                                                        key={category.id}
                                                                        value={category.id.toString()}
                                                                        className="rounded-lg"
                                                                    >
                                                                        <div className="flex items-center gap-2">
                                                                            <span>{categoryIcons[category.name] || "📦"}</span>
                                                                            {category.name}
                                                                        </div>
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                                {errors.categoryId && (
                                                    <p className="text-sm text-red-500">{errors.categoryId.message}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="description" className="text-gray-700 font-medium">
                                                    Description *
                                                </Label>
                                                <Controller
                                                    name="description"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Textarea
                                                            {...field}
                                                            id="description"
                                                            placeholder="Describe the product features, specifications, and benefits..."
                                                            className={`min-h-[180px] rounded-xl ${errors.description ? "border-red-500" : ""}`}
                                                        />
                                                    )}
                                                />
                                                {errors.description && (
                                                    <p className="text-sm text-red-500">{errors.description.message}</p>
                                                )}
                                                <p className="text-sm text-gray-500">
                                                    Include key specifications, features, and selling points
                                                </p>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    {/* Pricing & Stock */}
                                    <TabsContent value="details" className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="price" className="text-gray-700 font-medium">
                                                    Price (KES) *
                                                </Label>
                                                <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 font-medium">
                            KES
                          </span>
                                                    <Controller
                                                        name="price"
                                                        control={control}
                                                        render={({ field }) => (
                                                            <Input
                                                                {...field}
                                                                id="price"
                                                                type="number"
                                                                step="0.01"
                                                                placeholder="0.00"
                                                                className={`pl-16 rounded-xl ${errors.price ? "border-red-500" : ""}`}
                                                            />
                                                        )}
                                                    />
                                                </div>
                                                {errors.price && <p className="text-sm text-red-500">{errors.price.message}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="stock" className="text-gray-700 font-medium">
                                                    Stock Quantity *
                                                </Label>
                                                <div className="relative">
                                                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    <Controller
                                                        name="stock"
                                                        control={control}
                                                        render={({ field }) => (
                                                            <Input
                                                                {...field}
                                                                id="stock"
                                                                type="number"
                                                                placeholder="0"
                                                                className={`pl-10 rounded-xl ${errors.stock ? "border-red-500" : ""}`}
                                                            />
                                                        )}
                                                    />
                                                </div>
                                                {errors.stock && <p className="text-sm text-red-500">{errors.stock.message}</p>}
                                            </div>
                                        </div>

                                        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-600">Estimated Revenue</p>
                                                        <p className="text-2xl font-bold text-gray-900">
                                                            KES {estimatedRevenue.toLocaleString("en-KE", {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2,
                                                        })}
                                                        </p>
                                                    </div>
                                                    <Badge
                                                        variant={estimatedRevenue > 0 ? "default" : "secondary"}
                                                        className={`rounded-xl ${estimatedRevenue > 0 ? "bg-green-600" : ""}`}
                                                    >
                                                        {estimatedRevenue > 0 ? "Active" : "No Stock"}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-gray-500 mt-2">
                                                    Based on current price and stock quantity
                                                </p>
                                            </CardContent>
                                        </Card>
                                    </TabsContent>

                                    {/* Dynamic Specifications Tab */}
                                    <TabsContent value="specs" className="space-y-6">
                                        <div className="bg-gray-50/80 rounded-2xl p-8 border border-gray-200">
                                            <div className="flex items-center justify-between mb-6">
                                                <h3 className="text-2xl font-bold text-gray-900">Specifications</h3>
                                                <Button onClick={addSpec} size="sm" className="bg-blue-600 hover:bg-blue-700">
                                                    <Plus className="mr-2 h-4 w-4" /> Add Specification
                                                </Button>
                                            </div>

                                            {specs.length === 0 ? (
                                                <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-300">
                                                    <Package className="mx-auto h-20 w-20 text-gray-300 mb-4" />
                                                    <p className="text-xl text-gray-600 font-medium">No specifications yet</p>
                                                    <p className="text-gray-500 mt-2 max-w-md mx-auto">
                                                        Add custom specifications like Brand, RAM, Screen Size, Battery Life, etc.
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    {specs.map((spec, index) => (
                                                        <div
                                                            key={index}
                                                            className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-white rounded-xl border border-gray-200 shadow-sm"
                                                        >
                                                            <div>
                                                                <Label className="font-medium">Specification Title</Label>
                                                                <Input
                                                                    placeholder="e.g., Brand, Screen Size, Battery"
                                                                    value={spec.key}
                                                                    onChange={(e) => updateSpec(index, "key", e.target.value)}
                                                                    className="mt-2"
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label className="font-medium">Value</Label>
                                                                <Input
                                                                    placeholder="e.g., Dell, 15.6 inches, 5000 mAh"
                                                                    value={spec.value}
                                                                    onChange={(e) => updateSpec(index, "value", e.target.value)}
                                                                    className="mt-2"
                                                                />
                                                            </div>
                                                            <div className="flex items-end justify-center">
                                                                <Button
                                                                    variant="destructive"
                                                                    size="sm"
                                                                    onClick={() => removeSpec(index)}
                                                                    className="w-full md:w-auto"
                                                                >
                                                                    <Trash2 className="h-4 w-4 mr-2" /> Remove
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </TabsContent>

                                    {/* Images Tab */}
                                    <TabsContent value="images" className="space-y-6">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label className="text-gray-700 font-medium">Product Images</Label>
                                                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-blue-500 transition-colors cursor-pointer">
                                                    <Input
                                                        type="file"
                                                        accept="image/*"
                                                        multiple
                                                        onChange={handleImageUpload}
                                                        className="hidden"
                                                        id="image-upload"
                                                    />
                                                    <label htmlFor="image-upload">
                                                        <Upload className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                                                        <p className="text-gray-700 font-medium mb-2">
                                                            Click to upload or drag and drop
                                                        </p>
                                                        <p className="text-gray-500 text-sm">
                                                            PNG, JPG, GIF up to 10MB (Max 10 images)
                                                        </p>
                                                    </label>
                                                </div>
                                            </div>

                                            {imagePreviews.length > 0 && (
                                                <div>
                                                    <Label className="text-gray-700 font-medium mb-3 block">
                                                        Uploaded Images ({imagePreviews.length}/10)
                                                    </Label>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                        {imagePreviews.map((preview, index) => (
                                                            <div key={index} className="relative group">
                                                                <div className="aspect-square overflow-hidden rounded-xl border border-gray-200">
                                                                    <Image
                                                                        src={preview}
                                                                        alt={`Preview ${index + 1}`}
                                                                        width={200}
                                                                        height={200}
                                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                                    />
                                                                </div>
                                                                <Button
                                                                    size="sm"
                                                                    variant="destructive"
                                                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                    onClick={() => handleRemoveImage(index)}
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </Button>
                                                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                                                                    <p className="text-white text-xs truncate">
                                                                        {images[index]?.name}
                                                                    </p>
                                                                </div>
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

                    {/* Right: Preview & Summary */}
                    <div className="space-y-6">
                        {/* Product Preview */}
                        <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                                <CardTitle className="text-xl font-bold">Product Preview</CardTitle>
                                <CardDescription>How your product will appear to customers</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                    {imagePreviews.length > 0 ? (
                                        <Image
                                            src={imagePreviews[0]}
                                            alt="Product preview"
                                            width={500}
                                            height={500}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="text-center p-8">
                                            <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                            <p className="text-gray-500">No image uploaded yet</p>
                                        </div>
                                    )}
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        {watch("name") || "Product Name"}
                                    </h3>
                                    <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-bold text-blue-600">
                      KES {watch("price") ? Number(watch("price")).toLocaleString("en-KE") : "0"}
                    </span>
                                        {watch("stock") > 0 ? (
                                            <Badge className="bg-green-100 text-green-800 border-green-200 rounded-xl">
                                                In Stock ({watch("stock")})
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="rounded-xl">
                                                Out of Stock
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-gray-600 text-sm line-clamp-2">
                                        {watch("description") || "Product description will appear here"}
                                    </p>
                                    {selectedCategory && (
                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <p className="text-sm text-gray-500">Category</p>
                                            <div className="flex items-center gap-2 mt-1">
                        <span className="text-lg">
                          {categoryIcons[selectedCategory.name] || "📦"}
                        </span>
                                                <span className="font-medium">{selectedCategory.name}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Summary */}
                        <Card className="border-0 shadow-lg rounded-2xl">
                            <CardHeader>
                                <CardTitle className="text-xl font-bold">Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Status</span>
                                        <Badge variant="outline" className="rounded-xl">
                                            Draft
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Images</span>
                                        <span className="font-medium">{imagePreviews.length} uploaded</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Specifications</span>
                                        <span className="font-medium">{specs.filter(s => s.key && s.value).length} added</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Category</span>
                                        <span className="font-medium">
                      {selectedCategory?.name || "Not set"}
                    </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Stock Value</span>
                                        <span className="font-bold text-green-600">
                      KES {estimatedRevenue.toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                    </span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    onClick={handleSubmit(onSubmit)}
                                    disabled={isLoading}
                                    className="w-full rounded-xl bg-blue-600 hover:bg-blue-700"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating Product...
                                        </>
                                    ) : (
                                        "Publish Product"
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
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