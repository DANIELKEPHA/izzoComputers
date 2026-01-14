"use client";

import { useState, useContext, ReactNode } from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    useCreateProductMutation,
    useGetAuthUserQuery,
    useGetCategoriesQuery,
} from "@/state/api";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { toast } from "sonner";

import {
    DollarSign,
    Hash,
    Package,
    Plus,
    Shield,
    Star,
    Trash2,
    Cpu,
    HardDrive,
    MemoryStick,
    Monitor,
    Battery,
    Weight,
    Ruler,
    Layers,
    Grid3x3,
    Camera,
    Zap,
    FileText,
    Search,
    Filter,
    RefreshCw,
    List,
    Table,
    Settings,
    MoreVertical,
    Info,
    Sparkles,
    Gauge,
    Wifi,
    Usb,
    BatteryCharging,
    Database,
    Globe,
    Calendar,
    Tag,
    DownloadCloud,
    UploadCloud,
    Palette,
    ImageIcon,
    Building,
    TreePine,
    CheckCircle,
    Tv2,
    Wand2 as Magic,
    Upload,
    X,
    Percent,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";



// Import UI components
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Label
} from "@/components/ui/label";
import {
    Input
} from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Button
} from "@/components/ui/button";
import { createContext } from "react";

// Preset specification templates for different categories
const specPresets = {
    Electronics: [
        { key: "Brand", value: "", icon: Tag, placeholder: "e.g., Samsung, Apple, Sony" },
        { key: "Model", value: "", icon: Hash, placeholder: "e.g., iPhone 15 Pro Max" },
        { key: "Screen Size", value: "", icon: Monitor, placeholder: "e.g., 6.7 inches" },
        { key: "Resolution", value: "", icon: Tv2, placeholder: "e.g., 2796 × 1290" },
        { key: "Processor", value: "", icon: Cpu, placeholder: "e.g., A17 Pro" },
        { key: "RAM", value: "", icon: MemoryStick, placeholder: "e.g., 8GB" },
        { key: "Storage", value: "", icon: HardDrive, placeholder: "e.g., 256GB" },
        { key: "Battery", value: "", icon: Battery, placeholder: "e.g., 4400mAh" },
        { key: "Camera", value: "", icon: Camera, placeholder: "e.g., 48MP + 12MP" },
        { key: "Operating System", value: "", icon: Cpu, placeholder: "e.g., iOS 17" },
        { key: "Connectivity", value: "", icon: Wifi, placeholder: "e.g., 5G, Wi-Fi 6" },
        { key: "Weight", value: "", icon: Weight, placeholder: "e.g., 221g" },
    ],
    Computers: [
        { key: "Processor", value: "", icon: Cpu, placeholder: "e.g., Intel Core i7-13700H" },
        { key: "Processor Speed", value: "", icon: Gauge, placeholder: "e.g., up to 5.0 GHz" },
        { key: "RAM", value: "", icon: MemoryStick, placeholder: "e.g., 16GB DDR5" },
        { key: "Storage Type", value: "", icon: HardDrive, placeholder: "e.g., SSD" },
        { key: "Storage Capacity", value: "", icon: Database, placeholder: "e.g., 1TB" },
        { key: "Graphics Card", value: "", icon: Cpu, placeholder: "e.g., NVIDIA RTX 4060" },
        { key: "Display", value: "", icon: Monitor, placeholder: "e.g., 15.6\" QHD" },
        { key: "Refresh Rate", value: "", icon: Zap, placeholder: "e.g., 165Hz" },
        { key: "Ports", value: "", icon: Usb, placeholder: "e.g., USB-C, HDMI, Thunderbolt 4" },
        { key: "Operating System", value: "", icon: Layers, placeholder: "e.g., Windows 11 Pro" },
        { key: "Battery Life", value: "", icon: BatteryCharging, placeholder: "e.g., Up to 10 hours" },
        { key: "Weight", value: "", icon: Weight, placeholder: "e.g., 2.1 kg" },
    ],
    Furniture: [
        { key: "Material", value: "", icon: TreePine, placeholder: "e.g., Solid Wood, Fabric" },
        { key: "Color", value: "", icon: Palette, placeholder: "e.g., Walnut Brown" },
        { key: "Dimensions", value: "", icon: Ruler, placeholder: "e.g., 180 × 90 × 75 cm" },
        { key: "Weight Capacity", value: "", icon: Weight, placeholder: "e.g., 150 kg" },
        { key: "Assembly Required", value: "", icon: Settings, placeholder: "e.g., Yes/No" },
        { key: "Warranty", value: "", icon: Shield, placeholder: "e.g., 2 years" },
    ],
    Fashion: [
        { key: "Material", value: "", icon: Layers, placeholder: "e.g., Cotton, Polyester" },
        { key: "Color", value: "", icon: Palette, placeholder: "e.g., Navy Blue" },
        { key: "Size", value: "", icon: Ruler, placeholder: "e.g., M, L, XL" },
        { key: "Fit", value: "", placeholder: "e.g., Slim Fit, Regular" },
        { key: "Care Instructions", value: "", icon: RefreshCw, placeholder: "e.g., Machine wash cold" },
        { key: "Origin", value: "", icon: Globe, placeholder: "e.g., Made in Italy" },
    ],
    Books: [
        { key: "Author", value: "", placeholder: "e.g., J.K. Rowling" },
        { key: "ISBN", value: "", icon: Hash, placeholder: "e.g., 978-0-7475-3269-9" },
        { key: "Publisher", value: "", icon: Building, placeholder: "e.g., Bloomsbury" },
        { key: "Publication Date", value: "", icon: Calendar, placeholder: "e.g., June 26, 1997" },
        { key: "Pages", value: "", icon: FileText, placeholder: "e.g., 223 pages" },
        { key: "Language", value: "", icon: Globe, placeholder: "e.g., English" },
        { key: "Format", value: "", placeholder: "e.g., Hardcover" },
        { key: "Genre", value: "", icon: Tag, placeholder: "e.g., Fantasy, Fiction" },
    ]
};

