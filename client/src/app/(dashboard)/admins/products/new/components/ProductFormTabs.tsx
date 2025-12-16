"use client";

import {useState, useEffect, useContext, ReactNode} from "react";
import { useForm, Controller, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    useCreateProductMutation,
    useGetAuthUserQuery,
    useGetCategoriesQuery,
} from "@/state/api";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// Realistic rating options (admin picks one → sets both rating + review count)
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

// Zod schema for core fields
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

type ProductFormTabsProps = {
    onSubmitSuccess: () => void;
    children: ReactNode;
};
export default function ProductFormTabs({ onSubmitSuccess, children }: ProductFormTabsProps) {
    const router = useRouter();
    const { data: authUser } = useGetAuthUserQuery();
    const [createProduct, { isLoading: creating }] = useCreateProductMutation();
    const {
        data: categories = [],
        isLoading: categoriesLoading,
        isError: categoriesError,
    } = useGetCategoriesQuery();

    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState("basic");

    // Dynamic specs
    const [specs, setSpecs] = useState<{ key: string; value: string }[]>([]);

    // Marketing fields
    const [selectedRatingOption, setSelectedRatingOption] = useState<string>("");
    const [discountPercent, setDiscountPercent] = useState<string>("");
    const [warranty, setWarranty] = useState<string>("");

    const methods = useForm<ProductFormData>({
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

    const {
        control,
        handleSubmit,
        formState: { errors },
        watch,
        trigger,
    } = methods;

    const onSubmit = async (data: ProductFormData) => {
        try {
            const selectedOption = ratingOptions.find(
                (opt) => opt.label === selectedRatingOption
            );

            const validSpecs = specs
                .map((s) => ({ key: s.key.trim(), value: s.value.trim() }))
                .filter((s) => s.key && s.value);

            await createProduct({
                ...data,
                images: images.length > 0 ? images : undefined,
                specs: validSpecs.length > 0 ? JSON.stringify(validSpecs) : undefined,
                averageRating: selectedOption?.rating ?? null,
                reviewCount: selectedOption?.reviews ?? null,
                discountPercent: discountPercent ? parseInt(discountPercent, 10) : null,
                warranty: warranty.trim() || null,
            }).unwrap();

            toast.success("Success!", { description: "Product created successfully" });
            onSubmitSuccess();
        } catch (error: any) {
            toast.error("Error", {
                description: error?.data?.message || "Failed to create product",
            });
        }
    };

    const onFormSubmit = handleSubmit(onSubmit);

    const selectedCategory = categories.find(c => c.id === watch("categoryId"));

    const price = watch("price");
    const stock = watch("stock");
    const estimatedRevenue = parseFloat(price || "0") * Number(stock);

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
            toast.error("Failed to load categories. Check your connection.");
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

    const currentRating = ratingOptions.find(
        opt => opt.label === selectedRatingOption
    )?.rating ?? 0;

    const handleRemoveImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
        setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    };

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

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                        <CardTitle className="text-2xl font-bold">Product Details</CardTitle>
                        <CardDescription>
                            Fill in all required information for your new product
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-6">
                        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
                            <TabsList className="grid grid-cols-5 w-full mb-8">
                                <TabsTrigger value="basic" className="rounded-xl">
                                    <Package className="w-4 h-4 mr-2" /> Basic Info
                                </TabsTrigger>
                                <TabsTrigger value="details" className="rounded-xl">
                                    <DollarSign className="w-4 h-4 mr-2" /> Pricing & Stock
                                </TabsTrigger>
                                <TabsTrigger value="marketing" className="rounded-xl">
                                    <Star className="w-4 h-4 mr-2" /> Marketing
                                </TabsTrigger>
                                <TabsTrigger value="specs" className="rounded-xl">
                                    Specifications
                                </TabsTrigger>
                                <TabsTrigger value="images" className="rounded-xl">
                                    Images
                                </TabsTrigger>
                            </TabsList>

                            {/* ==================== BASIC INFO ==================== */}
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
                                                    onValueChange={(val) => field.onChange(parseInt(val))}
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
                                                                        ? "Failed to load"
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
                                                    placeholder="Describe features, benefits, and key specs..."
                                                    className={`min-h-[180px] rounded-xl ${errors.description ? "border-red-500" : ""}`}
                                                />
                                            )}
                                        />
                                        {errors.description && (
                                            <p className="text-sm text-red-500">{errors.description.message}</p>
                                        )}
                                        <p className="text-sm text-gray-500">
                                            Include key selling points and specifications
                                        </p>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* ==================== PRICING & STOCK ==================== */}
                            <TabsContent value="details" className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="price" className="text-gray-700 font-medium">
                                            Price (KES) *
                                        </Label>
                                        <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 font-medium">
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
                                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
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
                                            Based on current price × stock quantity
                                        </p>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* ==================== MARKETING ==================== */}
                            <TabsContent value="marketing" className="space-y-6">
                                <div className="space-y-6 bg-gray-50/60 rounded-2xl p-6 border">
                                    <div className="space-y-2">
                                        <Label className="text-gray-700 font-medium flex items-center gap-2">
                                            <Star className="w-5 h-5 text-yellow-500" />
                                            Customer Rating & Reviews
                                        </Label>
                                        <Select
                                            value={selectedRatingOption}
                                            onValueChange={setSelectedRatingOption}
                                        >
                                            <SelectTrigger className="rounded-xl">
                                                <SelectValue placeholder="Choose a realistic rating..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {ratingOptions.map((opt) => (
                                                    <SelectItem key={opt.label} value={opt.label}>
                                                        {opt.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-sm text-gray-500">
                                            Sets both star rating and review count automatically
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-gray-700 font-medium flex items-center gap-2">
                                            <Percent className="w-5 h-5 text-red-600" />
                                            Discount Percentage (optional)
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                type="number"
                                                min="0"
                                                max="100"
                                                placeholder="e.g., 20"
                                                value={discountPercent}
                                                onChange={(e) => setDiscountPercent(e.target.value)}
                                                className="pr-12 rounded-xl"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600">%</span>
                                        </div>
                                        <p className="text-sm text-gray-500">Shows &#34;Save X%&#34; on product card</p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-gray-700 font-medium flex items-center gap-2">
                                            <Shield className="w-5 h-5 text-blue-600" />
                                            Warranty (optional)
                                        </Label>
                                        <Input
                                            placeholder="e.g., 2-year warranty included"
                                            value={warranty}
                                            onChange={(e) => setWarranty(e.target.value)}
                                            className="rounded-xl"
                                        />
                                        <p className="text-sm text-gray-500">Displayed with shield icon</p>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* ==================== SPECIFICATIONS ==================== */}
                            <TabsContent value="specs" className="space-y-6">
                                <div className="bg-gray-50/80 rounded-2xl p-8 border border-gray-200">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-2xl font-bold text-gray-900">Specifications</h3>
                                        <Button
                                            type="button"
                                            onClick={addSpec}
                                            size="sm"
                                            className="bg-blue-600 hover:bg-blue-700 rounded-xl"
                                        >
                                            <Plus className="mr-2 h-4 w-4" /> Add Specification
                                        </Button>
                                    </div>

                                    {specs.length === 0 ? (
                                        <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-300">
                                            <Package className="mx-auto h-20 w-20 text-gray-300 mb-4" />
                                            <p className="text-xl text-gray-600 font-medium">No specifications yet</p>
                                            <p className="text-gray-500 mt-2 max-w-md mx-auto">
                                                Add custom specs like Processor, RAM, Storage, Screen Size, etc.
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
                                                        <Label className="font-medium">Title</Label>
                                                        <Input
                                                            placeholder="e.g., Processor"
                                                            value={spec.key}
                                                            onChange={(e) => updateSpec(index, "key", e.target.value)}
                                                            className="mt-2 rounded-lg"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label className="font-medium">Value</Label>
                                                        <Input
                                                            placeholder="e.g., Intel Core i7-13700H"
                                                            value={spec.value}
                                                            onChange={(e) => updateSpec(index, "value", e.target.value)}
                                                            className="mt-2 rounded-lg"
                                                        />
                                                    </div>
                                                    <div className="flex items-end">
                                                        <Button
                                                            type="button"
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => removeSpec(index)}
                                                            className="w-full md:w-auto rounded-lg"
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

                            {/* ==================== IMAGES ==================== */}
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
                                                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
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

                <ProductFormContext.Provider
                    value={{
                        images,
                        imagePreviews,
                        specs,
                        selectedRatingOption,
                        discountPercent,
                        warranty,
                        estimatedRevenue,
                        creating,
                        price: watch("price"),
                        name: watch("name"),
                        description: watch("description"),
                        stock: watch("stock"),
                        categoryId: watch("categoryId"),
                        categories,
                        selectedCategory,
                        onFormSubmit,
                        currentRating,
                    }}
                >
                    {children}
                </ProductFormContext.Provider>

            </form>
        </FormProvider>
    );
}

// Context to share state with ProductPreview and ProductSummary
import { createContext } from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {DollarSign, Hash, Package, Percent, Plus, Shield, Star, Trash2, Upload, X} from "lucide-react";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Textarea} from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";

type FormContextType = {
    images: File[];
    imagePreviews: string[];
    specs: { key: string; value: string }[];
    selectedRatingOption: string;
    discountPercent: string;
    warranty: string;
    estimatedRevenue: number;
    creating: boolean;
    price: string;
    name: string;
    description: string;
    stock: number;
    categoryId: number;
    categories: any[];
    selectedCategory?: any;
    onFormSubmit: () => void;
    currentRating: number;
};

export const ProductFormContext = createContext<FormContextType | undefined>(undefined);

export const useProductFormContext = () => {
    const context = useContext(ProductFormContext);
    if (context === undefined) {
        throw new Error("useProductFormContext must be used within a ProductFormTabs provider");
    }
    return context;
};