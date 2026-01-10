"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { Edit, Trash2, Clock, Calendar, Hash, Eye, EyeOff, Plus, Tag, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import {
    useGetAdvertsQuery,
    useDeleteAdvertMutation,
} from "@/state/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import AdvertForm from "@/app/(dashboard)/admins/promotion/new/page";

const AdvertsPage: React.FC = () => {
    const {
        data: adverts = [],
        isLoading,
        isError,
        refetch,
    } = useGetAdvertsQuery({});
    const [deleteAdvert, { isLoading: isDeleting }] = useDeleteAdvertMutation();

    const [editingAdvert, setEditingAdvert] = useState<any | null>(null);
    const [previewIndex, setPreviewIndex] = useState(0);

    const handleDelete = async (id: number) => {
        try {
            await deleteAdvert(id).unwrap();
            toast.success("Advert deleted successfully.");
            refetch();
        } catch (err) {
            toast.error("Failed to delete advert.");
        }
    };

    const handleEditSuccess = () => {
        setEditingAdvert(null);
        refetch();
        toast.success("Advert updated successfully.");
    };

    const nextPreview = () => {
        if (adverts.length > 0) {
            setPreviewIndex((prev) => (prev + 1) % adverts.length);
        }
    };

    const prevPreview = () => {
        if (adverts.length > 0) {
            setPreviewIndex((prev) => (prev - 1 + adverts.length) % adverts.length);
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <Skeleton className="h-10 w-64 mb-2" />
                    <Skeleton className="h-6 w-96" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <Card key={i} className="overflow-hidden">
                            <Skeleton className="h-48 w-full" />
                            <CardHeader>
                                <Skeleton className="h-6 w-3/4" />
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3" />
                                <div className="flex gap-2">
                                    <Skeleton className="h-8 w-1/2" />
                                    <Skeleton className="h-8 w-1/2" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <div className="max-w-md mx-auto">
                    <h1 className="text-3xl font-bold mb-4">Manage Adverts</h1>
                    <p className="text-red-500 mb-6">Failed to load adverts. Please try again later.</p>
                    <Button onClick={() => refetch()} className="px-8">
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    const currentPreviewAd = adverts[previewIndex];

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Manage Adverts</h1>
                        <p className="text-gray-600 mt-2">
                            {adverts.length} advert{adverts.length !== 1 ? 's' : ''} •
                            {adverts.filter((a: any) => a.isActive).length} active
                        </p>
                    </div>
                    <Button
                        onClick={() => setEditingAdvert({})}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Create New Advert
                    </Button>
                </div>

                {editingAdvert && (
                    <div className="mb-12 pb-8 border-b border-gray-200 bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Sparkles className="w-5 h-5 text-blue-600" />
                            </div>
                            <h2 className="text-2xl font-semibold text-gray-900">
                                {editingAdvert.id ? "Edit Advert" : "Create New Advert"}
                            </h2>
                        </div>
                        <AdvertForm
                            initialData={editingAdvert.id ? editingAdvert : undefined}
                            onSuccess={handleEditSuccess}
                        />
                    </div>
                )}
            </div>

            {/* Live Preview Section */}
            {adverts.length > 0 && (
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Live Preview</h2>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                Previewing: {previewIndex + 1} of {adverts.length}
                            </span>
                        </div>
                    </div>

                    {/* Banner Preview */}
                    <div className="relative overflow-hidden rounded-2xl shadow-2xl mb-6 border border-gray-200">
                        {/* Navigation Buttons */}
                        {adverts.length > 1 && (
                            <>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm hover:bg-white border-gray-300"
                                    onClick={prevPreview}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm hover:bg-white border-gray-300"
                                    onClick={nextPreview}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </>
                        )}

                        {/* The Actual Banner Display */}
                        <div
                            className="w-full px-6 py-5 md:py-6 relative overflow-hidden"
                            style={{
                                background: currentPreviewAd?.backgroundColor || '#1a1a2e',
                                color: currentPreviewAd?.textColor || 'white',
                                minHeight: '140px',
                            }}
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                {/* Left Content */}
                                <div className="flex-1 flex flex-col md:flex-row md:items-center gap-4">
                                    {/* Badge & Timer */}
                                    <div className="flex items-center gap-3">
                                        {currentPreviewAd?.badge && (
                                            <span
                                                className="px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider whitespace-nowrap shadow-lg"
                                                style={{
                                                    backgroundColor: currentPreviewAd.badgeColor || "#FF6B6B",
                                                    color: "white",
                                                }}
                                            >
                                                {currentPreviewAd.badge}
                                            </span>
                                        )}
                                        {currentPreviewAd?.timerText && (
                                            <div className="hidden md:flex items-center gap-2 text-sm bg-black/20 px-4 py-2 rounded-lg">
                                                <Clock className="w-4 h-4 flex-shrink-0" />
                                                <span className="whitespace-nowrap">{currentPreviewAd.timerText}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Title & Subtitle */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col gap-1">
                                            <h2 className="text-lg md:text-xl font-bold truncate">
                                                {currentPreviewAd?.title || "Advert Title"}
                                            </h2>
                                            <p className="text-sm md:text-base opacity-90 truncate">
                                                {currentPreviewAd?.subtitle || "Advert Subtitle"}
                                            </p>
                                            {currentPreviewAd?.description && (
                                                <p className="hidden md:block text-sm opacity-80 mt-1 truncate">
                                                    {currentPreviewAd.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Actions */}
                                <div className="flex items-center gap-4">
                                    {/* Discount */}
                                    {currentPreviewAd?.discount && (
                                        <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg shadow-md">
                                            <Sparkles className="w-5 h-5" />
                                            <span className="text-base font-bold">{currentPreviewAd.discount}</span>
                                        </div>
                                    )}

                                    {/* CTA Button */}
                                    <Button
                                        size="default"
                                        className={`font-bold text-sm md:text-base px-6 py-2 rounded-lg transition-all hover:scale-105 shadow-lg ${
                                            (currentPreviewAd?.textColor === "white" || !currentPreviewAd?.textColor)
                                                ? "bg-white text-gray-900 hover:bg-gray-100"
                                                : "bg-gray-900 text-white hover:bg-gray-800"
                                        }`}
                                    >
                                        {currentPreviewAd?.ctaText || "SHOP NOW"}
                                    </Button>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10">
                                <div
                                    className="h-full bg-white/50"
                                    style={{
                                        width: '100%',
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Preview Navigation Dots */}
                    {adverts.length > 1 && (
                        <div className="flex justify-center items-center gap-2">
                            {adverts.map((advert: any, index: number) => (
                                <button
                                    key={advert.id}
                                    onClick={() => setPreviewIndex(index)}
                                    className={`w-3 h-3 rounded-full transition-all ${
                                        index === previewIndex
                                            ? "bg-blue-600 scale-110"
                                            : "bg-gray-300 hover:bg-gray-400"
                                    }`}
                                    aria-label={`Preview advert ${index + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Adverts List */}
            {adverts.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl bg-gradient-to-b from-gray-50 to-white">
                    <div className="max-w-md mx-auto">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                            <Tag className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No adverts yet</h3>
                        <p className="text-gray-600 mb-6">Create your first advert to promote your content</p>
                        <Button
                            onClick={() => setEditingAdvert({})}
                            className="px-8"
                            size="lg"
                        >
                            Create Your First Advert
                        </Button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">All Adverts</h2>
                        <div className="text-sm text-gray-600">
                            Click on an advert to preview it above
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {adverts.map((advert: any, index: number) => (
                            <Card
                                key={advert.id}
                                className={`overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 cursor-pointer ${
                                    index === previewIndex
                                        ? 'border-blue-500 ring-2 ring-blue-200'
                                        : 'border-gray-200'
                                }`}
                                onClick={() => setPreviewIndex(index)}
                            >
                                {/* Banner Preview Thumbnail */}
                                <div
                                    className="relative h-32 overflow-hidden"
                                    style={{
                                        background: advert.backgroundColor,
                                        color: advert.textColor,
                                    }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                    <div className="relative z-10 p-4 h-full flex flex-col justify-center">
                                        {advert.badge && (
                                            <span
                                                className="absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                                                style={{
                                                    backgroundColor: advert.badgeColor || "#FF6B6B",
                                                    color: "white",
                                                }}
                                            >
                                                {advert.badge}
                                            </span>
                                        )}
                                        <h3 className="text-lg font-bold line-clamp-1">
                                            {advert.title}
                                        </h3>
                                        <p className="text-sm opacity-90 line-clamp-1">
                                            {advert.subtitle}
                                        </p>
                                    </div>
                                </div>

                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <CardTitle className="text-base font-bold text-gray-900 line-clamp-1">
                                            {advert.title}
                                        </CardTitle>
                                        <Badge
                                            variant={advert.isActive ? "default" : "secondary"}
                                            className="ml-2"
                                        >
                                            {advert.isActive ? (
                                                <Eye className="w-3 h-3 mr-1" />
                                            ) : (
                                                <EyeOff className="w-3 h-3 mr-1" />
                                            )}
                                            {advert.isActive ? "Active" : "Inactive"}
                                        </Badge>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    <Separator />

                                    {/* Quick Info */}
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Calendar className="w-3 h-3 text-gray-400" />
                                            <span className="truncate">
                                                {advert.startsAt ? format(new Date(advert.startsAt), "PP") : "Now"}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <Hash className="w-3 h-3 text-gray-400" />
                                                <span>Priority: {advert.priority}</span>
                                            </div>
                                            <div className="h-3 w-px bg-gray-200" />
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-3 h-3 text-gray-400" />
                                                <span>Duration: {advert.displayDuration}s</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Categories */}
                                    {advert.categories && advert.categories.length > 0 && (
                                        <div className="pt-2">
                                            <div className="flex flex-wrap gap-1.5">
                                                {advert.categories.map((cat: any) => (
                                                    <Badge
                                                        key={cat.category.id}
                                                        variant="secondary"
                                                        className="text-xs px-2 py-0.5 bg-gray-100"
                                                    >
                                                        {cat.category.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 pt-4">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingAdvert(advert);
                                            }}
                                            className="flex-1"
                                        >
                                            <Edit className="w-4 h-4 mr-2" />
                                            Edit
                                        </Button>

                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    disabled={isDeleting}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="flex-1"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Delete
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle className="text-gray-900">
                                                        Delete Advert?
                                                    </AlertDialogTitle>
                                                    <AlertDialogDescription className="text-gray-600">
                                                        This action cannot be undone. This advert will be permanently deleted.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel className="border-gray-300">
                                                        Cancel
                                                    </AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(advert.id);
                                                        }}
                                                        className="bg-red-600 hover:bg-red-700 text-white"
                                                    >
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default AdvertsPage;