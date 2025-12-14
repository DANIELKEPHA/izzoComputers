import Link from "next/link";
import { Monitor } from "lucide-react";

export default function LaptopMegaMenu() {
    return (
        <div className="w-screen max-w-6xl mx-auto p-12">

            {/* Main Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12">

                {/* Shop by Use */}
                <div>
                    <h3 className="font-semibold text-xl mb-4 text-gray-900">Shop by Use</h3>
                    <ul className="space-y-3 text-gray-600">
                        <li><Link href="/category/laptops?type=gaming" className="hover:text-blue-600 transition">Gaming Laptops</Link></li>
                        <li><Link href="/category/laptops?type=business" className="hover:text-blue-600 transition">Business Laptops</Link></li>
                        <li><Link href="/category/laptops?type=student" className="hover:text-blue-600 transition">Student Laptops</Link></li>
                        <li><Link href="/category/laptops?type=ultrabook" className="hover:text-blue-600 transition">Ultrabooks</Link></li>
                    </ul>
                </div>

                {/* Shop by Category */}
                <div>
                    <h3 className="font-semibold text-xl mb-4 text-gray-900">Categories</h3>
                    <ul className="space-y-3 text-gray-600">
                        <li><Link href="/category/laptops?category=thin-light" className="hover:text-blue-600 transition">Thin & Light</Link></li>
                        <li><Link href="/category/laptops?category=2-in-1" className="hover:text-blue-600 transition">2-in-1 Convertibles</Link></li>
                        <li><Link href="/category/laptops?category=workstation" className="hover:text-blue-600 transition">Workstations</Link></li>
                        <li><Link href="/category/laptops?category=budget" className="hover:text-blue-600 transition">Budget Laptops</Link></li>
                    </ul>
                </div>

                {/* Shop by Platform */}
                <div>
                    <h3 className="font-semibold text-xl mb-4 text-gray-900">Platform</h3>
                    <ul className="space-y-3 text-gray-600">
                        <li><Link href="/category/laptops?os=windows" className="hover:text-blue-600 transition">Windows Laptops</Link></li>
                        <li><Link href="/category/laptops?os=macos" className="hover:text-blue-600 transition">MacBooks</Link></li>
                        <li><Link href="/category/laptops?os=chromeos" className="hover:text-blue-600 transition">Chromebooks</Link></li>
                    </ul>
                </div>

                {/* Quick Links */}
                <div>
                    <h3 className="font-semibold text-xl mb-4 text-gray-900">Quick Links</h3>
                    <ul className="space-y-3 text-gray-600">
                        <li><Link href="/category/laptops" className="hover:text-blue-600 transition">Shop All Laptops</Link></li>
                        <li><Link href="/deals/laptops" className="hover:text-blue-600 transition">Laptop Deals</Link></li>
                        <li><Link href="/accessories" className="hover:text-blue-600 transition">Laptop Accessories</Link></li>
                    </ul>
                </div>

            </div>
        </div>
    );
}
