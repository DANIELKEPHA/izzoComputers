"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, Sparkles, ChevronLeft, ChevronRight, Tag, Zap, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetAdvertsQuery } from "@/state/api";

const FeaturedAdvertSection: React.FC<{ categoryId?: number }> = ({ categoryId }) => {
    const [currentAdIndex, setCurrentAdIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    const { data: adverts = [], isLoading, isError } = useGetAdvertsQuery(
        { categoryId: categoryId ? Number(categoryId) : undefined },
        {
            refetchOnMountOrArgChange: true,
        }
    );

    // Auto-rotate ads
    useEffect(() => {
        if (adverts.length <= 1) return;

        const interval = setInterval(() => {
            handleNext();
        }, 8000);

        return () => clearInterval(interval);
    }, [adverts.length]);

    // Reset if adverts change
    useEffect(() => {
        if (currentAdIndex >= adverts.length) {
            setCurrentAdIndex(0);
        }
    }, [adverts.length, currentAdIndex]);

    const handlePrevious = () => {
        if (adverts.length <= 1) return;
        setIsAnimating(true);
        setCurrentAdIndex((prev) => (prev === 0 ? adverts.length - 1 : prev - 1));
        setTimeout(() => setIsAnimating(false), 300);
    };

    const handleNext = () => {
        if (adverts.length <= 1) return;
        setIsAnimating(true);
        setCurrentAdIndex((prev) => (prev + 1) % adverts.length);
        setTimeout(() => setIsAnimating(false), 300);
    };

    if (isLoading) {
        return (
            <section className="min-h-[30vh] w-screen bg-gradient-to-r from-gray-100 to-gray-200 animate-pulse">
                <div className="container mx-auto h-full px-4 flex items-center justify-center">
                    <div className="text-gray-500">Loading featured ads...</div>
                </div>
            </section>
        );
    }

    if (isError || adverts.length === 0) {
        return null; // Return nothing if no ads
    }

    const currentAd = adverts[currentAdIndex];

    return (
        <section className="min-h-[30vh] w-screen overflow-hidden relative">
            {/* Background with gradient overlay */}
            <div className="absolute inset-0 z-0">
                {currentAd.backgroundImage ? (
                    <Image
                        src={currentAd.backgroundImage}
                        alt=""
                        fill
                        className="object-cover"
                        priority
                    />
                ) : (
                    <div
                        className="w-full h-full"
                        style={{
                            background: currentAd.backgroundColor ||
                                "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        }}
                    />
                )}
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/20" />
            </div>

            <div className="relative z-10 container mx-auto h-full px-4 md:px-6">
                <div className="h-full flex flex-col md:flex-row items-center justify-between py-8 md:py-12">
                    {/* Left Content - Text */}
                    <div className={`flex-1 text-white max-w-2xl mb-8 md:mb-0 transition-all duration-500 ${
                        isAnimating ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"
                    }`}>
                        {/* Badges */}
                        <div className="flex flex-wrap gap-3 mb-6">
                            {currentAd.badge && (
                                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                                    <Tag className="w-4 h-4" />
                                    <span className="text-sm font-semibold">{currentAd.badge}</span>
                                </div>
                            )}

                            {currentAd.timerText && (
                                <div className="inline-flex items-center gap-2 bg-yellow-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-yellow-400/30">
                                    <Clock className="w-4 h-4 text-yellow-300" />
                                    <span className="text-sm font-semibold text-yellow-100">
                                        {currentAd.timerText}
                                    </span>
                                </div>
                            )}

                            {currentAd.discount && (
                                <div className="inline-flex items-center gap-2 bg-red-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-red-400/30">
                                    <Zap className="w-4 h-4 text-red-300" />
                                    <span className="text-sm font-semibold text-red-100">
                                        {currentAd.discount} OFF
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Title */}
                        <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                            {currentAd.title}
                        </h2>

                        {/* Subtitle */}
                        <p className="text-xl md:text-2xl text-white/90 mb-6">
                            {currentAd.subtitle}
                        </p>

                        {/* Description */}
                        {currentAd.description && (
                            <p className="text-white/80 mb-8 max-w-xl">
                                {currentAd.description}
                            </p>
                        )}

                        {/* Features List */}
                        {/*{(currentAd.features || currentAd.specs) && (*/}
                        {/*    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">*/}
                        {/*        {currentAd.features?.slice(0, 4).map((feature: string, index: number) => (*/}
                        {/*            <div key={index} className="flex items-center gap-3">*/}
                        {/*                <Award className="w-4 h-4 text-green-300 flex-shrink-0" />*/}
                        {/*                <span className="text-white/90">{feature}</span>*/}
                        {/*            </div>*/}
                        {/*        ))}*/}
                        {/*    </div>*/}
                        {/*)}*/}

                        {/* CTA Button */}
                        <div className="flex flex-wrap gap-4">
                            <Button
                                asChild
                                size="lg"
                                className="bg-white text-gray-900 hover:bg-gray-100 font-bold px-8 py-6 text-lg rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
                            >
                                <Link href={currentAd.ctaLink || "#"}>
                                    {currentAd.ctaText || "Shop Now"}
                                    <Sparkles className="ml-2 w-5 h-5" />
                                </Link>
                            </Button>

                            <Button
                                asChild
                                size="lg"
                                variant="outline"
                                className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-bold px-8 py-6 text-lg rounded-xl backdrop-blur-sm"
                            >
                                <Link href={currentAd.secondaryLink || "#"}>
                                    Learn More
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Right Content - Image/Visual */}
                    {currentAd.imageUrl && (
                        <div className={`flex-1 flex justify-center md:justify-end transition-all duration-500 ${
                            isAnimating ? "opacity-0 scale-95" : "opacity-100 scale-100"
                        }`}>
                            <div className="relative w-full max-w-md">
                                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl" />
                                <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden p-6">
                                    <div className="relative aspect-square">
                                        <Image
                                            src={currentAd.imageUrl}
                                            alt={currentAd.title}
                                            fill
                                            className="object-contain"
                                            sizes="(max-width: 768px) 100vw, 50vw"
                                        />
                                    </div>

                                    {/* Floating price tag */}
                                    {currentAd.price && (
                                        <div className="absolute -top-4 -right-4 bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-3 rounded-xl shadow-2xl">
                                            <div className="text-sm opacity-90">Starting at</div>
                                            <div className="text-2xl font-bold">
                                                {currentAd.price}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation Dots */}
                {adverts.length > 1 && (
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-3">
                        <button
                            onClick={handlePrevious}
                            className="p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors"
                            aria-label="Previous advert"
                        >
                            <ChevronLeft className="w-5 h-5 text-white" />
                        </button>

                        <div className="flex items-center gap-2">
                            {adverts.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setIsAnimating(true);
                                        setCurrentAdIndex(index);
                                        setTimeout(() => setIsAnimating(false), 300);
                                    }}
                                    className={`transition-all duration-300 ${
                                        index === currentAdIndex
                                            ? "w-8 h-2 bg-white rounded-full"
                                            : "w-2 h-2 bg-white/50 rounded-full hover:bg-white/70"
                                    }`}
                                    aria-label={`Go to slide ${index + 1}`}
                                />
                            ))}
                        </div>

                        <button
                            onClick={handleNext}
                            className="p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors"
                            aria-label="Next advert"
                        >
                            <ChevronRight className="w-5 h-5 text-white" />
                        </button>
                    </div>
                )}

                {/* Progress Bar */}
                {adverts.length > 1 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                        <div
                            className="h-full bg-gradient-to-r from-blue-400 to-purple-400"
                            style={{
                                width: "100%",
                                animation: `progress ${adverts.length * 8}s linear infinite`,
                            }}
                        />
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes progress {
                    0% { width: 100%; }
                    100% { width: 0%; }
                }
                
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
                
                .floating {
                    animation: float 3s ease-in-out infinite;
                }
            `}</style>
        </section>
    );
};

export default FeaturedAdvertSection;