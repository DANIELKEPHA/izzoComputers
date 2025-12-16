"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X, Tag, Clock, TrendingUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Advert {
    id: number;
    title: string;
    subtitle: string;
    description?: string;
    ctaText: string;
    ctaLink: string;
    backgroundColor: string;
    textColor: string;
    badge?: string;
    badgeColor?: string;
    timer?: {
        endsAt: string;
        text: string;
    };
    isPromo?: boolean;
    discount?: string;
}

const AdvertBanner: React.FC<{ categoryId?: number }> = ({ categoryId }) => {
    const [currentAdIndex, setCurrentAdIndex] = useState(0);
    const [isPinned, setIsPinned] = useState(true); // Always pinned/sticky

    // Mock adverts data - in real app, this would come from an API
    const adverts: Advert[] = [
        {
            id: 1,
            title: "🎉 BLACK FRIDAY EXTRAVAGANZA",
            subtitle: "UP TO 70% OFF ON ALL ELECTRONICS",
            description: "Limited time offer! Don't miss out on our biggest sale of the year.",
            ctaText: "SHOP DEALS NOW",
            ctaLink: "/black-friday",
            backgroundColor: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
            textColor: "white",
            badge: "LIMITED TIME",
            badgeColor: "#FF6B6B",
            timer: {
                endsAt: "2024-12-01T23:59:59",
                text: "Ends in 2 days"
            },
            isPromo: true,
            discount: "70% OFF"
        },
        {
            id: 2,
            title: "🚚 FREE EXPRESS SHIPPING",
            subtitle: "ON ALL ORDERS ABOVE KSH 30,000",
            description: "Get your items delivered in 24 hours. No minimum purchase for Prime members.",
            ctaText: "EXPLORE PRIME",
            ctaLink: "/prime",
            backgroundColor: "linear-gradient(135deg, #0575E6 0%, #021B79 100%)",
            textColor: "white",
            badge: "EXPRESS",
            badgeColor: "#FFA41C",
            timer: {
                endsAt: "2024-12-31T23:59:59",
                text: "All month"
            }
        },
        {
            id: 3,
            title: "🔥 GAMING WEEK SPECIAL",
            subtitle: "HIGH-END GAMING LAPTOPS FROM KSH 120,000",
            description: "RTX 40 Series, 240Hz displays, and RGB lighting. Perfect for esports.",
            ctaText: "VIEW GAMING COLLECTION",
            ctaLink: "/gaming",
            backgroundColor: "linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)",
            textColor: "white",
            badge: "GAMING",
            badgeColor: "#00D4AA"
        },
        {
            id: 4,
            title: "🎓 BACK TO SCHOOL DEALS",
            subtitle: "SPECIAL DISCOUNTS FOR STUDENTS & EDUCATORS",
            description: "Save extra 15% with student ID. Free software bundle included.",
            ctaText: "SHOP STUDENT DEALS",
            ctaLink: "/student",
            backgroundColor: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
            textColor: "white",
            badge: "EDUCATION",
            badgeColor: "#4299E1",
            discount: "15% OFF"
        },
        {
            id: 5,
            title: "💎 PREMIUM WARRANTY UPGRADE",
            subtitle: "GET 3 YEARS WARRANTY FOR JUST KSH 5,000",
            description: "Extend your protection. Includes accidental damage coverage.",
            ctaText: "ADD WARRANTY",
            ctaLink: "/warranty",
            backgroundColor: "linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)",
            textColor: "white",
            badge: "PREMIUM",
            badgeColor: "#F6E05E"
        }
    ];

    // Filter ads based on category if provided
    const filteredAds = categoryId
        ? adverts.filter(ad => {
            // In real app, you'd have category mapping for ads
            // For now, show all ads but you can customize this logic
            return true;
        })
        : adverts;

    // Auto-rotate ads every 10 seconds
    useEffect(() => {
        if (filteredAds.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentAdIndex((prev) => (prev + 1) % filteredAds.length);
        }, 1000000);

        return () => clearInterval(interval);
    }, [filteredAds.length]);

    const nextAd = () => {
        setCurrentAdIndex((prev) => (prev + 1) % filteredAds.length);
    };

    const prevAd = () => {
        setCurrentAdIndex((prev) => (prev - 1 + filteredAds.length) % filteredAds.length);
    };

    const currentAd = filteredAds[currentAdIndex];

    if (filteredAds.length === 0 || !isPinned) return null;

    return (
        <div className="sticky top-0 left-0 right-0 z-50 w-full shadow-xl animate-in fade-in slide-in-from-top-5 duration-500">
            {/* Main Banner */}
            <div
                className="w-full px-4 py-3 md:py-4 relative"
                style={{
                    background: currentAd.backgroundColor,
                    color: currentAd.textColor
                }}
            >
                <div className="container mx-auto">
                    <div className="flex items-center justify-between">
                        {/* Left Content */}
                        <div className="flex-1 flex items-center gap-4 md:gap-6">
                            {/* Badge & Timer */}
                            <div className="flex items-center gap-2">
                                {currentAd.badge && (
                                    <span
                                        className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap"
                                        style={{ backgroundColor: currentAd.badgeColor, color: 'white' }}
                                    >
                                        {currentAd.badge}
                                    </span>
                                )}

                                {currentAd.timer && (
                                    <div className="hidden md:flex items-center gap-1 text-xs bg-black/20 px-3 py-1.5 rounded-lg">
                                        <Clock className="w-3 h-3 flex-shrink-0" />
                                        <span className="whitespace-nowrap">{currentAd.timer.text}</span>
                                    </div>
                                )}
                            </div>

                            {/* Title & Subtitle */}
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                                    <h2 className="text-sm md:text-base font-bold truncate">
                                        {currentAd.title}
                                    </h2>
                                    <div className="hidden md:block w-px h-4 bg-white/30"></div>
                                    <p className="text-xs md:text-sm opacity-90 truncate">
                                        {currentAd.subtitle}
                                    </p>
                                </div>

                                {/* Description - only show on desktop */}
                                {currentAd.description && (
                                    <p className="hidden md:block text-xs opacity-80 mt-1 truncate">
                                        {currentAd.description}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-3 md:gap-4">
                            {/* Discount Display */}
                            {currentAd.discount && (
                                <div className="hidden md:flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg">
                                    <Sparkles className="w-4 h-4" />
                                    <span className="text-sm font-bold">{currentAd.discount}</span>
                                </div>
                            )}

                            {/* CTA Button */}
                            <Button
                                asChild
                                size="sm"
                                className={`font-bold text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2 rounded-lg transition-all hover:scale-105 ${
                                    currentAd.textColor === 'white'
                                        ? 'bg-white text-gray-900 hover:bg-gray-100'
                                        : 'bg-gray-900 text-white hover:bg-gray-800'
                                }`}
                            >
                                <a href={currentAd.ctaLink} className="whitespace-nowrap">
                                    {currentAd.ctaText}
                                </a>
                            </Button>

                            {/* Navigation Dots */}
                            {filteredAds.length > 1 && (
                                <div className="hidden md:flex items-center gap-1.5">
                                    {filteredAds.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentAdIndex(index)}
                                            className={`w-1.5 h-1.5 rounded-full transition-all ${
                                                index === currentAdIndex
                                                    ? "bg-white scale-125"
                                                    : "bg-white/50 hover:bg-white/70"
                                            }`}
                                            aria-label={`Go to ad ${index + 1}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black/10">
                    <div
                        className="h-full bg-white/50 transition-all duration-100000 ease-linear"
                        style={{
                            width: '100%',
                            animation: `progress ${100000}ms linear infinite`,
                            animationPlayState: 'running'
                        }}
                    />
                </div>
            </div>

            {/* CSS for progress animation */}
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