"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
    useGetCartQuery,
    useCreateOrderMutation,
} from "@/state/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, CreditCard, Truck, Phone, Loader2 } from "lucide-react";
import OrderSummary from "./order-summary";

export default function CheckoutForm() {
    const router = useRouter();

    // All hooks at the top — NO early returns before this
    const { data: cartData, isLoading: cartLoading } = useGetCartQuery();
    const [createOrder, { isLoading: isPlacingOrder }] = useCreateOrderMutation();

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        notes: "",
        paymentMethod: "mpesa",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const items = cartData?.cart?.items ?? [];

    // Early returns AFTER all hooks
    if (cartLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    if (items.length === 0) {
        router.push("/cart");
        return null;
    }

    // Calculations
    const subtotal = items.reduce((sum, item) => {
        const price = Number(item.product.price.toString());
        const discount = item.product.discountPercent || 0;
        const finalPrice = discount > 0 ? price * (1 - discount / 100) : price;
        return sum + finalPrice * item.quantity;
    }, 0);

    const tax = subtotal * 0.16;
    const shipping = subtotal >= 20000 ? 0 : 500;
    const total = subtotal + tax + shipping;

    const formatPrice = (price: number) =>
        new Intl.NumberFormat("en-KE", {
            style: "currency",
            currency: "KES",
            minimumFractionDigits: 0,
        }).format(price);

    const handleInputChange = (field: keyof typeof formData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const validateStep1 = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) newErrors.name = "Full name is required";
        if (!formData.email.trim()) newErrors.email = "Email is required";
        else if (!/^\S+@\S+\.\S+$/.test(formData.email))
            newErrors.email = "Invalid email format";

        if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
        else if (!/^0[17]\d{8}$/.test(formData.phone.replace(/[\s-]/g, "")))
            newErrors.phone = "Enter a valid Kenyan mobile number (e.g., 0712345678)";

        if (!formData.address.trim()) newErrors.address = "Delivery address is required";
        if (!formData.city.trim()) newErrors.city = "City is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (step === 1 && validateStep1()) {
            setStep(2);
        } else if (step === 2) {
            setStep(3);
        }
    };

    const handlePlaceOrder = async () => {
        if (!validateStep1()) {
            setStep(1);
            return;
        }

        try {
            const result = await createOrder({
                paymentMethod: formData.paymentMethod,
                address: formData.address.trim(),
                phone: formData.phone.trim(),
                name: formData.name.trim(),
                city: formData.city.trim(),
                notes: formData.notes.trim() || undefined,
            }).unwrap();

            router.push(`/order-confirmation/${result.order.id}`);
        } catch (err) {
            console.error("Order placement failed:", err);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                <Button
                    variant="ghost"
                    onClick={() => router.push("/cart")}
                    className="mb-6"
                >
                    <ArrowLeft className="mr-2 w-4 h-4" />
                    Back to Cart
                </Button>

                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8">
                    Checkout
                </h1>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Checkout Steps */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Step Progress */}
                        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 bg-white p-4 rounded-lg shadow-sm">
                            {[1, 2, 3].map((num) => (
                                <React.Fragment key={num}>
                                    <div className={`flex items-center ${step >= num ? "text-blue-600" : "text-gray-400"}`}>
                                        <div className={`w-10 h-10 rounded-full ${step >= num ? "bg-blue-600 text-white" : "bg-gray-300"} flex items-center justify-center font-bold text-lg`}>
                                            {num}
                                        </div>
                                        <span className="ml-3 font-medium hidden sm:inline">
                      {num === 1 ? "Shipping Info" : num === 2 ? "Payment" : "Review"}
                    </span>
                                    </div>
                                    {num < 3 && <div className="w-full sm:w-auto sm:flex-1 h-1 bg-gray-300 mx-4 my-2 sm:my-0" />}
                                </React.Fragment>
                            ))}
                        </div>

                        {/* Step 1: Shipping Info */}
                        {step === 1 && (
                            <Card>
                                <CardContent className="p-6 space-y-6">
                                    <div className="flex items-center gap-3 text-xl font-semibold">
                                        <Truck className="w-7 h-7 text-blue-600" />
                                        Delivery Information
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-5">
                                        <div>
                                            <Label htmlFor="name">Full Name</Label>
                                            <Input
                                                id="name"
                                                placeholder="Daniel Kepha"
                                                value={formData.name}
                                                onChange={(e) => handleInputChange("name", e.target.value)}
                                                className={errors.name ? "border-red-500" : ""}
                                            />
                                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                                        </div>

                                        <div>
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <Input
                                                id="phone"
                                                placeholder="0712345678"
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => handleInputChange("phone", e.target.value)}
                                                className={errors.phone ? "border-red-500" : ""}
                                            />
                                            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                                        </div>

                                        <div className="md:col-span-2">
                                            <Label htmlFor="email">Email Address</Label>
                                            <Input
                                                id="email"
                                                placeholder="daniel@example.com"
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => handleInputChange("email", e.target.value)}
                                                className={errors.email ? "border-red-500" : ""}
                                            />
                                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                                        </div>

                                        <div className="md:col-span-2">
                                            <Label htmlFor="address">Delivery Address</Label>
                                            <Input
                                                id="address"
                                                placeholder="123 Nyali Road, House No. 45"
                                                value={formData.address}
                                                onChange={(e) => handleInputChange("address", e.target.value)}
                                                className={errors.address ? "border-red-500" : ""}
                                            />
                                            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                                        </div>

                                        <div>
                                            <Label htmlFor="city">City / Town</Label>
                                            <Input
                                                id="city"
                                                placeholder="Mombasa"
                                                value={formData.city}
                                                onChange={(e) => handleInputChange("city", e.target.value)}
                                                className={errors.city ? "border-red-500" : ""}
                                            />
                                            {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                                        </div>

                                        <div>
                                            <Label htmlFor="notes">Additional Notes (Optional)</Label>
                                            <Textarea
                                                id="notes"
                                                placeholder="Call on arrival..."
                                                value={formData.notes}
                                                onChange={(e) => handleInputChange("notes", e.target.value)}
                                                rows={3}
                                            />
                                        </div>
                                    </div>

                                    <Button className="w-full text-lg py-6" size="lg" onClick={handleNext}>
                                        Continue to Payment
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {/* Step 2: Payment */}
                        {step === 2 && (
                            <Card>
                                <CardContent className="p-6 space-y-6">
                                    <div className="flex items-center gap-3 text-xl font-semibold">
                                        <CreditCard className="w-7 h-7 text-blue-600" />
                                        Payment Method
                                    </div>

                                    <RadioGroup
                                        value={formData.paymentMethod}
                                        onValueChange={(value) => handleInputChange("paymentMethod", value)}
                                    >
                                        <div className="flex items-center space-x-4 p-5 border rounded-lg hover:bg-gray-50">
                                            <RadioGroupItem value="mpesa" id="mpesa" />
                                            <Label htmlFor="mpesa" className="flex-1 cursor-pointer">
                                                <div className="font-semibold text-lg">M-Pesa</div>
                                                <div className="text-sm text-gray-600">Pay instantly with mobile money</div>
                                            </Label>
                                            <Phone className="w-10 h-10 text-green-600" />
                                        </div>
                                    </RadioGroup>

                                    <div className="flex gap-4">
                                        <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                                            Back
                                        </Button>
                                        <Button onClick={handleNext} className="flex-1">
                                            Review Order
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Step 3: Review */}
                        {step === 3 && (
                            <Card>
                                <CardContent className="p-6 space-y-6">
                                    <h2 className="text-2xl font-semibold">Review Your Order</h2>

                                    <div className="space-y-4 text-sm">
                                        <div>
                                            <p className="font-medium">Delivery To:</p>
                                            <p>{formData.name}</p>
                                            <p>{formData.phone}</p>
                                            <p>{formData.address}, {formData.city}</p>
                                            {formData.notes && <p className="text-gray-600 italic">Note: {formData.notes}</p>}
                                        </div>

                                        <Separator />

                                        <div>
                                            <p className="font-medium mb-2">Payment Method:</p>
                                            <p className="capitalize">{formData.paymentMethod.replace("_", " ")}</p>
                                        </div>
                                    </div>

                                    <Button
                                        size="lg"
                                        className="w-full text-lg py-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                        onClick={handlePlaceOrder}
                                        disabled={isPlacingOrder}
                                    >
                                        {isPlacingOrder ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                Placing Order...
                                            </>
                                        ) : (
                                            <>
                                                Place Order • {formatPrice(total)}
                                            </>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <OrderSummary items={items} />
                    </div>
                </div>
            </div>
        </div>
    );
}