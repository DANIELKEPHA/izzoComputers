// app/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    ArrowRight,
    Shield,
    Truck,
    Headphones,
    Cpu,
    Laptop,
    Monitor,
    Smartphone,
    HeadphonesIcon,
    Gamepad2,
    Star,
    ChevronLeft,
    ChevronRight,
    CheckCircle2,
    TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function HeroSection() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);

        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const heroSlides = [
        {
            title: "Next-Gen Gaming Rigs",
            subtitle: "Experience ultimate performance with our RTX 40 series builds",
            image: "/api/placeholder/1200/600",
            cta: "Shop Gaming PCs",
            bgGradient: "from-purple-600 via-blue-600 to-cyan-500"
        },
        {
            title: "Professional Workstations",
            subtitle: "Powerful machines for creators and developers",
            image: "/api/placeholder/1200/600",
            cta: "Explore Workstations",
            bgGradient: "from-gray-900 via-blue-900 to-slate-800"
        },
        {
            title: "Premium Components",
            subtitle: "Build your dream PC with top-tier components",
            image: "/api/placeholder/1200/600",
            cta: "Browse Components",
            bgGradient: "from-orange-500 via-red-500 to-pink-500"
        }
    ];

    const features = [
        {
            icon: Shield,
            title: "2-Year Warranty",
            description: "Comprehensive protection on all products"
        },
        {
            icon: Truck,
            title: "Free Shipping",
            description: "Free delivery on orders over $999"
        },
        {
            icon: Headphones,
            title: "24/7 Support",
            description: "Expert technical support anytime"
        },
        {
            icon: CheckCircle2,
            title: "Quality Assured",
            description: "Rigorous testing before shipping"
        }
    ];

    const categories = [
        {
            icon: Laptop,
            name: "Gaming Laptops",
            image: "/api/placeholder/400/300",
            count: "120+ Products",
            gradient: "from-purple-500 to-pink-500"
        },
        {
            icon: Cpu,
            name: "PC Components",
            image: "/api/placeholder/400/300",
            count: "450+ Products",
            gradient: "from-blue-500 to-cyan-500"
        },
        {
            icon: Monitor,
            name: "Monitors",
            image: "/api/placeholder/400/300",
            count: "80+ Products",
            gradient: "from-green-500 to-emerald-500"
        },
        {
            icon: HeadphonesIcon,
            name: "Accessories",
            image: "/api/placeholder/400/300",
            count: "200+ Products",
            gradient: "from-orange-500 to-red-500"
        },
        {
            icon: Gamepad2,
            name: "Gaming Gear",
            image: "/api/placeholder/400/300",
            count: "150+ Products",
            gradient: "from-indigo-500 to-purple-500"
        },
        {
            icon: Smartphone,
            name: "Tablets & Mobile",
            image: "/api/placeholder/400/300",
            count: "90+ Products",
            gradient: "from-gray-500 to-slate-600"
        }
    ];

    const featuredProducts = [
        {
            id: 1,
            name: "NVIDIA RTX 4090",
            category: "Graphics Card",
            price: "$1,599",
            originalPrice: "$1,799",
            image: "/api/placeholder/300/300",
            rating: 4.9,
            reviews: 124,
            badge: "BEST SELLER"
        },
        {
            id: 2,
            name: "Intel Core i9-14900K",
            category: "Processor",
            price: "$589",
            originalPrice: "$649",
            image: "/api/placeholder/300/300",
            rating: 4.8,
            reviews: 89,
            badge: "NEW"
        },
        {
            id: 3,
            name: "32\" 4K Gaming Monitor",
            category: "Monitor",
            price: "$799",
            originalPrice: "$899",
            image: "/api/placeholder/300/300",
            rating: 4.7,
            reviews: 67,
            badge: "SALE"
        },
        {
            id: 4,
            name: "Mechanical Keyboard Pro",
            category: "Accessories",
            price: "$129",
            originalPrice: "$149",
            image: "/api/placeholder/300/300",
            rating: 4.9,
            reviews: 203,
            badge: "POPULAR"
        }
    ];

    const stats = [
        { number: "50K+", label: "Happy Customers" },
        { number: "15+", label: "Years Experience" },
        { number: "100+", label: "Brand Partners" },
        { number: "24/7", label: "Support Available" }
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative h-screen overflow-hidden">
                {/* Background Slides */}
                {heroSlides.map((slide, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-1000 ${
                            index === currentSlide ? "opacity-100" : "opacity-0"
                        }`}
                    >
                        <div className={`absolute inset-0 bg-gradient-to-r ${slide.bgGradient} opacity-90`} />
                        <Image
                            src={slide.image}
                            alt={slide.title}
                            fill
                            className="object-cover mix-blend-overlay"
                            priority
                        />
                    </div>
                ))}

                {/* Content */}
                <div className="relative z-10 flex items-center justify-center h-full px-4 sm:px-6 lg:px-8">
                    <div className={`text-center text-white transition-all duration-1000 transform ${
                        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                    }`}>
                        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                            {heroSlides[currentSlide].title}
                        </h1>
                        <p className="text-xl sm:text-2xl lg:text-3xl mb-8 max-w-3xl mx-auto leading-relaxed">
                            {heroSlides[currentSlide].subtitle}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Button
                                size="lg"
                                className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-6 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-2xl"
                                asChild
                            >
                                <Link href="/products">
                                    {heroSlides[currentSlide].cta}
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Link>
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="border-white text-white hover:bg-white hover:text-gray-900 px-8 py-6 text-lg font-semibold rounded-xl transition-all duration-300"
                                asChild
                            >
                                <Link href="/custom-build">
                                    Custom Build
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Slide Indicators */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-3">
                    {heroSlides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                index === currentSlide ? 'bg-white scale-125' : 'bg-white/50'
                            }`}
                        />
                    ))}
                </div>

                {/* Navigation Arrows */}
                <button
                    onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-sm"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                    onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-sm"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Why Choose Izzo Computers?
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            We're committed to providing the best computing solutions with unmatched service and support
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="text-center group hover:transform hover:scale-105 transition-all duration-300"
                            >
                                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl border border-gray-100">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mb-6 group-hover:from-blue-600 group-hover:to-blue-700 transition-all duration-300">
                                        <feature.icon className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Shop by Category
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Discover our wide range of computing products and accessories
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categories.map((category, index) => (
                            <Link
                                key={index}
                                href={`/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                                className="group block"
                            >
                                <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:scale-105">
                                    <CardContent className="p-0 relative">
                                        <div className="relative h-64 overflow-hidden">
                                            <Image
                                                src={category.image}
                                                alt={category.name}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                            <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-80 group-hover:opacity-70 transition-opacity duration-300`} />
                                            <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <category.icon className="w-8 h-8" />
                                                    <h3 className="text-2xl font-bold">{category.name}</h3>
                                                </div>
                                                <p className="text-white/90 font-medium">{category.count}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <TrendingUp className="w-8 h-8 text-blue-600" />
                            <h2 className="text-4xl font-bold text-gray-900">
                                Featured Products
                            </h2>
                        </div>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Check out our most popular and trending products
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {featuredProducts.map((product) => (
                            <Card key={product.id} className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300">
                                <CardContent className="p-0">
                                    <div className="relative">
                                        <div className="relative h-64 overflow-hidden">
                                            <Image
                                                src={product.image}
                                                alt={product.name}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        </div>

                                        {product.badge && (
                                            <div className="absolute top-4 left-4">
                        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          {product.badge}
                        </span>
                                            </div>
                                        )}

                                        <div className="absolute top-4 right-4">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="bg-white/90 hover:bg-white rounded-full w-10 h-10 p-0 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                                            >
                                                ❤️
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <p className="text-sm text-gray-500 mb-1">{product.category}</p>
                                        <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                            {product.name}
                                        </h3>

                                        <div className="flex items-center gap-1 mb-3">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-4 h-4 ${
                                                        i < Math.floor(product.rating)
                                                            ? "text-yellow-400 fill-current"
                                                            : "text-gray-300"
                                                    }`}
                                                />
                                            ))}
                                            <span className="text-sm text-gray-500 ml-1">
                        ({product.reviews})
                      </span>
                                        </div>

                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="text-2xl font-bold text-gray-900">{product.price}</span>
                                            {product.originalPrice && (
                                                <span className="text-lg text-gray-500 line-through">{product.originalPrice}</span>
                                            )}
                                        </div>

                                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105">
                                            Add to Cart
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <Button
                            size="lg"
                            variant="outline"
                            className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-3 text-lg font-semibold rounded-xl transition-all duration-300"
                            asChild
                        >
                            <Link href="/products">
                                View All Products
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 bg-gray-900 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                        {stats.map((stat, index) => (
                            <div key={index} className="group">
                                <div className="text-4xl lg:text-5xl font-bold text-blue-400 mb-3 group-hover:scale-110 transition-transform duration-300">
                                    {stat.number}
                                </div>
                                <div className="text-xl text-gray-300 font-medium">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-700">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl font-bold text-white mb-6">
                        Ready to Build Your Dream PC?
                    </h2>
                    <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                        Let our experts help you create the perfect computer for your needs and budget
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            size="lg"
                            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105"
                            asChild
                        >
                            <Link href="/custom-build">
                                Start Custom Build
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Link>
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300"
                            asChild
                        >
                            <Link href="/contact">
                                Contact Expert
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}