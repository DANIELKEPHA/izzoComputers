"use client";

import { useEffect } from "react";
import { useCart } from "@/hooks/useCart";

export const CartBadge = () => {
    const { count } = useCart();

    // Also listen to guest cart updates (in case another tab/window modifies localStorage)
    useEffect(() => {
        const handleUpdate = () => {
            // Trigger re-render by forcing hook to recalculate
            // (useCart already reacts to localStorage changes via its own listener)
        };

        window.addEventListener("guestCartUpdated", handleUpdate);
        return () => window.removeEventListener("guestCartUpdated", handleUpdate);
    }, []);

    if (count === 0) return null;

    return (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center shadow-sm animate-pulse">
      {count}
    </span>
    );
};