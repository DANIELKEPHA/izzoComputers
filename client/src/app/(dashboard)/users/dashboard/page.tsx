"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    Home,
    Search,
    ShoppingBag,
    ArrowLeft,
    Compass,
    RefreshCw,
    Sparkles,
    MapPin,
    Package,
    Users,
    Shield,
    Clock,
    Zap,
    ChevronRight,
    Star,
    Menu,
    X,
    HelpCircle,
    FileText,
    Mail,
    Phone,
    Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetCategoriesQuery, useGetFeaturedProductsQuery } from "@/state/api";

const Custom404 = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [particles, setParticles] = useState<Array<{x: number, y: number, size: number, speed: number}>>([]);
    const { data: categories = [] } = useGetCategoriesQuery();
    const { data: featuredProducts = [] } = useGetFeaturedProductsQuery();

    // Create floating particles
    useEffect(() => {
        const newParticles = Array.from({ length: 30 }, () => ({
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 3 + 1,
            speed: Math.random() * 0.5 + 0.2
        }));
        setParticles(newParticles);
    }, []);

    // Popular search suggestions
    const popularSearches = [
        "Laptops", "Smartphones", "Headphones", "Gaming", "Watches",
        "Cameras", "Home Appliances", "Accessories", "Deals", "New Arrivals"
    ];

    // Quick links
    const quickLinks = [
        { icon: Home, label: "Home", href: "/" },
        { icon: ShoppingBag, label: "Shop", href: "/shop" },
        { icon: Package, label: "Products", href: "/shop/products" },
        { icon: Users, label: "About Us", href: "/about" },
        { icon: Shield, label: "Support", href: "/support" },
        { icon: FileText, label: "Blog", href: "/blog" },
    ];

    // Features
    const features = [
        { icon: Shield, title: "Secure Shopping", desc: "100% safe & encrypted" },
        { icon: Clock, title: "24/7 Support", desc: "Always here to help" },
        { icon: Zap, title: "Fast Delivery", desc: "Free shipping over $50" },
        { icon: RefreshCw, title: "Easy Returns", desc: "30-day return policy" },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 text-white overflow-hidden relative">
            {/* Animated Background Particles */}
            <div className="absolute inset-0 overflow-hidden">
                {particles.map((particle, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20"
                        style={{
                            left: `${particle.x}%`,
                            top: `${particle.y}%`,
                            width: `${particle.size}px`,
                            height: `${particle.size}px`,
                            animation: `float ${3 / particle.speed}s ease-in-out infinite`,
                            animationDelay: `${i * 0.1}s`,
                        }}
                    />
                ))}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/30" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),transparent_50%)]" />
            </div>



            {/* Main 404 Content */}
            <main className="relative z-40 container mx-auto px-4 py-12 md:py-24">
                <div className="max-w-6xl mx-auto">
                    {/* Animated 404 Number */}
                    <div className="relative mb-8">
                        <div className="text-[200px] md:text-[300px] font-bold text-center">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
                404
              </span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-3xl" />
                        <Sparkles className="absolute top-1/4 left-1/4 w-8 h-8 text-yellow-300 animate-pulse" />
                        <Sparkles className="absolute bottom-1/4 right-1/4 w-6 h-6 text-blue-300 animate-pulse" style={{ animationDelay: '0.5s' }} />
                    </div>

                    {/* Main Message */}
                    <div className="text-center mb-12">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">
                            Oops! Page{" "}
                            <span className="relative inline-block">
                <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                  Not Found
                </span>
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-red-400 to-orange-400 rounded-full" />
              </span>
                        </h2>
                        <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
                            The page you&#39;re looking for seems to have wandered off into the digital void.
                            But don&#39;t worry, there&#39;s plenty more to explore!
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap justify-center gap-4 mb-16">
                        <Link href="/">
                            <Button
                                size="lg"
                                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-0 px-8 py-6 text-lg rounded-xl group"
                            >
                                <Home className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                                Back to Homepage
                            </Button>
                        </Link>

                        <Link href="/shop">
                            <Button
                                size="lg"
                                variant="outline"
                                className="border-2 border-white/30 bg-white/5 hover:bg-white/10 px-8 py-6 text-lg rounded-xl backdrop-blur-sm group"
                            >
                                <ShoppingBag className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                                Start Shopping
                            </Button>
                        </Link>
                    </div>


                    {/* Categories & Products Preview */}
                    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 mb-16">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-bold mb-2">Explore Our Collection</h3>
                                <p className="text-gray-400">Discover amazing products in these categories</p>
                            </div>
                            <Link
                                href="/shop/categories"
                                className="flex items-center gap-2 text-blue-300 hover:text-blue-200 transition-colors"
                            >
                                View All <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>

                        {/* Categories Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
                            {categories.slice(0, 6).map((category) => (
                                <Link
                                    key={category.id}
                                    href={`/shop/category/${category.slug}`}
                                    className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-white/5 to-white/0 p-4 text-center hover:from-blue-500/20 hover:to-purple-500/20 transition-all"
                                >
                                    {category.coverImageUrl ? (
                                        <div className="relative w-12 h-12 mx-auto mb-3">
                                            <Image
                                                src={category.coverImageUrl}
                                                alt={category.name}
                                                fill
                                                className="object-cover rounded-lg"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-blue-400/30 to-purple-400/30 rounded-lg flex items-center justify-center">
                                            <Package className="w-6 h-6 text-blue-300" />
                                        </div>
                                    )}
                                    <span className="font-medium">{category.name}</span>
                                    <div className="absolute inset-0 border border-white/10 rounded-xl group-hover:border-blue-400/30 transition-colors" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Help Section */}
                    <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-white/20 rounded-3xl p-8 md:p-12 mb-16">
                        <div className="text-center mb-8">
                            <HelpCircle className="w-16 h-16 mx-auto mb-6 text-blue-300" />
                            <h3 className="text-3xl font-bold mb-4">Need Help?</h3>
                            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                                Our support team is here to assist you 24/7
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center p-6 bg-white/5 rounded-2xl border border-white/10">
                                <Mail className="w-8 h-8 mx-auto mb-4 text-blue-300" />
                                <h4 className="font-semibold mb-2">Email Support</h4>
                                <p className="text-gray-400 mb-4">We&#39;ll respond within 2 hours</p>
                                <a
                                    href="mailto:support@izzocomputers.com"
                                    className="text-blue-300 hover:text-blue-200 transition-colors"
                                >
                                    support@izzocomputers.com
                                </a>
                            </div>

                            <div className="text-center p-6 bg-white/5 rounded-2xl border border-white/10">
                                <Phone className="w-8 h-8 mx-auto mb-4 text-green-300" />
                                <h4 className="font-semibold mb-2">Call Us</h4>
                                <p className="text-gray-400 mb-4">Mon-Sun, 24/7</p>
                                <a
                                    href="tel:+254 723 371332"
                                    className="text-green-300 hover:text-green-200 transition-colors"
                                >
                                    +254 723 371332
                                </a>
                            </div>

                            <div className="text-center p-6 bg-white/5 rounded-2xl border border-white/10">
                                <Globe className="w-8 h-8 mx-auto mb-4 text-purple-300" />
                                <h4 className="font-semibold mb-2">Live Chat</h4>
                                <p className="text-gray-400 mb-4">Instant support</p>
                                <Button
                                    variant="outline"
                                    className="border-purple-400/30 text-purple-300 hover:bg-purple-500/20"
                                >
                                    Start Chat
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-40 border-t border-white/10 pt-12 pb-8">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                        <div>
                            <Link href="/" className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">Izzo Computers</h2>
                                    <p className="text-sm text-gray-400">Where Innovation Meets Excellence</p>
                                </div>
                            </Link>
                            <p className="text-gray-400 max-w-md">
                                Premium electronics store with cutting-edge technology and exceptional customer service.
                            </p>
                        </div>

                        <div className="flex items-center gap-6">
                            <MapPin className="w-5 h-5 text-gray-400" />
                            <div>
                                <p className="font-medium">Visit Our Store</p>
                                <p className="text-sm text-gray-400">Kwa Shibu Road, Mombasa, Kenya</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-white/10 text-center">
                        <p className="text-gray-400">
                            © {new Date().getFullYear()} Izzo Computers. All rights reserved. |
                            <Link href="/privacy" className="hover:text-white transition-colors mx-2">Privacy Policy</Link> •
                            <Link href="/privacy" className="hover:text-white transition-colors mx-2">Terms of Service</Link>
                        </p>
                    </div>
                </div>
            </footer>

            {/* Custom CSS for animations */}
            <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        
        .animate-in {
          animation: slideInFromTop 0.3s ease-out;
        }
        
        @keyframes slideInFromTop {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
        </div>
    );
};

export default Custom404;