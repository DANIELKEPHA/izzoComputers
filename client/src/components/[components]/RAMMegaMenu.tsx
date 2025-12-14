// components/navbar/RAMMegaMenu.tsx
import Link from "next/link";
import { MemoryStick } from "lucide-react";

const ramBrands = [
    "Corsair",
    "G.Skill",
    "Kingston",
    "Crucial",
    "TeamGroup",
    "Patriot",
    "ADATA / XPG",
    "PNY",
    "Lexar",
    "Samsung",
    "HyperX",           // Very popular (now under HP)
    "GeIL",
    "Apacer",
    "Silicon Power",
    "Mushkin",
    "Thermaltake",
    "KLEVV",
    "V-Color",
    "Sabrent",
    "Neo Forza",
];

export default function RAMMegaMenu() {
    return (
        <div className="w-screen max-w-7xl mx-auto p-8">
            <div className="grid grid-cols-5 gap-10">
                {/* Column 1: Shop All + Type Selector */}
                <div className="space-y-6">
                    <Link
                        href="/category/ram"
                        className="block text-lg font-bold text-blue-600 hover:text-blue-700"
                    >
                        Shop All RAM
                    </Link>

                    <div className="space-y-5">
                        <h4 className="font-semibold text-gray-900">Shop by Type</h4>
                        <ul className="space-y-3">
                            <li>
                                <Link
                                    href="/category/ram?type=desktop"
                                    className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium transition"
                                >
                                    <MemoryStick className="w-4 h-4" />
                                    Desktop RAM (DIMM)
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/category/ram?type=laptop"
                                    className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium transition"
                                >
                                    <MemoryStick className="w-4 h-4" />
                                    Laptop RAM (SO-DIMM)
                                </Link>
                            </li>
                        </ul>

                        <div className="pt-4 space-y-2 text-sm">
                            <h4 className="font-semibold text-gray-900">Quick Filters</h4>
                            <ul className="space-y-2 text-gray-600">
                                <li><Link href="/category/ram?generation=ddr5" className="hover:text-blue-600">DDR5</Link></li>
                                <li><Link href="/category/ram?generation=ddr4" className="hover:text-blue-600">DDR4</Link></li>
                                <li><Link href="/category/ram?capacity=32gb+" className="hover:text-blue-600">32GB & Above</Link></li>
                                <li><Link href="/category/ram?rgb=true" className="hover:text-blue-600">RGB RAM</Link></li>
                                <li><Link href="/category/ram?low-profile=true" className="hover:text-blue-600">Low Profile</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Columns 2–5: Brands (4 columns for 20 brands) */}
                {[0, 1, 2, 3].map((colIndex) => (
                    <div key={colIndex} className="space-y-4">
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                            <MemoryStick className="w-5 h-5 text-blue-600" />
                            {colIndex === 0 && "Top"} {colIndex === 1 && "Performance"} {colIndex === 2 && "Value"} {colIndex === 3 && "Specialty"} Brands
                        </h4>
                        <ul className="grid grid-cols-1 gap-y-3">
                            {ramBrands
                                .slice(colIndex * 5, (colIndex + 1) * 5)
                                .map((brand) => (
                                    <li key={brand}>
                                        <Link
                                            href={`/category/ram?brand=${encodeURIComponent(
                                                brand.toLowerCase().replace(/[^a-z0-9]/g, "")
                                            )}`}
                                            className="block text-gray-700 hover:text-blue-600 font-medium transition py-1"
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