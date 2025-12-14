// components/DashboardNavbar.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { useGetAuthUserQuery } from "@/state/api";
import { useRouter } from "next/navigation";
import { signOut } from "aws-amplify/auth";
import { User, ShoppingCart } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {NAVBAR_HEIGHT} from "@/lib/constants";

const DashboardNavbar = () => {
    const { data: authUser } = useGetAuthUserQuery();
    const router = useRouter();

    const handleSignOut = async () => {
        try {
            await signOut();
            window.location.href = "/";
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <div
            className="bg-white border-b border-gray-200 py-4 px-6 lg:px-8 fixed top-0 left-0 w-full z-50"
            style={{ height: `${NAVBAR_HEIGHT}px` }}
        >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
                <Link href="/" className="flex-shrink-0">
                    <Image
                        src="/Izzo-computers-logo.png"
                        alt="IzzoComputers Logo"
                        width={180}
                        height={84}
                        className="hover:scale-105 transition-transform duration-200"
                    />
                </Link>

                <div className="flex items-center gap-4">
                    {/* User Dropdown */}
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
                                    onClick={handleSignOut}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                    Sign Out
                                </button>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : null}

                    {/* Optional: Keep cart or remove it in dashboard */}
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
    );
};

export default DashboardNavbar;