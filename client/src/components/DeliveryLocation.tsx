"use client";

import React, { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { MapPin, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

// List of Kenyan counties with sample towns
const counties = [
    { id: 1, name: "Mombasa", towns: [{ id: 1, name: "Mombasa", postalCode: "80100" }, { id: 2, name: "Likoni", postalCode: "80101" }] },
    { id: 2, name: "Kwale", towns: [{ id: 3, name: "Msambweni", postalCode: "80400" }, { id: 4, name: "Kinango", postalCode: "80401" }] },
    { id: 3, name: "Kilifi", towns: [{ id: 5, name: "Kilifi", postalCode: "80108" }, { id: 6, name: "Malindi", postalCode: "80200" }] },
    { id: 4, name: "Tana River", towns: [{ id: 7, name: "Garsen", postalCode: "70300" }] },
    { id: 5, name: "Lamu", towns: [{ id: 8, name: "Lamu", postalCode: "80500" }] },
    { id: 6, name: "Taita Taveta", towns: [{ id: 9, name: "Voi", postalCode: "80300" }] },
    { id: 7, name: "Garissa", towns: [{ id: 10, name: "Garissa", postalCode: "70100" }] },
    { id: 8, name: "Wajir", towns: [{ id: 11, name: "Wajir", postalCode: "70200" }] },
    { id: 9, name: "Mandera", towns: [{ id: 12, name: "Mandera", postalCode: "70300" }] },
    { id: 10, name: "Marsabit", towns: [{ id: 13, name: "Marsabit", postalCode: "60500" }] },
    { id: 11, name: "Isiolo", towns: [{ id: 14, name: "Isiolo", postalCode: "60300" }] },
    { id: 12, name: "Meru", towns: [{ id: 15, name: "Meru", postalCode: "60200" }] },
    { id: 13, name: "Tharaka Nithi", towns: [{ id: 16, name: "Chuka", postalCode: "60400" }] },
    { id: 14, name: "Embu", towns: [{ id: 17, name: "Embu", postalCode: "60100" }] },
    { id: 15, name: "Kitui", towns: [{ id: 18, name: "Kitui", postalCode: "90200" }] },
    { id: 16, name: "Machakos", towns: [{ id: 19, name: "Machakos", postalCode: "90100" }] },
    { id: 17, name: "Makueni", towns: [{ id: 20, name: "Wote", postalCode: "90300" }] },
    { id: 18, name: "Nyandarua", towns: [{ id: 21, name: "Nyahururu", postalCode: "20300" }] },
    { id: 19, name: "Nyeri", towns: [{ id: 22, name: "Nyeri", postalCode: "10100" }] },
    { id: 20, name: "Kirinyaga", towns: [{ id: 23, name: "Kerugoya", postalCode: "10300" }] },
    { id: 21, name: "Murang'a", towns: [{ id: 24, name: "Murang'a", postalCode: "10200" }] },
    { id: 22, name: "Kiambu", towns: [{ id: 25, name: "Thika", postalCode: "0100" }] },
    { id: 23, name: "Turkana", towns: [{ id: 26, name: "Lodwar", postalCode: "30500" }] },
    { id: 24, name: "West Pokot", towns: [{ id: 27, name: "Kapenguria", postalCode: "30600" }] },
    { id: 25, name: "Samburu", towns: [{ id: 28, name: "Maralal", postalCode: "70300" }] },
    { id: 26, name: "Trans-Nzoia", towns: [{ id: 29, name: "Kitale", postalCode: "30200" }] },
    { id: 27, name: "Uasin Gishu", towns: [{ id: 30, name: "Eldoret", postalCode: "30100" }] },
    { id: 28, name: "Elgeyo Marakwet", towns: [{ id: 31, name: "Iten", postalCode: "30700" }] },
    { id: 29, name: "Nandi", towns: [{ id: 32, name: "Kapsabet", postalCode: "30300" }] },
    { id: 30, name: "Baringo", towns: [{ id: 33, name: "Kabarnet", postalCode: "30400" }] },
    { id: 31, name: "Laikipia", towns: [{ id: 34, name: "Nanyuki", postalCode: "10400" }] },
    { id: 32, name: "Nakuru", towns: [{ id: 35, name: "Nakuru", postalCode: "20100" }] },
    { id: 33, name: "Narok", towns: [{ id: 36, name: "Narok", postalCode: "20400" }] },
    { id: 34, name: "Kajiado", towns: [{ id: 37, name: "Kajiado", postalCode: "20400" }] },
    { id: 35, name: "Kericho", towns: [{ id: 38, name: "Kericho", postalCode: "20200" }] },
    { id: 36, name: "Bomet", towns: [{ id: 39, name: "Bomet", postalCode: "20400" }] },
    { id: 37, name: "Kakamega", towns: [{ id: 40, name: "Kakamega", postalCode: "50100" }] },
    { id: 38, name: "Vihiga", towns: [{ id: 41, name: "Vihiga", postalCode: "50300" }] },
    { id: 39, name: "Bungoma", towns: [{ id: 42, name: "Bungoma", postalCode: "50200" }] },
    { id: 40, name: "Busia", towns: [{ id: 43, name: "Busia", postalCode: "50400" }] },
    { id: 41, name: "Siaya", towns: [{ id: 44, name: "Siaya", postalCode: "40600" }] },
    { id: 42, name: "Kisumu", towns: [{ id: 45, name: "Kisumu", postalCode: "40100" }] },
    { id: 43, name: "Homa Bay", towns: [{ id: 46, name: "Homa Bay", postalCode: "40300" }] },
    { id: 44, name: "Migori", towns: [{ id: 47, name: "Migori", postalCode: "40400" }] },
    { id: 45, name: "Kisii", towns: [{ id: 48, name: "Kisii", postalCode: "40200" }] },
    { id: 46, name: "Nyamira", towns: [{ id: 49, name: "Nyamira", postalCode: "20500" }] },
    { id: 47, name: "Nairobi", towns: [{ id: 50, name: "Nairobi", postalCode: "00100" }] },
];

const DeliveryLocationDropdown = () => {
    const [selectedCounty, setSelectedCounty] = useState<string | undefined>();
    const [selectedTown, setSelectedTown] = useState<string | undefined>();
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem("deliveryLocation");
        if (saved) {
            const loc = JSON.parse(saved);
            setSelectedCounty(loc.countyId);
            setSelectedTown(loc.townId);
            setIsSaved(true);
        }
    }, []);

    const towns = selectedCounty
        ? counties.find((c) => c.id.toString() === selectedCounty)?.towns || []
        : [];

    const handleSave = () => {
        if (!selectedCounty || !selectedTown) return;
        localStorage.setItem(
            "deliveryLocation",
            JSON.stringify({ countyId: selectedCounty, townId: selectedTown })
        );
        setIsSaved(true);
        // Auto-hide success state after 2 seconds
        setTimeout(() => setIsSaved(false), 2000);
    };

    // Get display names for the compact view
    const countyName = selectedCounty
        ? counties.find((c) => c.id.toString() === selectedCounty)?.name
        : "";
    const townName = selectedTown
        ? towns.find((t) => t.id.toString() === selectedTown)?.name
        : "";

    return (
        <div className="flex flex-col gap-1">
            {/* Amazon-style compact header */}
            <div className="flex items-center gap-1 text-sm">
                <MapPin className="h-3.5 w-3.5 text-amber-700" />
                <span className="text-gray-600">Deliver to</span>
                <span className="font-semibold text-gray-900">
                    {countyName && townName ? (
                        <>
                            {townName}, {countyName}
                        </>
                    ) : (
                        <span className="text-gray-500">Select location</span>
                    )}
                </span>
            </div>

            {/* Dropdowns with Amazon styling */}
            <div className="flex items-center gap-2">
                <div className="relative">
                    <Select
                        value={selectedCounty}
                        onValueChange={(val) => {
                            setSelectedCounty(val);
                            setSelectedTown(undefined);
                            setIsSaved(false);
                        }}
                    >
                        <SelectTrigger className="w-40 h-8 text-sm border-gray-300 hover:border-amber-600 focus:ring-amber-500 focus:border-amber-600 rounded-md">
                            <SelectValue placeholder="Select county" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                            {counties.map((county) => (
                                <SelectItem
                                    key={county.id}
                                    value={county.id.toString()}
                                    className="text-sm hover:bg-amber-50 focus:bg-amber-50"
                                >
                                    {county.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="relative">
                    <Select
                        value={selectedTown}
                        onValueChange={(val) => {
                            setSelectedTown(val);
                            setIsSaved(false);
                        }}
                        disabled={!selectedCounty}
                    >
                        <SelectTrigger className={`w-44 h-8 text-sm rounded-md ${!selectedCounty ? 'bg-gray-50 text-gray-400' : 'border-gray-300 hover:border-amber-600 focus:ring-amber-500'}`}>
                            <SelectValue placeholder={selectedCounty ? "Select town" : "Select county first"} />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                            {towns.map((town) => (
                                <SelectItem
                                    key={town.id}
                                    value={town.id.toString()}
                                    className="text-sm hover:bg-amber-50 focus:bg-amber-50"
                                >
                                    <div className="flex justify-between items-center">
                                        <span>{town.name}</span>
                                        <span className="text-gray-500 text-xs">{town.postalCode}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={!selectedCounty || !selectedTown || isSaved}
                    className={`h-8 text-sm px-3 rounded-md transition-all duration-200 ${
                        isSaved
                            ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-100'
                            : 'bg-amber-600 hover:bg-amber-700 text-white border-transparent'
                    }`}
                >
                    {isSaved ? (
                        <>
                            <Check className="h-3.5 w-3.5 mr-1" />
                            Saved
                        </>
                    ) : (
                        'Save'
                    )}
                </Button>
            </div>
        </div>
    );
};

export default DeliveryLocationDropdown;