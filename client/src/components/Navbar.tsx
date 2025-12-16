"use client";

import { NAVBAR_HEIGHT } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { useGetAuthUserQuery } from "@/state/api";
import { useRouter } from "next/navigation";
import { signOut } from "aws-amplify/auth";
import { Search, ShoppingCart, User } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const Navbar = () => {
    const { data: authUser } = useGetAuthUserQuery();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");

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

    return (
        <>
            {/* Top Bar – Only this part is retained */}
            <div className="bg-white border-b border-gray-200 py-4 px-6 lg:px-8">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    {/* Logo */}
                    <Link href="/" className="flex-shrink-0">
                        <Image
                            src="/Izzo-computers-logo.png"
                            alt="IzzoComputers Logo"
                            width={200}
                            height={94}
                            className="h-auto hover:scale-105 transition-transform duration-200"
                        />
                    </Link>

                    {/* Search Bar */}
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

                    {/* Account & Cart */}
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
                            <Button
                                variant="ghost"
                                onClick={() => router.push("/signin")}
                                className="p-2 hover:bg-gray-100 rounded-xl"
                            >
                                <User className="w-6 h-6 text-gray-700" />
                            </Button>
                        )}

                        {/* Cart */}
                        <Button
                            variant="ghost"
                            onClick={() => router.push("/cart")}
                            className="p-2 hover:bg-gray-100 rounded-xl relative"
                        >
                            <ShoppingCart className="w-6 h-6 text-gray-700" />
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center shadow-sm">
                0
              </span>
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Navbar;