// Specification categories for better organization
const specCategories = [
    { id: "general", name: "General", icon: Info, color: "bg-blue-100 text-blue-700" },
    { id: "technical", name: "Technical", icon: Cpu, color: "bg-purple-100 text-purple-700" },
    { id: "display", name: "Display", icon: Monitor, color: "bg-green-100 text-green-700" },
    { id: "performance", name: "Performance", icon: Zap, color: "bg-yellow-100 text-yellow-700" },
    { id: "storage", name: "Storage", icon: HardDrive, color: "bg-red-100 text-red-700" },
    { id: "connectivity", name: "Connectivity", icon: Wifi, color: "bg-indigo-100 text-indigo-700" },
    { id: "battery", name: "Battery", icon: Battery, color: "bg-cyan-100 text-cyan-700" },
    { id: "physical", name: "Physical", icon: Weight, color: "bg-orange-100 text-orange-700" },
    { id: "warranty", name: "Warranty", icon: Shield, color: "bg-emerald-100 text-emerald-700" },
    { id: "other", name: "Other", icon: MoreVertical, color: "bg-gray-100 text-gray-700" },
];

// Rating options
const ratingOptions = [
    { rating: 4.8, reviews: 1250, label: "4.8 ★★★★☆ (1,250 reviews)" },
    { rating: 4.7, reviews: 980, label: "4.7 ★★★★☆ (980 reviews)" },
    { rating: 4.6, reviews: 750, label: "4.6 ★★★★☆ (750 reviews)" },
    { rating: 4.5, reviews: 520, label: "4.5 ★★★★☆ (520 reviews)" },
    { rating: 4.4, reviews: 380, label: "4.4 ★★★★☆ (380 reviews)" },
    { rating: 4.3, reviews: 210, label: "4.3 ★★★★☆ (210 reviews)" },
    { rating: 4.2, reviews: 150, label: "4.2 ★★★★☆ (150 reviews)" },
    { rating: 4.1, reviews: 90, label: "4.1 ★★★★☆ (90 reviews)" },
    { rating: 4.0, reviews: 60, label: "4.0 ★★★★☆ (60 reviews)" },
    { rating: 3.9, reviews: 45, label: "3.9 ★★★☆☆ (45 reviews)" },
    { rating: 3.5, reviews: 30, label: "3.5 ★★★☆☆ (30 reviews)" },
    { rating: null, reviews: 0, label: "No rating yet" },
];

// Category icons
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

