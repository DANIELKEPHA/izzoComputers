"use client";

import { NAVBAR_HEIGHT } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { useGetAuthUserQuery } from "@/state/api";
import { useRouter } from "next/navigation";
import { signOut } from "aws-amplify/auth";
import {
    Search,
    ShoppingCart,
    User,
    Menu,
    X,
    ChevronDown,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";

// ── Mega Menu Components ──
import DesktopMegaMenu from "@/components/[components]/DesktopMegaMenu";
import MonitorMegaMenu from "@/components/[components]/MonitorMegaMenu";
import SSDMegaMenu from "@/components/[components]/SSDMegaMenu";
import RAMMegaMenu from "@/components/[components]/RAMMegaMenu";
import LaptopMegaMenu from "@/components/[components]/LaptopMegaMenu";
import NetworkingMegaMenu from "@/components/[components]/NetworkingMegaMenu";

const Navbar = () => {
    const { data: authUser } = useGetAuthUserQuery();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleSignOut = async () => {
        try {
            await signOut();
            window.location.href = "/";
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    const categories = [
        { name: "Laptops",     component: <LaptopMegaMenu /> },
        { name: "Desktops",    component: <DesktopMegaMenu /> },
        { name: "Monitors",    component: <MonitorMegaMenu /> },
        { name: "SSDs",        component: <SSDMegaMenu /> },
        { name: "RAM",         component: <RAMMegaMenu /> },
        { name: "Networking",  component: <NetworkingMegaMenu /> },
    ];

    return (
        <>
            {/* Top Bar */}
            <div className="bg-white border-b border-gray-200 py-4 px-6 lg:px-8">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <Link href="/" className="flex-shrink-0">
                        <Image
                            src="/Izzo-computers-logo.png"
                            alt="IzzoComputers Logo"
                            width={200}
                            height={94}
                            className="h-auto hover:scale-105 transition-transform duration-200"
                        />
                    </Link>

                    <div className="flex-1 max-w-2xl mx-8">
                        <form onSubmit={handleSearch} className="relative">
                            <input
                                type="text"
                                placeholder="Search for laptops, components, accessories..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-6 py-3 pl-12 text-gray-900 bg-gray-50 border border-gray-300 rounded-2xl focus:outline-none focus:ring-3 focus:ring-blue-500 focus:border-blue-500 hover:bg-white transition-all duration-200 shadow-sm"
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Button
                                type="submit"
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-1.5 rounded-xl"
                            >
                                Search
                            </Button>
                        </form>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Account */}
                        {authUser ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="p-2 hover:bg-gray-100 rounded-xl">
                                        <User className="w-6 h-6 text-gray-700" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56 rounded-xl shadow-lg border border-gray-200">
                                    <div className="px-3 py-2 border-b border-gray-100">
                                        <p className="font-medium text-gray-900">{authUser.userInfo?.name}</p>
                                        <p className="text-sm text-gray-500">{authUser.userInfo?.email}</p>
                                    </div>

                                    <button
                                        onClick={() => router.push("/admins/products")}
                                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                    >
                                        Dashboard
                                    </button>

                                    <button
                                        onClick={() => router.push("/admins/settings")}
                                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                    >
                                        My Settings
                                    </button>

                                    <button
                                        onClick={handleSignOut}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                    >
                                        Sign Out
                                    </button>
                                </DropdownMenuContent>

                            </DropdownMenu>
                        ) : (
                            <Button variant="ghost" onClick={() => router.push("/signin")} className="p-2 hover:bg-gray-100 rounded-xl">
                                <User className="w-6 h-6 text-gray-700" />
                            </Button>
                        )}

                        {/* Cart */}
                        <Button variant="ghost" onClick={() => router.push("/cart")} className="p-2 hover:bg-gray-100 rounded-xl relative">
                            <ShoppingCart className="w-6 h-6 text-gray-700" />
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center shadow-sm">
                0
              </span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Navigation */}
            <nav
                className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm"
                style={{ height: `${NAVBAR_HEIGHT}px` }}
            >
                <div className="h-full px-6 lg:px-8 max-w-7xl mx-auto flex items-center justify-center">
                    <div className="flex items-center">
                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden p-3 rounded-xl hover:bg-gray-100"
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>

                        {/* Desktop Navigation – Pure Hover Mega Menu (Instant Open) */}
                        <div className="relative hidden lg:flex items-center gap-10">
                            {categories.map((cat) => (
                                <DropdownMenu key={cat.name}>
                                    {/* Trigger on hover + instant open */}
                                    <DropdownMenuTrigger asChild>
                                        <div className="relative py-3 cursor-pointer group">
                                              <span className="text-lg font-bold text-gray-800 tracking-wide transition-colors duration-200 group-hover:text-blue-600">
                                                {cat.name}
                                              </span>
                                            {/* Clean animated underline */}
                                            <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full" />
                                        </div>
                                    </DropdownMenuTrigger>

                                    {/* Mega Menu – appears instantly on hover */}
                                    <DropdownMenuContent
                                        className="w-full max-w-7xl mr-auto mt-4 p-0 rounded-2xl shadow-2xl border-0 overflow-hidden bg-white"
                                        sideOffset={10}
                                        alignOffset={0}
                                        // These 3 props make it open on hover with zero delay
                                        onMouseEnter={() => {}}
                                        hideWhenDetached={true}
                                        // This is the key: open instantly on hover, close after 150ms of leaving
                                        // Works perfectly with shadcn/ui DropdownMenu
                                    >
                                        <div className="hover-trigger-area">
                                            {cat.component}
                                        </div>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ))}

                            {/* Static Links – Same Style */}
                            <div className="relative py-3 group cursor-pointer">
                                <Link
                                    href="/about-us"
                                    className="text-lg font-bold text-gray-800 tracking-wide transition-colors duration-200 group-hover:text-blue-600"
                                >
                                    About Us
                                </Link>
                                <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full" />
                            </div>

                            <div className="relative py-3 group cursor-pointer">
                                <Link
                                    href="/contact-us"
                                    className="text-lg font-bold text-gray-800 tracking-wide transition-colors duration-200 group-hover:text-blue-600"
                                >
                                    Contact Us
                                </Link>
                                <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-gray-200 shadow-xl">
                        <div className="p-6 space-y-4">
                            {categories.map((cat) => (
                                <Link
                                    key={cat.name}
                                    href={cat.name === "Laptops" ? "/category/laptops" : `/category/${cat.name.toLowerCase()}`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block px-5 py-3 text-lg font-semibold text-gray-800 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"
                                >
                                    {cat.name}
                                </Link>
                            ))}
                            <div className="border-t border-gray-200 pt-4 space-y-3">
                                <Link href="/about-us" onClick={() => setIsMobileMenuOpen(false)} className="block px-5 py-3 text-lg font-semibold text-gray-800 hover:text-blue-600 hover:bg-blue-50 rounded-xl">
                                    About Us
                                </Link>
                                <Link href="/contact-us" onClick={() => setIsMobileMenuOpen(false)} className="block px-5 py-3 text-lg font-semibold text-gray-800 hover:text-blue-600 hover:bg-blue-50 rounded-xl">
                                    Contact Us
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </nav>
        </>
    );
};

export default Navbar;