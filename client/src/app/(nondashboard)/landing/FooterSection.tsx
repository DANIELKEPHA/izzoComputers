"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
    Facebook,
    Instagram,
    Mail,
    Phone,
    MapPin,
    CreditCard,
    Lock,
    Globe,
    ArrowRight,
} from "lucide-react";

import {
    useGetCategoriesQuery,
    useSubscribeToNewsletterMutation,
} from "@/state/api";

const Footer = () => {
    const { data: categories = [], isLoading: categoriesLoading } = useGetCategoriesQuery();
    const [subscribe, { isLoading: subscribing }] = useSubscribeToNewsletterMutation();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccess(null);
        setError(null);

        if (!email.trim()) return;

        try {
            const result = await subscribe({
                email: email.trim(),
                name: name.trim() || undefined,
            }).unwrap();

            setSuccess(result.message || "Thank you for subscribing!");
            setName("");
            setEmail("");
        } catch (err: any) {
            setError(err?.data?.message || "Failed to subscribe. Please try again later.");
        }
    };

    return (
        <footer className="bg-gray-950 text-gray-300">
            {/* Main Footer Content */}
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                    {/* Shop by Category - With Images & Clean URLs */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-4">Shop by Category</h3>
                        <ul className="space-y-3">
                            {categoriesLoading ? (
                                <li className="text-gray-500 text-sm">Loading categories...</li>
                            ) : categories.length === 0 ? (
                                <li className="text-gray-500 text-sm">No categories available</li>
                            ) : (
                                categories.map((category: any) => (
                                    <li key={category.id}>
                                        <Link
                                            href={`/shop/categories/${category.slug}`}
                                            className="flex items-center gap-3 hover:text-white transition-colors group"
                                        >
                                            {/* Category Image or Fallback */}
                                            {category.coverImageUrl ? (
                                                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-gray-700 group-hover:ring-white transition-all duration-300">
                                                    <img
                                                        src={category.coverImageUrl}
                                                        alt={category.name}
                                                        className="w-full h-full object-cover"
                                                        loading="lazy"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0 ring-2 ring-gray-700 group-hover:ring-white transition-all duration-300">
                          <span className="text-xs font-bold text-gray-300">
                            {category.name.charAt(0).toUpperCase()}
                          </span>
                                                </div>
                                            )}

                                            {/* Category Name */}
                                            <span className="text-sm">{category.name}</span>
                                        </Link>
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-4">Customer Service</h3>
                        <ul className="space-y-2">
                            <li><Link href="/" className="hover:text-white transition-colors">Help Center</Link></li>
                            <li><Link href="/" className="hover:text-white transition-colors">Returns & Refunds</Link></li>
                            <li><Link href="/" className="hover:text-white transition-colors">Warranty Services</Link></li>
                            <li><Link href="/" className="hover:text-white transition-colors">Installation Services</Link></li>
                            <li><Link href="/" className="hover:text-white transition-colors">Corporate Sales</Link></li>
                            <li><Link href="/" className="hover:text-white transition-colors">Contact Us</Link></li>
                        </ul>
                    </div>

                    {/* Business Solutions */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-4">Business Solutions</h3>
                        <ul className="space-y-2">
                            <li><Link href="/" className="hover:text-white transition-colors">Enterprise Solutions</Link></li>
                            <li><Link href="/" className="hover:text-white transition-colors">Education Discounts</Link></li>
                            <li><Link href="/" className="hover:text-white transition-colors">Bulk Purchasing</Link></li>
                            <li><Link href="/" className="hover:text-white transition-colors">Custom PC Building</Link></li>
                            <li><Link href="/" className="hover:text-white transition-colors">IT Maintenance</Link></li>
                        </ul>
                    </div>

                    {/* About Us */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-4">About Izzo Computers</h3>
                        <ul className="space-y-2">
                            <li><Link href="/" className="hover:text-white transition-colors">About Us</Link></li>
                            <li><Link href="/" className="hover:text-white transition-colors">Sustainability</Link></li>
                            <li><Link href="/" className="hover:text-white transition-colors">Customer Reviews</Link></li>
                        </ul>
                    </div>

                    {/* Stay Connected - Newsletter & Contact */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-4">Stay Connected</h3>
                        <div className="space-y-8">
                            {/* Newsletter */}
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold text-white text-lg">Subscribe to Our Newsletter</h4>
                                    <p className="text-sm text-gray-400 mt-1">
                                        Get exclusive deals, new product launches, and tech tips delivered straight to your inbox.
                                    </p>
                                </div>

                                <form onSubmit={handleSubscribe} className="space-y-4">
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Your name (optional)"
                                        disabled={subscribing}
                                        className="w-full px-5 py-3.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-70"
                                    />

                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Your email address"
                                        required
                                        disabled={subscribing}
                                        className="w-full px-5 py-3.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-70"
                                    />

                                    <button
                                        type="submit"
                                        disabled={subscribing || !email.trim()}
                                        className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-70 disabled:cursor-not-allowed rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
                                    >
                                        {subscribing ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Subscribing...
                                            </>
                                        ) : (
                                            <>
                                                Subscribe Now
                                                <ArrowRight className="w-5 h-5" />
                                            </>
                                        )}
                                    </button>

                                    {error && (
                                        <p className="text-sm text-red-400 bg-red-900/30 px-4 py-3 rounded-lg border border-red-800">
                                            {error}
                                        </p>
                                    )}
                                    {success && (
                                        <p className="text-sm text-green-400 bg-green-900/30 px-4 py-3 rounded-lg border border-green-800">
                                            {success}
                                        </p>
                                    )}
                                </form>
                            </div>

                            {/* Contact Info */}
                            <div className="space-y-4 pt-6 border-t border-gray-800">
                                <h4 className="font-semibold text-white">Contact Info</h4>
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center gap-3">
                                        <Phone className="w-4 h-4 text-gray-500" />
                                        <span>+254 723 371332</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Mail className="w-4 h-4 text-gray-500" />
                                        <span>support@izzocomputers.com</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <MapPin className="w-4 h-4 text-gray-500" />
                                        <span>Kwa Shibu Road, Mombasa, Kenya</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Social, Payment & App Links */}
            <div className="mt-12 pt-8 border-t border-gray-800">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                        {/* Social Media */}
                        <div>
                            <h4 className="text-white font-semibold mb-3">Follow Us</h4>
                            <div className="flex gap-4">
                                <a href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-blue-600 transition-colors">
                                    <Facebook className="w-5 h-5" />
                                </a>
                                <a href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-pink-600 transition-colors">
                                    <Instagram className="w-5 h-5" />
                                </a>
                            </div>
                        </div>

                        {/* Payment Methods */}
                        <div>
                            <h4 className="text-white font-semibold mb-3">We Accept</h4>
                            <div className="flex gap-4 items-center">
                                <div className="p-3 bg-gray-800 rounded-lg">
                                    <CreditCard className="w-8 h-8 text-blue-400" />
                                </div>
                                <div className="px-4 py-3 bg-gray-800 rounded-lg">
                                    <span className="text-lg font-bold text-green-500">M-Pesa</span>
                                </div>
                                <div className="p-3 bg-gray-800 rounded-lg">
                                    <Lock className="w-8 h-8 text-yellow-400" />
                                </div>
                                <div className="px-4 py-3 bg-gray-800 rounded-lg text-sm font-bold">
                                    Bank Transfer
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="bg-gray-900 py-6 mt-12">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
                        <div className="text-gray-400">
                            © {new Date().getFullYear()} Izzo Computers. All rights reserved.
                        </div>

                        <div className="flex flex-wrap gap-6">
                            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                        </div>

                        <div className="flex items-center gap-2 text-gray-400">
                            <Globe className="w-4 h-4" />
                            <span>Kenya | English</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;