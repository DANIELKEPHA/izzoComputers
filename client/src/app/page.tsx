import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Landing from "./(nondashboard)/landing/page";

// Create a Navbar wrapper that suspends
function NavbarWithSuspense() {
    return (
        <Suspense fallback={<NavbarSkeleton />}>
            <Navbar />
        </Suspense>
    );
}

// Skeleton loader for Navbar
function NavbarSkeleton() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm h-20">
            <div className="h-full py-4 px-6 lg:px-8">
                <div className="flex items-center justify-between max-w-7xl mx-auto h-full">
                    <div className="w-48 h-12 bg-gray-200 rounded animate-pulse"></div>
                    <div className="flex-1 max-w-2xl mx-8 h-12 bg-gray-200 rounded animate-pulse"></div>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                        <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                        <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default function Home() {
    return (
        <div className="h-full w-full">
            <NavbarWithSuspense />
            <main className="h-full flex w-full flex-col pt-20"> {/* Add padding-top for fixed navbar */}
                <Suspense fallback={<div>Loading...</div>}>
                    <Landing />
                </Suspense>
            </main>
        </div>
    );
}