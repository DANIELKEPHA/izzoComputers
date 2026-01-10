"use client";

import React from "react";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Clock, Sparkles, Eye, Palette, Badge, Tag, Timer, Zap, Settings, AlertCircle } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
    useCreateAdvertMutation,
    useUpdateAdvertMutation,
    useGetCategoriesQuery,
} from "@/state/api";

import {
    advertSchema,
    updateAdvertSchema,
    AdvertFormData,
    UpdateAdvertFormData,
} from "@/lib/schemas";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge as UIBadge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AdvertFormProps {
    initialData?: UpdateAdvertFormData;
    onSuccess?: () => void;
}

const AdvertForm: React.FC<AdvertFormProps> = ({ initialData, onSuccess }) => {
    const isEdit = !!initialData?.id;

    const [createAdvert, { isLoading: isCreating }] = useCreateAdvertMutation();
    const [updateAdvert, { isLoading: isUpdating }] = useUpdateAdvertMutation();
    const { data: categories = [], isLoading: categoriesLoading } =
        useGetCategoriesQuery();

    const schema = isEdit ? updateAdvertSchema : advertSchema;

    const {
        register,
        handleSubmit,
        control,
        setValue,
        watch,
        formState: { errors },
    } = useForm<AdvertFormData | UpdateAdvertFormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            title: initialData?.title || "",
            subtitle: initialData?.subtitle || "",
            description: initialData?.description || "",
            ctaText: initialData?.ctaText || "",
            ctaLink: initialData?.ctaLink || "",
            backgroundColor: initialData?.backgroundColor || "#1a1a2e",
            textColor: initialData?.textColor || "#FFFFFF",
            badge: initialData?.badge || "",
            badgeColor: initialData?.badgeColor || "#EF4444",
            discount: initialData?.discount || "",
            timerText: initialData?.timerText || "",
            displayDuration: initialData?.displayDuration || 10,
            startsAt: initialData?.startsAt ? new Date(initialData.startsAt) : new Date(),
            endsAt: initialData?.endsAt ? new Date(initialData.endsAt) : undefined,
            priority: initialData?.priority || 0,
            isActive: initialData?.isActive ?? true,
            categoryIds: initialData?.categoryIds || [],
        },
    });

    // Watch form values for live preview
    const formValues = watch();

    const selectedCategories = (formValues.categoryIds || []) as number[];

    const handleCategoryToggle = (categoryId: number, checked: boolean) => {
        const current = selectedCategories;
        if (checked) {
            setValue("categoryIds", [...current, categoryId], { shouldValidate: true });
        } else {
            setValue(
                "categoryIds",
                current.filter((id) => id !== categoryId),
                { shouldValidate: true }
            );
        }
    };

    const onSubmit = async (data: AdvertFormData | UpdateAdvertFormData) => {
        try {
            const apiPayload = {
                ...data,
                startsAt: data.startsAt ? data.startsAt.toISOString() : undefined,
                endsAt: data.endsAt ? data.endsAt.toISOString() : null,
            };

            if (isEdit) {
                await updateAdvert({
                    id: initialData!.id,
                    ...apiPayload
                } as any).unwrap();
            } else {
                await createAdvert(apiPayload as any).unwrap();
            }
            onSuccess?.();
        } catch (err) {
            console.error("Failed to save advert:", err);
        }
    };

    // Check if form values would create a gradient background
    const isGradientBackground = formValues.backgroundColor?.includes('gradient') ||
        formValues.backgroundColor?.includes('linear-gradient');

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                        <Zap className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {isEdit ? "Edit Advert" : "Create New Advert"}
                    </h1>
                </div>
                <p className="text-gray-600">
                    {isEdit
                        ? "Update your advert details and preview changes in real-time"
                        : "Create a new promotional banner with live preview"
                    }
                </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Form Section */}
                <div className="space-y-8">
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="w-5 h-5 text-blue-600" />
                                Advert Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                <Tabs defaultValue="content" className="w-full">
                                    <TabsList className="grid w-full grid-cols-3">
                                        <TabsTrigger value="content" className="flex items-center gap-2">
                                            <Tag className="w-4 h-4" />
                                            Content
                                        </TabsTrigger>
                                        <TabsTrigger value="design" className="flex items-center gap-2">
                                            <Palette className="w-4 h-4" />
                                            Design
                                        </TabsTrigger>
                                        <TabsTrigger value="settings" className="flex items-center gap-2">
                                            <Settings className="w-4 h-4" />
                                            Settings
                                        </TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="content" className="space-y-6 pt-6">
                                        {/* Basic Info */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                <Badge className="w-4 h-4" />
                                                <h3 className="font-semibold text-gray-900">Main Content</h3>
                                            </div>

                                            <div className="grid grid-cols-1 gap-4">
                                                <div>
                                                    <Label htmlFor="title" className="font-medium">Title *</Label>
                                                    <Input
                                                        id="title"
                                                        {...register("title")}
                                                        placeholder="BLACK FRIDAY EXTRAVAGANZA"
                                                        className="mt-1.5 h-11"
                                                    />
                                                    {errors.title && (
                                                        <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <Label htmlFor="subtitle" className="font-medium">Subtitle *</Label>
                                                    <Input
                                                        id="subtitle"
                                                        {...register("subtitle")}
                                                        placeholder="UP TO 70% OFF SITEWIDE"
                                                        className="mt-1.5 h-11"
                                                    />
                                                    {errors.subtitle && (
                                                        <p className="text-red-500 text-sm mt-1">{errors.subtitle.message}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <Label htmlFor="description" className="font-medium">Description</Label>
                                                    <Textarea
                                                        id="description"
                                                        {...register("description")}
                                                        rows={2}
                                                        placeholder="Limited time offer! Don't miss out on our biggest sale of the year."
                                                        className="mt-1.5"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* CTA Section */}
                                        <div className="space-y-4">
                                            <h3 className="font-semibold text-gray-900">Call to Action</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="ctaText" className="font-medium">Button Text *</Label>
                                                    <Input
                                                        id="ctaText"
                                                        {...register("ctaText")}
                                                        placeholder="SHOP DEALS NOW"
                                                        className="mt-1.5 h-11"
                                                    />
                                                    {errors.ctaText && (
                                                        <p className="text-red-500 text-sm mt-1">{errors.ctaText.message}</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <Label htmlFor="ctaLink" className="font-medium">Button Link *</Label>
                                                    <Input
                                                        id="ctaLink"
                                                        type="url"
                                                        {...register("ctaLink")}
                                                        placeholder="https://example.com/sales"
                                                        className="mt-1.5 h-11"
                                                    />
                                                    {errors.ctaLink && (
                                                        <p className="text-red-500 text-sm mt-1">{errors.ctaLink.message}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="design" className="space-y-6 pt-6">
                                        {/* Colors */}
                                        <div className="space-y-4">
                                            <h3 className="font-semibold text-gray-900">Colors</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="font-medium">Background</Label>
                                                    <div className="flex gap-2">
                                                        <Input
                                                            type="color"
                                                            {...register("backgroundColor")}
                                                            className="h-12 w-16 cursor-pointer rounded-lg"
                                                        />
                                                        <Input
                                                            type="text"
                                                            {...register("backgroundColor")}
                                                            placeholder="Color or gradient"
                                                            className="flex-1"
                                                        />
                                                    </div>
                                                    <p className="text-xs text-gray-500">
                                                        Use hex code or CSS gradient
                                                    </p>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="font-medium">Text Color</Label>
                                                    <div className="flex gap-2">
                                                        <Input
                                                            type="color"
                                                            {...register("textColor")}
                                                            className="h-12 w-16 cursor-pointer rounded-lg"
                                                        />
                                                        <Input
                                                            type="text"
                                                            {...register("textColor")}
                                                            className="flex-1"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* Visual Elements */}
                                        <div className="space-y-4">
                                            <h3 className="font-semibold text-gray-900">Visual Elements</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="font-medium">Badge</Label>
                                                    <Input
                                                        id="badge"
                                                        {...register("badge")}
                                                        placeholder="LIMITED TIME"
                                                        className="h-11"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="font-medium">Badge Color</Label>
                                                    <div className="flex gap-2">
                                                        <Input
                                                            type="color"
                                                            {...register("badgeColor")}
                                                            className="h-12 w-16 cursor-pointer rounded-lg"
                                                        />
                                                        <Input
                                                            type="text"
                                                            {...register("badgeColor")}
                                                            className="flex-1"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="discount" className="font-medium">Discount Text</Label>
                                                    <Input
                                                        id="discount"
                                                        {...register("discount")}
                                                        placeholder="70% OFF"
                                                        className="mt-1.5 h-11"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="timerText" className="font-medium">Timer Text</Label>
                                                    <Input
                                                        id="timerText"
                                                        {...register("timerText")}
                                                        placeholder="Ends in 2 days"
                                                        className="mt-1.5 h-11"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="settings" className="space-y-6 pt-6">
                                        {/* Timing */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                <Timer className="w-4 h-4 text-blue-600" />
                                                <h3 className="font-semibold text-gray-900">Timing & Schedule</h3>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="displayDuration" className="font-medium">Display Duration (sec)</Label>
                                                    <Input
                                                        id="displayDuration"
                                                        type="number"
                                                        {...register("displayDuration", { valueAsNumber: true })}
                                                        min="1"
                                                        className="mt-1.5 h-11"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="priority" className="font-medium">Priority</Label>
                                                    <Input
                                                        id="priority"
                                                        type="number"
                                                        {...register("priority", { valueAsNumber: true })}
                                                        className="mt-1.5 h-11"
                                                    />
                                                </div>
                                            </div>

                                            {/* Date Pickers */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="font-medium">Starts At</Label>
                                                    <Controller
                                                        control={control}
                                                        name="startsAt"
                                                        render={({ field }) => (
                                                            <Popover>
                                                                <PopoverTrigger asChild>
                                                                    <Button
                                                                        variant="outline"
                                                                        className={cn(
                                                                            "w-full justify-start text-left font-normal h-11",
                                                                            !field.value && "text-muted-foreground"
                                                                        )}
                                                                    >
                                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                                        {field.value ? format(field.value as Date, "PPp") : "Select date & time"}
                                                                    </Button>
                                                                </PopoverTrigger>
                                                                <PopoverContent className="w-auto p-0" align="start">
                                                                    <Calendar
                                                                        mode="single"
                                                                        selected={field.value as Date | undefined}
                                                                        onSelect={(date) => {
                                                                            if (date && field.value) {
                                                                                const existingTime = (field.value as Date);
                                                                                date.setHours(existingTime.getHours(), existingTime.getMinutes());
                                                                            }
                                                                            field.onChange(date || new Date());
                                                                        }}
                                                                        initialFocus
                                                                    />
                                                                    <div className="p-3 border-t border-border">
                                                                        <Input
                                                                            type="time"
                                                                            value={field.value ? format(field.value as Date, "HH:mm") : ""}
                                                                            onChange={(e) => {
                                                                                const [hours, minutes] = e.target.value.split(":");
                                                                                const newDate = field.value ? new Date(field.value as Date) : new Date();
                                                                                newDate.setHours(parseInt(hours), parseInt(minutes));
                                                                                field.onChange(newDate);
                                                                            }}
                                                                            className="w-full"
                                                                        />
                                                                    </div>
                                                                </PopoverContent>
                                                            </Popover>
                                                        )}
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="font-medium">Ends At (optional)</Label>
                                                    <Controller
                                                        control={control}
                                                        name="endsAt"
                                                        render={({ field }) => (
                                                            <Popover>
                                                                <PopoverTrigger asChild>
                                                                    <Button
                                                                        variant="outline"
                                                                        className={cn(
                                                                            "w-full justify-start text-left font-normal h-11",
                                                                            !field.value && "text-muted-foreground"
                                                                        )}
                                                                    >
                                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                                        {field.value ? format(field.value as Date, "PPp") : "Select end date"}
                                                                    </Button>
                                                                </PopoverTrigger>
                                                                <PopoverContent className="w-auto p-0" align="start">
                                                                    <Calendar
                                                                        mode="single"
                                                                        selected={field.value as Date | undefined}
                                                                        onSelect={field.onChange}
                                                                        initialFocus
                                                                    />
                                                                    {field.value && (
                                                                        <div className="p-3 border-t border-border flex gap-2">
                                                                            <Input
                                                                                type="time"
                                                                                value={format(field.value as Date, "HH:mm")}
                                                                                onChange={(e) => {
                                                                                    const [hours, minutes] = e.target.value.split(":");
                                                                                    const date = new Date(field.value as Date);
                                                                                    date.setHours(parseInt(hours), parseInt(minutes));
                                                                                    field.onChange(date);
                                                                                }}
                                                                                className="flex-1"
                                                                            />
                                                                            <Button
                                                                                type="button"
                                                                                variant="outline"
                                                                                size="sm"
                                                                                onClick={() => field.onChange(null)}
                                                                            >
                                                                                Clear
                                                                            </Button>
                                                                        </div>
                                                                    )}
                                                                </PopoverContent>
                                                            </Popover>
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* Categories & Status */}
                                        <div className="space-y-4">
                                            <h3 className="font-semibold text-gray-900">Targeting & Status</h3>

                                            <div className="space-y-2">
                                                <Label className="font-medium">Categories</Label>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                    {categoriesLoading ? (
                                                        <div className="col-span-full">Loading categories...</div>
                                                    ) : categories.map((cat) => (
                                                        <div key={cat.id} className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id={`cat-${cat.id}`}
                                                                checked={selectedCategories.includes(cat.id)}
                                                                onCheckedChange={(checked) => handleCategoryToggle(cat.id, !!checked)}
                                                            />
                                                            <label htmlFor={`cat-${cat.id}`} className="text-sm cursor-pointer">
                                                                {cat.name}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-3 pt-2">
                                                <Checkbox
                                                    id="isActive"
                                                    checked={formValues.isActive}
                                                    onCheckedChange={(checked) => setValue("isActive", !!checked)}
                                                />
                                                <div>
                                                    <Label htmlFor="isActive" className="cursor-pointer font-medium">
                                                        Active
                                                    </Label>
                                                    <p className="text-xs text-gray-500">
                                                        Display this advert to users
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>

                                {/* Submit Button */}
                                <div className="pt-6 border-t">
                                    <div className="flex justify-end gap-3">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => onSuccess?.()}
                                            className="px-6"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={isCreating || isUpdating}
                                            className="px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                        >
                                            {(isCreating || isUpdating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            {isEdit ? "Update Advert" : "Create Advert"}
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Live Preview Section */}
                <div className="lg:sticky lg:top-8 h-fit">
                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Eye className="w-5 h-5 text-blue-600" />
                                Live Preview
                            </CardTitle>
                            <p className="text-sm text-gray-500">
                                This is exactly how your advert will appear to users
                            </p>
                        </CardHeader>
                        <CardContent>
                            {/* The Actual Banner Preview - Matching AdvertBanner component */}
                            <div className="sticky top-0 left-0 right-0 z-50 w-full shadow-xl rounded-xl overflow-hidden border border-gray-200">
                                <div
                                    className="w-full px-4 py-3 md:py-4 relative overflow-hidden"
                                    style={{
                                        background: formValues.backgroundColor || 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                                        color: formValues.textColor || 'white',
                                    }}
                                >
                                    <div className="flex items-center justify-between">
                                        {/* Left Content */}
                                        <div className="flex-1 flex items-center gap-3 md:gap-4">
                                            {/* Badge & Timer */}
                                            <div className="flex items-center gap-2">
                                                {formValues.badge && (
                                                    <span
                                                        className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap shadow-md"
                                                        style={{
                                                            backgroundColor: formValues.badgeColor || "#FF6B6B",
                                                            color: "white",
                                                        }}
                                                    >
                                                        {formValues.badge}
                                                    </span>
                                                )}
                                                {formValues.timerText && (
                                                    <div className="hidden md:flex items-center gap-1 text-xs bg-black/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                                                        <Clock className="w-3 h-3 flex-shrink-0" />
                                                        <span className="whitespace-nowrap">{formValues.timerText}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Title & Subtitle */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
                                                    <h2 className="text-sm md:text-base font-bold truncate">
                                                        {formValues.title || "Your Advert Title"}
                                                    </h2>
                                                    <div className="hidden md:block w-px h-4 bg-white/30" />
                                                    <p className="text-xs md:text-sm opacity-90 truncate">
                                                        {formValues.subtitle || "Your subtitle goes here"}
                                                    </p>
                                                </div>
                                                {formValues.description && (
                                                    <p className="hidden md:block text-xs opacity-80 mt-1 truncate">
                                                        {formValues.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Right Actions */}
                                        <div className="flex items-center gap-2 md:gap-3">
                                            {/* Discount */}
                                            {formValues.discount && (
                                                <div className="hidden md:flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                                                    <Sparkles className="w-4 h-4" />
                                                    <span className="text-sm font-bold">{formValues.discount}</span>
                                                </div>
                                            )}

                                            {/* CTA Button */}
                                            <Button
                                                size="sm"
                                                className={`font-bold text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2 rounded-lg transition-all hover:scale-105 shadow-md ${
                                                    formValues.textColor === "white" || !formValues.textColor
                                                        ? "bg-white text-gray-900 hover:bg-gray-100"
                                                        : "bg-gray-900 text-white hover:bg-gray-800"
                                                }`}
                                            >
                                                {formValues.ctaText || "SHOP NOW"}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black/10">
                                        <div
                                            className="h-full bg-white/50 transition-all duration-10000 ease-linear"
                                            style={{
                                                width: "100%",
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Preview Details */}
                            <div className="mt-6 space-y-4">
                                <Alert>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription className="text-sm">
                                        Preview updates in real-time as you edit the form
                                    </AlertDescription>
                                </Alert>

                                {/* Preview Stats */}
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="space-y-1">
                                        <p className="font-medium text-gray-700">Status</p>
                                        <UIBadge variant={formValues.isActive ? "default" : "secondary"}>
                                            {formValues.isActive ? "Active" : "Inactive"}
                                        </UIBadge>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-medium text-gray-700">Priority</p>
                                        <p className="text-gray-600">{formValues.priority}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-medium text-gray-700">Duration</p>
                                        <p className="text-gray-600">{formValues.displayDuration}s</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-medium text-gray-700">Categories</p>
                                        <div className="flex flex-wrap gap-1">
                                            {selectedCategories.length === 0 ? (
                                                <span className="text-gray-500">None selected</span>
                                            ) : (
                                                categories
                                                    .filter(cat => selectedCategories.includes(cat.id))
                                                    .slice(0, 2)
                                                    .map(cat => (
                                                        <UIBadge key={cat.id} variant="outline" className="text-xs">
                                                            {cat.name}
                                                        </UIBadge>
                                                    ))
                                            )}
                                            {selectedCategories.length > 2 && (
                                                <span className="text-xs text-gray-500">
                                                    +{selectedCategories.length - 2} more
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Schedule Info */}
                                {formValues.startsAt && (
                                    <div className="pt-4 border-t">
                                        <h4 className="font-medium text-gray-700 mb-2">Schedule</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Starts:</span>
                                                <span className="font-medium">{format(formValues.startsAt, "PPp")}</span>
                                            </div>
                                            {formValues.endsAt && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Ends:</span>
                                                    <span className="font-medium">{format(formValues.endsAt, "PPp")}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

        </div>

    );
};

export default AdvertForm;