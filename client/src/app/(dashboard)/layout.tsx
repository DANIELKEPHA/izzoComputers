// DashboardLayout.tsx (updated)
"use client";

import Navbar from "@/components/Navbar";
import DashboardNavbar from "@/components/DashboardNavbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import Sidebar from "@/components/AppSidebar";
import { NAVBAR_HEIGHT } from "@/lib/constants";
import React, { useEffect, useState } from "react";
import { useGetAuthUserQuery } from "@/state/api";
import { usePathname, useRouter } from "next/navigation";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    const { data: authUser, isLoading: authLoading } = useGetAuthUserQuery();
    const router = useRouter();
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(true);

    // Detect if we're in dashboard routes
    const isDashboardRoute = pathname.startsWith("/admins") || pathname.startsWith("/users");

    useEffect(() => {
        if (authUser) {
            const userRole = authUser.userRole?.toLowerCase();
            if (
                (userRole === "admin" && pathname.startsWith("/users")) ||
                (userRole === "user" && pathname.startsWith("/admins"))
            ) {
                router.push(
                    userRole === "admin" ? "/admins/products" : "/users/favorites",
                    { scroll: false }
                );
            } else {
                setIsLoading(false);
            }
        }
    }, [authUser, router, pathname]);

    if (authLoading || isLoading) return <>Loading...</>;
    if (!authUser?.userRole) return null;

    return (
        <SidebarProvider>
            <div className="min-h-screen w-full bg-primary-100">
                {/* Conditionally render navbar */}
                {isDashboardRoute ? <DashboardNavbar /> : <Navbar />}

                <div style={{ marginTop: `${NAVBAR_HEIGHT}px` }}>
                    <main className="flex">
                        {/* Only show sidebar in dashboard */}
                        {isDashboardRoute && <Sidebar userType={authUser.userRole.toLowerCase()} />}

                        <div className={`flex-grow transition-all duration-300 ${isDashboardRoute ? "" : "mx-auto max-w-7xl"}`}>
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
};

export default DashboardLayout;