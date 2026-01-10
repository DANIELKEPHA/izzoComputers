"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    Shield,
    Lock,
    Eye,
    Cookie,
    UserCheck,
    Mail,
    FileText,
    ChevronRight,
    CheckCircle,
    ArrowLeft,
    Download,
    Clock,
    Users,
    Smartphone,
    Server,
    Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import FeaturesSection from "@/app/(nondashboard)/landing/FeaturesSection";
import Footer from "@/app/(nondashboard)/landing/FooterSection";

export default function PrivacyPolicyPage() {
    const [activeSection, setActiveSection] = useState("overview");

    const sections = [
        { id: "overview", title: "Overview", icon: <Shield className="w-5 h-5" /> },
        { id: "collection", title: "Data Collection", icon: <Eye className="w-5 h-5" /> },
        { id: "usage", title: "Data Usage", icon: <UserCheck className="w-5 h-5" /> },
        { id: "cookies", title: "Cookies", icon: <Cookie className="w-5 h-5" /> },
        { id: "security", title: "Security", icon: <Lock className="w-5 h-5" /> },
        { id: "rights", title: "Your Rights", icon: <FileText className="w-5 h-5" /> },
        { id: "contact", title: "Contact Us", icon: <Mail className="w-5 h-5" /> },
    ];

    const privacyPrinciples = [
        {
            icon: <Lock className="w-6 h-6" />,
            title: "Data Minimization",
            description: "We only collect essential data needed to provide our services"
        },
        {
            icon: <Eye className="w-6 h-6" />,
            title: "Transparency",
            description: "Clear communication about how we use your information"
        },
        {
            icon: <Shield className="w-6 h-6" />,
            title: "Security First",
            description: "Enterprise-grade encryption and security measures"
        },
        {
            icon: <UserCheck className="w-6 h-6" />,
            title: "User Control",
            description: "You control your data and privacy preferences"
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                <div className="absolute inset-0 bg-grid-white/10" />
                <div className="container mx-auto px-4 py-16 relative">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">
                            Privacy Policy
                        </h1>
                        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                            At Izzo Computers Limited, we&#39;re committed to protecting your privacy with the same care we build our technology.
                        </p>

                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Navigation */}
                    <div className="lg:w-1/4">
                        <Card className="sticky top-24">
                            <CardContent className="p-6">
                                <h3 className="font-semibold text-lg mb-6 flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    Contents
                                </h3>
                                <nav className="space-y-2">
                                    {sections.map((section) => (
                                        <button
                                            key={section.id}
                                            onClick={() => setActiveSection(section.id)}
                                            className={`
                        w-full flex items-center justify-between p-3 rounded-lg transition-all
                        ${activeSection === section.id
                                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                                : 'hover:bg-gray-50 text-gray-700'
                                            }
                      `}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={activeSection === section.id ? "text-blue-600" : "text-gray-400"}>
                                                    {section.icon}
                                                </div>
                                                <span className="font-medium">{section.title}</span>
                                            </div>
                                            <ChevronRight className={`w-4 h-4 transition-transform ${activeSection === section.id ? 'rotate-90' : ''}`} />
                                        </button>
                                    ))}
                                </nav>

                                <Separator className="my-6" />

                                <div className="space-y-4">
                                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-sm">Your Data is Safe</p>
                                            <p className="text-xs text-gray-600">We never sell your personal information</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                                        <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-sm">Quick Read</p>
                                            <p className="text-xs text-gray-600">5 min reading time</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <div className="lg:w-3/4">
                        <motion.div
                            key={activeSection}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Overview */}
                            {activeSection === "overview" && (
                                <div className="space-y-8">
                                    <div className="bg-white rounded-2xl p-8 shadow-sm border">
                                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                            <Shield className="w-8 h-8 text-blue-600" />
                                            Our Privacy Commitment
                                        </h2>
                                        <p className="text-gray-600 mb-6">
                                            At Izzo Computers Limited, we believe that privacy is a fundamental right. This Privacy Policy explains how we collect, use,
                                            disclose, and safeguard your information when you visit our website or purchase our computer products and accessories.
                                        </p>

                                        <div className="grid md:grid-cols-2 gap-6 my-8">
                                            {privacyPrinciples.map((principle, index) => (
                                                <div key={index} className="p-6 bg-gradient-to-br from-gray-50 to-white border rounded-xl">
                                                    <div className="inline-flex p-3 rounded-lg bg-blue-100 text-blue-600 mb-4">
                                                        {principle.icon}
                                                    </div>
                                                    <h4 className="font-bold text-gray-900 mb-2">{principle.title}</h4>
                                                    <p className="text-gray-600 text-sm">{principle.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <Card>
                                        <CardContent className="p-6">
                                            <h3 className="font-bold text-lg mb-4">What This Policy Covers</h3>
                                            <div className="space-y-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-blue-600 mt-2"></div>
                                                    <div>
                                                        <p className="font-medium">Personal Information</p>
                                                        <p className="text-sm text-gray-600">Data that identifies you as an individual</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-blue-600 mt-2"></div>
                                                    <div>
                                                        <p className="font-medium">Usage Data</p>
                                                        <p className="text-sm text-gray-600">How you interact with our website</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-blue-600 mt-2"></div>
                                                    <div>
                                                        <p className="font-medium">Technical Information</p>
                                                        <p className="text-sm text-gray-600">Device and browser information</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {/* Data Collection */}
                            {activeSection === "collection" && (
                                <div className="space-y-8">
                                    <Card>
                                        <CardContent className="p-8">
                                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                                <Eye className="w-8 h-8 text-blue-600" />
                                                Information We Collect
                                            </h2>

                                            <div className="grid gap-8">
                                                <div>
                                                    <h3 className="font-bold text-lg mb-4 text-gray-900">Information You Provide</h3>
                                                    <div className="grid md:grid-cols-2 gap-4">
                                                        {[
                                                            { title: "Contact Information", items: ["Name", "Email", "Phone", "Address"] },
                                                            { title: "Account Information", items: ["Username", "Password", "Preferences"] },
                                                            { title: "Payment Information", items: ["Billing Address", "Payment Method"] },
                                                            { title: "Communication", items: ["Support Tickets", "Feedback", "Reviews"] },
                                                        ].map((category, index) => (
                                                            <div key={index} className="p-4 border rounded-lg bg-white">
                                                                <h4 className="font-semibold mb-3 text-gray-800">{category.title}</h4>
                                                                <ul className="space-y-2">
                                                                    {category.items.map((item, idx) => (
                                                                        <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                                                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                                                                            {item}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <Separator />

                                                <div>
                                                    <h3 className="font-bold text-lg mb-4 text-gray-900">Automatically Collected Information</h3>
                                                    <div className="grid md:grid-cols-3 gap-6">
                                                        <div className="text-center p-6 border rounded-xl">
                                                            <div className="inline-flex p-3 rounded-full bg-blue-100 text-blue-600 mb-4">
                                                                <Smartphone className="w-6 h-6" />
                                                            </div>
                                                            <h4 className="font-semibold mb-2">Device Information</h4>
                                                            <p className="text-sm text-gray-600">Device type, OS, browser</p>
                                                        </div>
                                                        <div className="text-center p-6 border rounded-xl">
                                                            <div className="inline-flex p-3 rounded-full bg-purple-100 text-purple-600 mb-4">
                                                                <Globe className="w-6 h-6" />
                                                            </div>
                                                            <h4 className="font-semibold mb-2">Usage Analytics</h4>
                                                            <p className="text-sm text-gray-600">Pages visited, time spent</p>
                                                        </div>
                                                        <div className="text-center p-6 border rounded-xl">
                                                            <div className="inline-flex p-3 rounded-full bg-green-100 text-green-600 mb-4">
                                                                <Server className="w-6 h-6" />
                                                            </div>
                                                            <h4 className="font-semibold mb-2">Technical Data</h4>
                                                            <p className="text-sm text-gray-600">IP address, cookies</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {/* Data Usage */}
                            {activeSection === "usage" && (
                                <div className="space-y-8">
                                    <Card>
                                        <CardContent className="p-8">
                                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                                <UserCheck className="w-8 h-8 text-blue-600" />
                                                How We Use Your Information
                                            </h2>

                                            <div className="space-y-6">
                                                {[
                                                    {
                                                        purpose: "Order Processing & Fulfillment",
                                                        description: "To process your purchases, deliver products, and provide order updates",
                                                        examples: ["Shipping notifications", "Payment processing", "Inventory management"]
                                                    },
                                                    {
                                                        purpose: "Customer Support",
                                                        description: "To respond to your inquiries and provide technical assistance",
                                                        examples: ["Troubleshooting", "Warranty claims", "Product setup help"]
                                                    },
                                                    {
                                                        purpose: "Service Improvement",
                                                        description: "To enhance our website, products, and customer experience",
                                                        examples: ["Website optimization", "New feature development", "Bug fixes"]
                                                    },
                                                    {
                                                        purpose: "Communication",
                                                        description: "To send important updates, promotions, and newsletters (with consent)",
                                                        examples: ["Product launches", "Special offers", "Educational content"]
                                                    },
                                                    {
                                                        purpose: "Security & Fraud Prevention",
                                                        description: "To protect our services and users from unauthorized activities",
                                                        examples: ["Account security", "Transaction monitoring", "Spam prevention"]
                                                    }
                                                ].map((item, index) => (
                                                    <div key={index} className="p-6 border rounded-xl hover:border-blue-200 transition-colors">
                                                        <div className="flex items-start gap-4">
                                                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                                                <span className="font-bold text-blue-700">{index + 1}</span>
                                                            </div>
                                                            <div className="flex-grow">
                                                                <h3 className="font-bold text-gray-900 mb-2">{item.purpose}</h3>
                                                                <p className="text-gray-600 mb-3">{item.description}</p>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {item.examples.map((example, idx) => (
                                                                        <Badge key={idx} variant="outline" className="bg-blue-50 text-blue-700">
                                                                            {example}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {/* Cookies */}
                            {activeSection === "cookies" && (
                                <div className="space-y-8">
                                    <Card>
                                        <CardContent className="p-8">
                                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                                <Cookie className="w-8 h-8 text-blue-600" />
                                                Cookies & Tracking Technologies
                                            </h2>

                                            <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                                                <h3 className="font-bold text-lg mb-4">What Are Cookies?</h3>
                                                <p className="text-gray-700">
                                                    Cookies are small text files stored on your device that help us remember your preferences
                                                    and understand how you use our website. They make your browsing experience better and more personalized.
                                                </p>
                                            </div>

                                            <div className="grid md:grid-cols-3 gap-6 mb-8">
                                                <div className="p-6 border rounded-xl">
                                                    <div className="inline-flex p-3 rounded-full bg-green-100 text-green-600 mb-4">
                                                        <span className="font-bold">Essential</span>
                                                    </div>
                                                    <h4 className="font-bold text-gray-900 mb-2">Essential Cookies</h4>
                                                    <p className="text-sm text-gray-600">Required for website functionality</p>
                                                    <ul className="mt-3 space-y-1 text-sm">
                                                        <li>• Session management</li>
                                                        <li>• Shopping cart</li>
                                                        <li>• Security features</li>
                                                    </ul>
                                                </div>

                                                <div className="p-6 border rounded-xl">
                                                    <div className="inline-flex p-3 rounded-full bg-yellow-100 text-yellow-600 mb-4">
                                                        <span className="font-bold">Functional</span>
                                                    </div>
                                                    <h4 className="font-bold text-gray-900 mb-2">Functional Cookies</h4>
                                                    <p className="text-sm text-gray-600">Remember your preferences</p>
                                                    <ul className="mt-3 space-y-1 text-sm">
                                                        <li>• Language settings</li>
                                                        <li>• Region selection</li>
                                                        <li>• Login information</li>
                                                    </ul>
                                                </div>

                                                <div className="p-6 border rounded-xl">
                                                    <div className="inline-flex p-3 rounded-full bg-blue-100 text-blue-600 mb-4">
                                                        <span className="font-bold">Analytical</span>
                                                    </div>
                                                    <h4 className="font-bold text-gray-900 mb-2">Analytical Cookies</h4>
                                                    <p className="text-sm text-gray-600">Help us improve our website</p>
                                                    <ul className="mt-3 space-y-1 text-sm">
                                                        <li>• Traffic analysis</li>
                                                        <li>• User behavior</li>
                                                        <li>• Performance metrics</li>
                                                    </ul>
                                                </div>
                                            </div>

                                            <div className="p-6 border border-gray-200 rounded-xl">
                                                <h3 className="font-bold text-lg mb-4">Cookie Management</h3>
                                                <p className="text-gray-700 mb-4">
                                                    You can control cookies through your browser settings. Most browsers allow you to:
                                                </p>
                                                <div className="grid md:grid-cols-2 gap-4">
                                                    {[
                                                        "View cookies stored on your device",
                                                        "Block all or certain cookies",
                                                        "Delete existing cookies",
                                                        "Set preferences for future cookies"
                                                    ].map((item, index) => (
                                                        <div key={index} className="flex items-center gap-3">
                                                            <CheckCircle className="w-5 h-5 text-green-500" />
                                                            <span className="text-gray-700">{item}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {/* Security */}
                            {activeSection === "security" && (
                                <div className="space-y-8">
                                    <Card>
                                        <CardContent className="p-8">
                                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                                <Lock className="w-8 h-8 text-blue-600" />
                                                Data Security & Protection
                                            </h2>

                                            <div className="mb-8">
                                                <h3 className="font-bold text-lg mb-4 text-gray-900">Our Security Measures</h3>
                                                <div className="grid md:grid-cols-2 gap-6">
                                                    {[
                                                        {
                                                            title: "Encryption",
                                                            description: "All sensitive data is encrypted using AES-256 encryption",
                                                            icon: "🔐"
                                                        },
                                                        {
                                                            title: "Secure Payments",
                                                            description: "PCI-DSS compliant payment processing with tokenization",
                                                            icon: "💳"
                                                        },
                                                        {
                                                            title: "Access Controls",
                                                            description: "Role-based access and multi-factor authentication",
                                                            icon: "👥"
                                                        },
                                                        {
                                                            title: "Regular Audits",
                                                            description: "Security assessments and penetration testing",
                                                            icon: "📋"
                                                        },
                                                        {
                                                            title: "Network Security",
                                                            description: "Firewalls, DDoS protection, and intrusion detection",
                                                            icon: "🛡️"
                                                        },
                                                        {
                                                            title: "Data Backups",
                                                            description: "Regular encrypted backups and disaster recovery",
                                                            icon: "💾"
                                                        }
                                                    ].map((measure, index) => (
                                                        <div key={index} className="p-6 border rounded-xl hover:border-blue-200 transition-colors">
                                                            <div className="text-2xl mb-3">{measure.icon}</div>
                                                            <h4 className="font-bold text-gray-900 mb-2">{measure.title}</h4>
                                                            <p className="text-sm text-gray-600">{measure.description}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                                                <h3 className="font-bold text-lg mb-4 text-gray-900">Security Best Practices</h3>
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-3">
                                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                                        <span>Regular security training for all employees</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                                        <span>Vendor security assessments for third-party services</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                                        <span>Incident response plan and 24/7 monitoring</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {/* Your Rights */}
                            {activeSection === "rights" && (
                                <div className="space-y-8">
                                    <Card>
                                        <CardContent className="p-8">
                                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                                <FileText className="w-8 h-8 text-blue-600" />
                                                Your Privacy Rights
                                            </h2>

                                            <div className="mb-8 p-6 bg-blue-50 rounded-xl">
                                                <p className="text-gray-700">
                                                    You have rights regarding your personal data. We are committed to making it easy for you to exercise these rights.
                                                </p>
                                            </div>

                                            <div className="space-y-6">
                                                {[
                                                    {
                                                        right: "Right to Access",
                                                        description: "Request a copy of the personal data we hold about you",
                                                        action: "View Data Report"
                                                    },
                                                    {
                                                        right: "Right to Rectification",
                                                        description: "Correct inaccurate or incomplete personal data",
                                                        action: "Update Information"
                                                    },
                                                    {
                                                        right: "Right to Erasure",
                                                        description: "Request deletion of your personal data (subject to legal requirements)",
                                                        action: "Delete Account"
                                                    },
                                                    {
                                                        right: "Right to Restrict Processing",
                                                        description: "Request temporary restriction of data processing",
                                                        action: "Pause Processing"
                                                    },
                                                    {
                                                        right: "Right to Data Portability",
                                                        description: "Receive your data in a structured, machine-readable format",
                                                        action: "Export Data"
                                                    },
                                                    {
                                                        right: "Right to Object",
                                                        description: "Object to certain types of data processing",
                                                        action: "Manage Preferences"
                                                    }
                                                ].map((right, index) => (
                                                    <div key={index} className="p-6 border rounded-xl hover:border-blue-200 transition-colors">
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <div className="flex items-center gap-3 mb-2">
                                                                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                                                        <span className="font-bold text-blue-700">{index + 1}</span>
                                                                    </div>
                                                                    <h3 className="font-bold text-gray-900">{right.right}</h3>
                                                                </div>
                                                                <p className="text-gray-600 ml-11">{right.description}</p>
                                                            </div>
                                                            <Button variant="outline" size="sm" className="whitespace-nowrap">
                                                                {right.action}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {/* Contact Us */}
                            {activeSection === "contact" && (
                                <div className="space-y-8">
                                    <Card>
                                        <CardContent className="p-8">
                                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                                <Mail className="w-8 h-8 text-blue-600" />
                                                Contact Our Privacy Team
                                            </h2>

                                            <div className="grid md:grid-cols-2 gap-8">
                                                <div>
                                                    <h3 className="font-bold text-lg mb-6 text-gray-900">Get in Touch</h3>

                                                    <div className="space-y-6">
                                                        <div className="p-6 border rounded-xl">
                                                            <div className="flex items-center gap-3 mb-4">
                                                                <Mail className="w-6 h-6 text-blue-600" />
                                                                <h4 className="font-bold text-gray-900">Email</h4>
                                                            </div>
                                                            <p className="text-gray-600 mb-2">For privacy-related inquiries:</p>
                                                            <a href="mailto:privacy@izzocomputers.com" className="text-blue-600 hover:text-blue-800 font-medium">
                                                                privacy@izzocomputers.com
                                                            </a>
                                                            <p className="text-sm text-gray-500 mt-3">Response time: 24-48 hours</p>
                                                        </div>

                                                        <div className="p-6 border rounded-xl">
                                                            <div className="flex items-center gap-3 mb-4">
                                                                <Users className="w-6 h-6 text-blue-600" />
                                                                <h4 className="font-bold text-gray-900">Data Protection Officer</h4>
                                                            </div>
                                                            <p className="text-gray-600 mb-2">For formal data protection requests:</p>
                                                            <a href="mailto:dpo@izzocomputers.com" className="text-blue-600 hover:text-blue-800 font-medium">
                                                                dpo@izzocomputers.com
                                                            </a>
                                                            <p className="text-sm text-gray-500 mt-3">Response time: 5 business days</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <h3 className="font-bold text-lg mb-6 text-gray-900">Quick Actions</h3>

                                                    <div className="space-y-4">
                                                        <Button className="w-full justify-start h-auto py-4" variant="outline">
                                                            <div className="flex items-center gap-3 text-left">
                                                                <FileText className="w-5 h-5" />
                                                                <div>
                                                                    <p className="font-medium">Download Data</p>
                                                                    <p className="text-xs text-gray-500">Request your personal data export</p>
                                                                </div>
                                                            </div>
                                                        </Button>

                                                        <Button className="w-full justify-start h-auto py-4" variant="outline">
                                                            <div className="flex items-center gap-3 text-left">
                                                                <Eye className="w-5 h-5" />
                                                                <div>
                                                                    <p className="font-medium">Cookie Settings</p>
                                                                    <p className="text-xs text-gray-500">Manage your cookie preferences</p>
                                                                </div>
                                                            </div>
                                                        </Button>

                                                        <Button className="w-full justify-start h-auto py-4" variant="outline">
                                                            <div className="flex items-center gap-3 text-left">
                                                                <UserCheck className="w-5 h-5" />
                                                                <div>
                                                                    <p className="font-medium">Marketing Preferences</p>
                                                                    <p className="text-xs text-gray-500">Update communication settings</p>
                                                                </div>
                                                            </div>
                                                        </Button>

                                                        <Button className="w-full justify-start h-auto py-4" variant="outline">
                                                            <div className="flex items-center gap-3 text-left">
                                                                <Lock className="w-5 h-5" />
                                                                <div>
                                                                    <p className="font-medium">Security Settings</p>
                                                                    <p className="text-xs text-gray-500">Manage account security options</p>
                                                                </div>
                                                            </div>
                                                        </Button>
                                                    </div>

                                                    <div className="mt-8 p-6 bg-gray-50 rounded-xl">
                                                        <h4 className="font-bold text-gray-900 mb-3">Our Commitment</h4>
                                                        <p className="text-sm text-gray-600">
                                                            We respond to all privacy inquiries within the timeframes required by applicable laws.
                                                            You may need to verify your identity before we can process certain requests.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}
                        </motion.div>

                        {/* Footer Note */}
                        <div className="mt-12 p-6 border-t border-gray-200">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <Shield className="w-6 h-6 text-gray-400" />
                                    <p className="text-sm text-gray-600">
                                        This Privacy Policy was last updated on December 1, 2024
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Button variant="ghost" size="sm" className="gap-2">
                                        <ArrowLeft className="w-4 h-4" />
                                        Back to Top
                                    </Button>
                                    <Button variant="outline" size="sm" className="gap-2">
                                        <Download className="w-4 h-4" />
                                        Save Policy
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <FeaturesSection />
            <Footer />
        </div>
    );
}