// Zod schema
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

    // Improved specs state with categories
    const [specs, setSpecs] = useState<{ key: string; value: string; category?: string }[]>([]);
    const [specSearch, setSpecSearch] = useState("");
    const [selectedSpecCategory, setSelectedSpecCategory] = useState<string>("all");
    const [viewMode, setViewMode] = useState<"grid" | "list" | "table">("table");

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

    const { control, handleSubmit, formState: { errors }, watch, trigger } = methods;

    // Get selected category name
    const selectedCategory = categories.find(c => c.id === watch("categoryId"));
    const categoryName = selectedCategory?.name || "General";

    // Filter specs based on search and category
    const filteredSpecs = specs.filter(spec => {
        const matchesSearch = specSearch === "" ||
            spec.key.toLowerCase().includes(specSearch.toLowerCase()) ||
            spec.value.toLowerCase().includes(specSearch.toLowerCase());

        const matchesCategory = selectedSpecCategory === "all" ||
            spec.category === selectedSpecCategory;

        return matchesSearch && matchesCategory;
    });

    const handleApplyPreset = () => {
        const preset = specPresets[categoryName as keyof typeof specPresets] || specPresets.Electronics;
        const newSpecs = preset.map(item => ({
            key: item.key,
            value: "",
            category: getCategoryForSpec(item.key)
        }));

        // Merge with existing specs, avoiding duplicates
        setSpecs(prev => {
            const existingKeys = new Set(prev.map(s => s.key));
            const uniqueNewSpecs = newSpecs.filter(s => !existingKeys.has(s.key));
            return [...prev, ...uniqueNewSpecs];
        });

        toast.success("Preset applied!", {
            description: `Added ${categoryName} specifications template`
        });
    };

    const getCategoryForSpec = (key: string): string => {
        const keyLower = key.toLowerCase();
        if (keyLower.includes('processor') || keyLower.includes('cpu') || keyLower.includes('gpu')) return "performance";
        if (keyLower.includes('ram') || keyLower.includes('memory')) return "performance";
        if (keyLower.includes('storage') || keyLower.includes('ssd') || keyLower.includes('hdd')) return "storage";
        if (keyLower.includes('screen') || keyLower.includes('display') || keyLower.includes('resolution')) return "display";
        if (keyLower.includes('battery')) return "battery";
        if (keyLower.includes('wifi') || keyLower.includes('bluetooth') || keyLower.includes('connectivity')) return "connectivity";
        if (keyLower.includes('weight') || keyLower.includes('dimension')) return "physical";
        if (keyLower.includes('warranty')) return "warranty";
        return "general";
    };

    const addSpec = (category = "general") => {
        setSpecs([...specs, { key: "", value: "", category }]);
    };

    const updateSpec = (index: number, field: "key" | "value" | "category", value: string) => {
        const updated = [...specs];
        updated[index][field] = value;
        setSpecs(updated);
    };

    const removeSpec = (index: number) => {
        setSpecs(specs.filter((_, i) => i !== index));
    };

    const clearAllSpecs = () => {
        if (specs.length > 0) {
            setSpecs([]);
            toast.info("All specifications cleared");
        }
    };

    const exportSpecs = () => {
        const dataStr = JSON.stringify(specs, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const link = document.createElement('a');
        link.setAttribute('href', dataUri);
        link.setAttribute('download', 'specifications.json');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Specifications exported!");
    };

    const importSpecs = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedSpecs = JSON.parse(event.target?.result as string);
                if (Array.isArray(importedSpecs)) {
                    setSpecs(importedSpecs);
                    toast.success("Specifications imported!");
                }
            } catch (error) {
                toast.error("Invalid file format");
            }
        };
        reader.readAsText(file);
    };

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

    // Tab change handler
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

    const estimatedRevenue = parseFloat(watch("price") || "0") * Number(watch("stock"));
    const currentRating = ratingOptions.find(opt => opt.label === selectedRatingOption)?.rating ?? 0;

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">

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
                                    <Settings className="w-4 h-4 mr-2" /> Specifications
                                </TabsTrigger>
                                <TabsTrigger value="images" className="rounded-xl">
                                    <ImageIcon className="w-4 h-4 mr-2" /> Images
                                </TabsTrigger>
                            </TabsList>

                            {/* ==================== BASIC INFO TAB ==================== */}
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

                            {/* ==================== PRICING & STOCK TAB ==================== */}
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

                            {/* ==================== MARKETING TAB ==================== */}
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

                            {/* ==================== SPECIFICATIONS TAB ==================== */}
                            <TabsContent value="specs" className="space-y-6 animate-in fade-in-50">
                                <div className="space-y-6">
                                    {/* Header with actions */}
                                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 p-6 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 rounded-2xl border">
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                                <Settings className="w-6 h-6 text-blue-600" />
                                                Product Specifications
                                            </h3>
                                            <p className="text-gray-600 mt-1">
                                                Define detailed specifications that help customers make informed decisions
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <Button
                                                type="button"
                                                onClick={handleApplyPreset}
                                                variant="outline"
                                                className="rounded-lg border-blue-200 hover:bg-blue-50"
                                            >
                                                <Sparkles className="w-4 h-4 mr-2" />
                                                Apply {categoryName} Preset
                                            </Button>
                                            <Button
                                                type="button"
                                                onClick={exportSpecs}
                                                variant="outline"
                                                className="rounded-lg"
                                                disabled={specs.length === 0}
                                            >
                                                <DownloadCloud className="w-4 h-4 mr-2" />
                                                Export
                                            </Button>
                                            <label htmlFor="import-specs">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="rounded-lg cursor-pointer"
                                                >
                                                    <UploadCloud className="w-4 h-4 mr-2" />
                                                    Import
                                                </Button>
                                                <input
                                                    type="file"
                                                    id="import-specs"
                                                    accept=".json"
                                                    onChange={importSpecs}
                                                    className="hidden"
                                                />
                                            </label>
                                            {specs.length > 0 && (
                                                <Button
                                                    type="button"
                                                    onClick={clearAllSpecs}
                                                    variant="outline"
                                                    className="rounded-lg text-red-600 border-red-200 hover:bg-red-50"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Clear All
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Search and filters */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <Input
                                                placeholder="Search specifications..."
                                                value={specSearch}
                                                onChange={(e) => setSpecSearch(e.target.value)}
                                                className="pl-10 rounded-xl"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Filter className="w-4 h-4 text-gray-500" />
                                            <span className="text-sm text-gray-600">Filter by:</span>
                                            <Select value={selectedSpecCategory} onValueChange={setSelectedSpecCategory}>
                                                <SelectTrigger className="w-40 rounded-xl">
                                                    <SelectValue placeholder="All categories" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Categories</SelectItem>
                                                    {specCategories.map(cat => (
                                                        <SelectItem key={cat.id} value={cat.id}>
                                                            <div className="flex items-center gap-2">
                                                                <div className={`p-1 rounded ${cat.color}`}>
                                                                    <cat.icon className="w-3 h-3" />
                                                                </div>
                                                                {cat.name}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-600">View:</span>
                                            <div className="flex bg-gray-100 p-1 rounded-lg">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant={viewMode === "table" ? "default" : "ghost"}
                                                    onClick={() => setViewMode("table")}
                                                    className="rounded-lg"
                                                >
                                                    <Table className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant={viewMode === "grid" ? "default" : "ghost"}
                                                    onClick={() => setViewMode("grid")}
                                                    className="rounded-lg"
                                                >
                                                    <Grid3x3 className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant={viewMode === "list" ? "default" : "ghost"}
                                                    onClick={() => setViewMode("list")}
                                                    className="rounded-lg"
                                                >
                                                    <List className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quick add buttons */}
                                    <div className="p-4 bg-gray-50 rounded-xl border">
                                        <h4 className="font-medium text-gray-700 mb-3">Quick Add Common Specifications</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {specCategories.map(cat => (
                                                <Button
                                                    key={cat.id}
                                                    type="button"
                                                    onClick={() => addSpec(cat.id)}
                                                    variant="outline"
                                                    size="sm"
                                                    className="rounded-lg"
                                                >
                                                    <cat.icon className="w-4 h-4 mr-2" />
                                                    Add {cat.name}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Specifications display area */}
                                    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                                        {filteredSpecs.length === 0 ? (
                                            <div className="text-center py-16">
                                                <Settings className="mx-auto h-20 w-20 text-gray-300 mb-4" />
                                                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                                                    No specifications added yet
                                                </h3>
                                                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                                    Add specifications to help customers understand your product better.
                                                    You can apply a preset or add them manually.
                                                </p>
                                                <Button
                                                    type="button"
                                                    onClick={handleApplyPreset}
                                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                                >
                                                    <Magic className="w-4 h-4 mr-2" />
                                                    Apply {categoryName} Preset Template
                                                </Button>
                                            </div>
                                        ) : viewMode === "table" ? (
                                            <div className="overflow-x-auto">
                                                <table className="w-full">
                                                    <thead>
                                                    <tr className="border-b bg-gray-50">
                                                        <th className="text-left p-4 font-medium text-gray-700">Category</th>
                                                        <th className="text-left p-4 font-medium text-gray-700">Specification</th>
                                                        <th className="text-left p-4 font-medium text-gray-700">Value</th>
                                                        <th className="text-left p-4 font-medium text-gray-700">Actions</th>
                                                    </tr>
                                                    </thead>
                                                    <tbody>
                                                    {filteredSpecs.map((spec, index) => {
                                                        const category = specCategories.find(c => c.id === spec.category) || specCategories[0];
                                                        return (
                                                            <tr key={index} className="border-b hover:bg-gray-50">
                                                                <td className="p-4">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className={`p-2 rounded-lg ${category.color}`}>
                                                                            <category.icon className="w-4 h-4" />
                                                                        </div>
                                                                        <span className="font-medium text-gray-700">{category.name}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="p-4">
                                                                    <Input
                                                                        placeholder="Enter specification name"
                                                                        value={spec.key}
                                                                        onChange={(e) => updateSpec(index, "key", e.target.value)}
                                                                        className="border-0 focus:ring-0 p-0 h-8"
                                                                    />
                                                                </td>
                                                                <td className="p-4">
                                                                    <Input
                                                                        placeholder="Enter value"
                                                                        value={spec.value}
                                                                        onChange={(e) => updateSpec(index, "value", e.target.value)}
                                                                        className="border-0 focus:ring-0 p-0 h-8"
                                                                    />
                                                                </td>
                                                                <td className="p-4">
                                                                    <div className="flex items-center gap-2">
                                                                        <Select
                                                                            value={spec.category || "general"}
                                                                            onValueChange={(value) => updateSpec(index, "category", value)}
                                                                        >
                                                                            <SelectTrigger className="h-8 w-32">
                                                                                <SelectValue />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                {specCategories.map(cat => (
                                                                                    <SelectItem key={cat.id} value={cat.id}>
                                                                                        <div className="flex items-center gap-2">
                                                                                            <cat.icon className="w-4 h-4" />
                                                                                            {cat.name}
                                                                                        </div>
                                                                                    </SelectItem>
                                                                                ))}
                                                                            </SelectContent>
                                                                        </Select>
                                                                        <Button
                                                                            type="button"
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            onClick={() => removeSpec(index)}
                                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                        >
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </Button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : viewMode === "grid" ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                                                {filteredSpecs.map((spec, index) => {
                                                    const category = specCategories.find(c => c.id === spec.category) || specCategories[0];
                                                    return (
                                                        <div key={index} className="bg-gray-50 rounded-xl p-4 border">
                                                            <div className="flex items-center justify-between mb-3">
                                                                <div className="flex items-center gap-2">
                                                                    <div className={`p-2 rounded-lg ${category.color}`}>
                                                                        <category.icon className="w-4 h-4" />
                                                                    </div>
                                                                    <Select
                                                                        value={spec.category || "general"}
                                                                        onValueChange={(value) => updateSpec(index, "category", value)}
                                                                    >
                                                                        <SelectTrigger className="h-8 w-auto border-0 bg-transparent p-0 hover:bg-transparent">
                                                                            <SelectValue />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {specCategories.map(cat => (
                                                                                <SelectItem key={cat.id} value={cat.id}>
                                                                                    <div className="flex items-center gap-2">
                                                                                        <cat.icon className="w-4 h-4" />
                                                                                        {cat.name}
                                                                                    </div>
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => removeSpec(index)}
                                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Input
                                                                    placeholder="Specification name"
                                                                    value={spec.key}
                                                                    onChange={(e) => updateSpec(index, "key", e.target.value)}
                                                                    className="bg-white"
                                                                />
                                                                <Textarea
                                                                    placeholder="Enter value or description"
                                                                    value={spec.value}
                                                                    onChange={(e) => updateSpec(index, "value", e.target.value)}
                                                                    className="bg-white min-h-[80px]"
                                                                />
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="space-y-3 p-6">
                                                {filteredSpecs.map((spec, index) => {
                                                    const category = specCategories.find(c => c.id === spec.category) || specCategories[0];
                                                    return (
                                                        <div key={index} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50">
                                                            <div className={`p-2 rounded-lg ${category.color} mt-1`}>
                                                                <category.icon className="w-4 h-4" />
                                                            </div>
                                                            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                <div>
                                                                    <label className="text-sm text-gray-600 mb-1 block">Specification</label>
                                                                    <Input
                                                                        placeholder="e.g., Processor"
                                                                        value={spec.key}
                                                                        onChange={(e) => updateSpec(index, "key", e.target.value)}
                                                                        className="bg-white"
                                                                    />
                                                                </div>
                                                                <div className="md:col-span-2">
                                                                    <label className="text-sm text-gray-600 mb-1 block">Value</label>
                                                                    <Input
                                                                        placeholder="e.g., Intel Core i7-13700H"
                                                                        value={spec.value}
                                                                        onChange={(e) => updateSpec(index, "value", e.target.value)}
                                                                        className="bg-white"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Select
                                                                    value={spec.category || "general"}
                                                                    onValueChange={(value) => updateSpec(index, "category", value)}
                                                                >
                                                                    <SelectTrigger className="h-9 w-32">
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {specCategories.map(cat => (
                                                                            <SelectItem key={cat.id} value={cat.id}>
                                                                                <div className="flex items-center gap-2">
                                                                                    <cat.icon className="w-4 h-4" />
                                                                                    {cat.name}
                                                                                </div>
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => removeSpec(index)}
                                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {/* Add new spec form */}
                                        <div className="p-6 border-t">
                                            <h4 className="font-medium text-gray-700 mb-4">Add New Specification</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                                <div className="md:col-span-3">
                                                    <Select defaultValue="general">
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select category" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {specCategories.map(cat => (
                                                                <SelectItem key={cat.id} value={cat.id}>
                                                                    <div className="flex items-center gap-2">
                                                                        <cat.icon className="w-4 h-4" />
                                                                        {cat.name}
                                                                    </div>
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="md:col-span-4">
                                                    <Input
                                                        placeholder="Specification name"
                                                        id="new-spec-key"
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                const key = (e.target as HTMLInputElement).value;
                                                                if (key.trim()) {
                                                                    addSpec("general");
                                                                    (e.target as HTMLInputElement).value = '';
                                                                }
                                                            }
                                                        }}
                                                    />
                                                </div>
                                                <div className="md:col-span-4">
                                                    <Input
                                                        placeholder="Specification value"
                                                        id="new-spec-value"
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                const keyInput = document.getElementById('new-spec-key') as HTMLInputElement;
                                                                const valueInput = e.target as HTMLInputElement;
                                                                if (keyInput.value.trim() && valueInput.value.trim()) {
                                                                    addSpec("general");
                                                                    keyInput.value = '';
                                                                    valueInput.value = '';
                                                                }
                                                            }
                                                        }}
                                                    />
                                                </div>
                                                <div className="md:col-span-1">
                                                    <Button
                                                        type="button"
                                                        onClick={() => {
                                                            const keyInput = document.getElementById('new-spec-key') as HTMLInputElement;
                                                            const valueInput = document.getElementById('new-spec-value') as HTMLInputElement;
                                                            if (keyInput.value.trim() && valueInput.value.trim()) {
                                                                addSpec("general");
                                                                keyInput.value = '';
                                                                valueInput.value = '';
                                                            }
                                                        }}
                                                        className="w-full bg-blue-600 hover:bg-blue-700"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Statistics */}
                                    {specs.length > 0 && (
                                        <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                                            <div className="flex flex-wrap items-center justify-between gap-4">
                                                <div className="flex items-center gap-6">
                                                    <div className="text-center">
                                                        <div className="text-2xl font-bold text-emerald-700">{specs.length}</div>
                                                        <div className="text-sm text-emerald-600">Total Specifications</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-2xl font-bold text-blue-700">
                                                            {new Set(specs.map(s => s.category)).size}
                                                        </div>
                                                        <div className="text-sm text-blue-600">Categories</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-2xl font-bold text-purple-700">
                                                            {specs.filter(s => s.key && s.value).length}
                                                        </div>
                                                        <div className="text-sm text-purple-600">Completed</div>
                                                    </div>
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    <CheckCircle className="w-4 h-4 inline mr-1 text-emerald-500" />
                                                    Specifications are ready to save
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            {/* ==================== IMAGES TAB ==================== */}
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
                                            <label htmlFor="image-upload" className="cursor-pointer">
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
                        onFormSubmit: handleSubmit(onSubmit),
                        currentRating,
                    }}
                >
                    {children}
                </ProductFormContext.Provider>
            </form>
        </FormProvider>
    );
}

// Context type definition
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