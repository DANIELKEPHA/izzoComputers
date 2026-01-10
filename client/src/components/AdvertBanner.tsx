"use client";

import React, { useState, useEffect } from "react";
import { Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetAdvertsQuery } from "@/state/api";

const AdvertBanner: React.FC<{ categoryId?: number }> = ({ categoryId }) => {
    const [currentAdIndex, setCurrentAdIndex] = useState(0);

    const { data: adverts = [], isLoading, isError, refetch } = useGetAdvertsQuery(
        { categoryId: categoryId ? Number(categoryId) : undefined },
        {
            refetchOnMountOrArgChange: true,
        }
    );

    useEffect(() => {
        if (adverts.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentAdIndex((prev) => (prev + 1) % adverts.length);
        }, 10000);

        return () => clearInterval(interval);
    }, [adverts.length]);

    useEffect(() => {
        if (currentAdIndex >= adverts.length) {
            setCurrentAdIndex(0);
        }
    }, [adverts.length, currentAdIndex]);

    // Now early returns are safe — they come after all hooks
    if (isLoading) return null;
    if (isError || adverts.length === 0) return null;

    const currentAd = adverts[currentAdIndex];

    return (
        <div className="relative w-full z-40 shadow-xl">
            {/* Main Banner */}
            <div
                className="w-full px-4 py-3 md:py-4 relative overflow-hidden"
                style={{
                    background: currentAd.backgroundColor || "transparent",
                    color: currentAd.textColor || "black",
                }}
            >
                <div className="container mx-auto">
                    <div className="flex items-center justify-between">
                        {/* Left Content */}
                        <div className="flex-1 flex items-center gap-4 md:gap-6">
                            <div className="flex items-center gap-2">
                                {currentAd.badge && (
                                    <span
                                        className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap"
                                        style={{
                                            backgroundColor: currentAd.badgeColor || "#FF6B6B",
                                            color: "white",
                                        }}
                                    >
                    {currentAd.badge}
                  </span>
                                )}
                                {currentAd.timerText && (
                                    <div className="hidden md:flex items-center gap-1 text-xs bg-black/20 px-3 py-1.5 rounded-lg">
                                        <Clock className="w-3 h-3 flex-shrink-0" />
                                        <span className="whitespace-nowrap">{currentAd.timerText}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                                    <h2 className="text-sm md:text-base font-bold truncate">
                                        {currentAd.title}
                                    </h2>
                                    <div className="hidden md:block w-px h-4 bg-white/30" />
                                    <p className="text-xs md:text-sm opacity-90 truncate">
                                        {currentAd.subtitle}
                                    </p>
                                </div>
                                {currentAd.description && (
                                    <p className="hidden md:block text-xs opacity-80 mt-1 truncate">
                                        {currentAd.description}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 md:gap-4">
                            {currentAd.discount && (
                                <div className="hidden md:flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg">
                                    <Sparkles className="w-4 h-4" />
                                    <span className="text-sm font-bold">{currentAd.discount}</span>
                                </div>
                            )}

                            <Button
                                asChild
                                size="sm"
                                className={`font-bold text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2 rounded-lg transition-all hover:scale-105 ${
                                    currentAd.textColor === "white"
                                        ? "bg-white text-gray-900 hover:bg-gray-100"
                                        : "bg-gray-900 text-white hover:bg-gray-800"
                                }`}
                            >
                                <a href={currentAd.ctaLink} className="whitespace-nowrap">
                                    {currentAd.ctaText}
                                </a>
                            </Button>

                            {adverts.length > 1 && (
                                <div className="hidden md:flex items-center gap-1.5">
                                    {adverts.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentAdIndex(index)}
                                            className={`w-1.5 h-1.5 rounded-full transition-all ${
                                                index === currentAdIndex
                                                    ? "bg-white scale-125"
                                                    : "bg-white/50 hover:bg-white/70"
                                            }`}
                                            aria-label={`Go to advert ${index + 1}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black/10">
                    <div
                        className="h-full bg-white/50"
                        style={{
                            width: "100%",
                            animation: "progress 10s linear forwards",
                        }}
                        key={currentAdIndex}
                    />
                </div>
            </div>

            <style jsx>{`
                @keyframes progress {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            `}</style>
        </div>
    );
};

export default AdvertBanner;