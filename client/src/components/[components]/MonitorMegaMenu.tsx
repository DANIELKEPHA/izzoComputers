// components/navbar/MonitorMegaMenu.tsx
import Link from "next/link";
import { Monitor } from "lucide-react";

const monitorBrands = [
    "Dell",
    "LG",
    "Samsung",
    "ASUS",
    "Acer",
    "BenQ",
    "HP",
    "MSI",
    "Gigabyte / AORUS",
];

export default function MonitorMegaMenu() {
    return (
        <div className="w-screen max-w-6xl mx-auto p-8">
            <div className="grid grid-cols-4 gap-10">
                {/* Column 1: Shop All + Filters */}
                <div className="space-y-6">
                    <Link
                        href="/category/monitors"
                        className="block text-lg font-bold text-blue-600 hover:text-blue-700"
                    >
                        Shop All Monitors
                    </Link>

                    <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900">Shop by Type</h4>
                        <ul className="space-y-2 text-gray-600">
                            <li><Link href="/category/monitors?type=gaming" className="hover:text-blue-600 transition">Gaming Monitors</Link></li>
                            <li><Link href="/category/monitors?type=ultrawide" className="hover:text-blue-600 transition">Ultrawide</Link></li>
                            <li><Link href="/category/monitors?type=4k" className="hover:text-blue-600 transition">4K Monitors</Link></li>
                            <li><Link href="/category/monitors?type=professional" className="hover:text-blue-600 transition">Professional / Creative</Link></li>
                            <li><Link href="/category/monitors?type=office" className="hover:text-blue-600 transition">Office & Productivity</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Columns 2–4: Brands */}
                {[0, 1, 2].map((colIndex) => (
                    <div key={colIndex} className="space-y-4">
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Monitor className="w-5 h-5 text-blue-600" />
                            Top Brands
                        </h4>
                        <ul className="grid grid-cols-2 gap-x-8 gap-y-3">
                            {monitorBrands
                                .slice(colIndex * 4, (colIndex + 1) * 4)
                                .map((brand) => (
                                    <li key={brand}>
                                        <Link
                                            href={`/category/monitors?brand=${encodeURIComponent(brand.toLowerCase().replace(/[^a-z0-9]/g, ''))}`}
                                            className="text-gray-700 hover:text-blue-600 font-medium transition"
                                        >
                                            {brand}
                                        </Link>
                                    </li>
                                ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
}