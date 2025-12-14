import Link from "next/link";
import { Monitor } from "lucide-react";

const desktopBrands = [
    "HP",
    "Dell",
    "Lenovo",
    "Apple",
    "Acer",
    "ASUS",
    "MSI",
    "Samsung",
    "CyberPowerPC",
    "iBUYPOWER",
];

export default function DesktopMegaMenu() {
    return (
        <div className="w-screen max-w-6xl mx-auto p-8">
            <div className="grid grid-cols-4 gap-10">
                {/* Column 1: Shop All & Quick Filters */}
                <div className="space-y-6">
                    <Link
                        href="/category/desktops"
                        className="block text-lg font-bold text-blue-600 hover:text-blue-700"
                    >
                        Shop All Desktops
                    </Link>

                    <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900">Shop by Use</h4>
                        <ul className="space-y-2 text-gray-600">
                            <li>
                                <Link href="/category/desktops?type=gaming" className="hover:text-blue-600 transition">
                                    Gaming PCs
                                </Link>
                            </li>
                            <li>
                                <Link href="/category/desktops?type=workstation" className="hover:text-blue-600 transition">
                                    Workstations
                                </Link>
                            </li>
                            <li>
                                <Link href="/category/desktops?type=office" className="hover:text-blue-600 transition">
                                    Office PCs
                                </Link>
                            </li>
                            <li>
                                <Link href="/category/desktops?type=mini" className="hover:text-blue-600 transition">
                                    Mini PCs & All-in-Ones
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Columns 2–4: Brands (3 columns layout) */}
                {[...Array(3)].map((_, colIndex) => (
                    <div key={colIndex} className="space-y-4">
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Monitor className="w-5 h-5 text-blue-600" />
                            Popular Brands
                        </h4>
                        <ul className="grid grid-cols-2 gap-x-8 gap-y-3">
                            {desktopBrands
                                .slice(colIndex * 4, (colIndex + 1) * 4)
                                .map((brand) => (
                                    <li key={brand}>
                                        <Link
                                            href={`/category/desktops?brand=${brand.toLowerCase().replace(/[^a-z0-9]/g, "")}`}
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