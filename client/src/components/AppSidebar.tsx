// components/AppSidebar.tsx (or wherever your sidebar is)
"use client";

import React from "react";
import { usePathname } from "next/navigation";
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "./ui/sidebar";
import {
    Package,
    FileText,
    Heart,
    Home,
    Menu,
    Settings,
    X,
    PackagePlus,
    Megaphone,
} from "lucide-react";
import { NAVBAR_HEIGHT } from "@/lib/constants";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { useGetOrdersQuery } from "@/state/api";

interface AppSidebarProps {
    userType: "admin" | "user";
}

const AppSidebar = ({ userType }: AppSidebarProps) => {
    const pathname = usePathname();
    const { toggleSidebar, open } = useSidebar();

    // Fetch pending orders count for admin
    const { data: ordersData } = useGetOrdersQuery(
        { status: "PENDING", pageSize: 1 }, // Only need count, small request
        { skip: userType !== "admin" }
    );

    const pendingOrdersCount = ordersData?.pagination?.total || 0;

    const navLinks = userType === "admin"
        ? [
            { icon: Home, label: "Dashboard", href: "/admins/dashboard" },
            { icon: Megaphone, label: "Promotion", href: "/admins/promotion" },
            { icon: PackagePlus, label: "New Products", href: "/admins/products/new" },
            { icon: Package, label: "Products", href: "/admins/products" },
            { icon: FileText, label: "Cart", href: "/admins/cart" },
            {
                icon: FileText,
                label: "Orders",
                href: "/admins/orders",
                badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
            },
            { icon: Settings, label: "Settings", href: "/admins/settings" },
        ]
        : [
            { icon: Home, label: "Dashboard", href: "/users/dashboard" },
            { icon: Heart, label: "Favorites", href: "/users/favorites" },
            { icon: FileText, label: "Cart", href: "/users/cart" },
            { icon: Settings, label: "Settings", href: "/users/settings" },
        ];

    return (
        <Sidebar
            collapsible="icon"
            className="fixed left-0 bg-white shadow-lg"
            style={{
                top: `${NAVBAR_HEIGHT}px`,
                height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
            }}
        >
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <div
                            className={cn(
                                "flex min-h-[56px] w-full items-center pt-3 mb-3",
                                open ? "px-6" : "justify-center"
                            )}
                        >
                            {open ? (
                                <button
                                    className="hover:bg-gray-100 p-2 rounded-md ml-auto"
                                    onClick={() => toggleSidebar()}
                                >
                                    <X className="h-6 w-6 text-gray-600" />
                                </button>
                            ) : (
                                <button
                                    className="hover:bg-gray-100 p-2 rounded-md"
                                    onClick={() => toggleSidebar()}
                                >
                                    <Menu className="h-6 w-6 text-gray-600" />
                                </button>
                            )}
                        </div>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <SidebarMenu>
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href;

                        return (
                            <SidebarMenuItem key={link.href}>
                                <SidebarMenuButton
                                    asChild
                                    className={cn(
                                        "flex items-center px-7 py-7",
                                        isActive ? "bg-gray-100" : "text-gray-600 hover:bg-gray-100",
                                        open ? "text-blue-600" : "ml-[5px]"
                                    )}
                                >
                                    <Link href={link.href} className="w-full flex items-center gap-3" scroll={false}>
                                        <link.icon
                                            className={`h-5 w-5 ${
                                                isActive ? "text-blue-600" : "text-gray-600"
                                            }`}
                                        />
                                        <span
                                            className={`font-medium ${
                                                isActive ? "text-blue-600" : "text-gray-600"
                                            }`}
                                        >
                      {link.label}
                    </span>
                                        {/* Pending Orders Badge */}
                                        {link.badge !== undefined && (
                                            <Badge
                                                className="ml-auto bg-red-500 text-white hover:bg-red-600"
                                                variant="default"
                                            >
                                                {link.badge}
                                            </Badge>
                                        )}
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarContent>
        </Sidebar>
    );
};

export default AppSidebar;