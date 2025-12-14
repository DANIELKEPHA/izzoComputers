"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface TruncatedDescriptionProps {
    description: string;
}

export default function TruncatedDescription({ description }: TruncatedDescriptionProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const maxLength = 280; // adjust as needed

    const shouldTruncate = description.length > maxLength;
    const displayedText = shouldTruncate && !isExpanded
        ? description.slice(0, maxLength).split(" ").slice(0, -1).join(" ") + "…"
        : description;

    return (
        <div className="text-lg text-gray-700 leading-relaxed whitespace-pre-wrap">
            {displayedText}
            {shouldTruncate && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-1 mt-3 text-orange-600 font-medium hover:text-orange-700 transition-colors"
                >
                    {isExpanded ? (
                        <>Show less <ChevronUp className="w-4 h-4" /></>
                    ) : (
                        <>Read more <ChevronDown className="w-4 h-4" /></>
                    )}
                </button>
            )}
        </div>
    );
}