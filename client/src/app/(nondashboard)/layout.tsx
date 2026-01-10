"use client";

import Navbar from "@/components/Navbar";
import { NAVBAR_HEIGHT } from "@/lib/constants";
import { useGetAuthUserQuery } from "@/state/api";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import AdvertBanner from "@/components/AdvertBanner";

const Layout = ({ children }: { children: React.ReactNode }) => {
    const { data: authUser, isLoading: authLoading } = useGetAuthUserQuery();
    const router = useRouter();
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;
        if (authUser) {
            const userRole = authUser.userRole?.toLowerCase();
            if (userRole === "admin" && (pathname === "/" || pathname.startsWith("/landing"))) {
                router.push("/admins/products", { scroll: false });
                return;
            }
        }
        setIsLoading(false);
    }, [authUser, authLoading, pathname, router]);

    if (authLoading || isLoading) return <>Loading...</>;

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            {/* This wrapper pushes everything below the fixed navbar */}
            <div style={{ paddingTop: NAVBAR_HEIGHT }}>
                {/* Advert Banner - now visible directly below navbar */}
                <AdvertBanner />

                <main className="flex-1 w-full flex flex-col">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;