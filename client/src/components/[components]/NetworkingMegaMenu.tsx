// components/navbar/NetworkingMegaMenu.tsx
import Link from "next/link";
import { Wifi, Router, Globe, Shield, Cable } from "lucide-react";

const networkingBrands = [
    "TP-Link",
    "Netgear",
    "ASUS",
    "Cisco",
    "Ubiquiti",
    "Linksys",
    "D-Link",
    "MikroTik",
    "Aruba (HPE)",
    "Tenda",
    "Google Nest",
    "Eero (Amazon)",
    "Synology",
    "QNAP",
    "Mercusys",
];

export default function NetworkingMegaMenu() {
    return (
        <div className="w-screen max-w-7xl mx-auto p-8">
            <div className="grid grid-cols-5 gap-10">
                {/* Column 1: Shop All + Main Categories */}
                <div className="space-y-6">
                    <Link
                        href="/category/networking"
                        className="block text-lg font-bold text-blue-600 hover:text-blue-700"
                    >
                        Shop All Networking
                    </Link>

                    <div className="space-y-5">
                        <h4 className="font-semibold text-gray-900">Shop by Product</h4>
                        <ul className="space-y-3">
                            <li>
                                <Link
                                    href="/category/networking?type=router"
                                    className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium transition"
                                >
                                    <Router className="w-4 h-4" />
                                    Wi-Fi Routers
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/category/networking?type=mesh"
                                    className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium transition"
                                >
                                    <Wifi className="w-4 h-4" />
                                    Mesh Wi-Fi Systems
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/category/networking?type=accesspoint"
                                    className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium transition"
                                >
                                    <Globe className="w-4 h-4" />
                                    Access Points & Extenders
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/category/networking?type=switch"
                                    className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium transition"
                                >
                                    <Cable className="w-4 h-4" />
                                    Network Switches
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/category/networking?type=nas"
                                    className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium transition"
                                >
                                    <Shield className="w-4 h-4" />
                                    NAS & Network Storage
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Columns 2–5: Top Brands (4 columns × ~4 brands each) */}
                {[0, 1, 2, 3].map((colIndex) => (
                    <div key={colIndex} className="space-y-4">
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Wifi className="w-5 h-5 text-blue-600" />
                            {colIndex === 0 && "Consumer Leaders"}
                            {colIndex === 1 && "Pro & Gaming"}
                            {colIndex === 2 && "Enterprise Grade"}
                            {colIndex === 3 && "Mesh & Smart Home"}
                        </h4>
                        <ul className="grid grid-cols-1 gap-y-3">
                            {networkingBrands
                                .slice(colIndex * 4, (colIndex + 1) * 4)
                                .map((brand) => (
                                    <li key={brand}>
                                        <Link
                                            href={`/category/networking?brand=${encodeURIComponent(
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