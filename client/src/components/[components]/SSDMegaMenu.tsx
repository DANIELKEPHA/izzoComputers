// components/navbar/SSDMegaMenu.tsx
import Link from "next/link";
import { HardDrive } from "lucide-react";

const ssdBrands = [
    "Samsung",
    "Western Digital (WD)",
    "Crucial (Micron)",
    "Kingston",
    "Seagate",
    "Intel",
    "ADATA / XPG",
    "SanDisk",
    "Toshiba / Kioxia",
];

export default function SSDMegaMenu() {
    return (
        <div className="w-screen max-w-6xl mx-auto p-8">
            <div className="grid grid-cols-4 gap-10">
                {/* Column 1: Shop All + Quick Filters */}
                <div className="space-y-6">
                    <Link
                        href="/category/ssds"
                        className="block text-lg font-bold text-blue-600 hover:text-blue-700"
                    >
                        Shop All SSDs
                    </Link>

                    <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900">Shop by Interface</h4>
                        <ul className="space-y-2 text-gray-600">
                            <li><Link href="/category/ssds?interface=nvme" className="hover:text-blue-600 transition">NVMe (M.2)</Link></li>
                            <li><Link href="/category/ssds?interface=sata" className="hover:text-blue-600 transition">SATA SSDs</Link></li>
                            <li><Link href="/category/ssds?interface=pcie" className="hover:text-blue-600 transition">PCIe Add-in Cards</Link></li>
                            <li><Link href="/category/ssds?capacity=1tb+" className="hover:text-blue-600 transition">1TB & Above</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Columns 2–4: Brands */}
                {[0, 1, 2].map((colIndex) => (
                    <div key={colIndex} className="space-y-4">
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                            <HardDrive className="w-5 h-5 text-blue-600" />
                            Popular Brands
                        </h4>
                        <ul className="grid grid-cols-2 gap-x-8 gap-y-3">
                            {ssdBrands
                                .slice(colIndex * 4, (colIndex + 1) * 4)
                                .map((brand) => (
                                    <li key={brand}>
                                        <Link
                                            href={`/category/ssds?brand=${encodeURIComponent(brand.toLowerCase().replace(/[^a-z0-9]/g, ''))}`}
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