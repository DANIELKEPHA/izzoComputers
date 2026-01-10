// components/ui/hover-card.tsx
"use client";

import * as React from "react";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import { cn } from "@/lib/utils";

const HoverCard = HoverCardPrimitive.Root;

const HoverCardTrigger = HoverCardPrimitive.Trigger;

const HoverCardContent = React.forwardRef<
    React.ElementRef<typeof HoverCardPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
    <HoverCardPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        className={cn(
            "z-50 w-64 rounded-md border bg-white p-4 text-gray-950 shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
            className
        )}
        {...props}
    />
));
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName;

// Extended HoverCard with different variants
interface ExtendedHoverCardProps {
    children: React.ReactNode;
    className?: string;
    side?: "top" | "right" | "bottom" | "left";
    align?: "start" | "center" | "end";
    sideOffset?: number;
    openDelay?: number;
    closeDelay?: number;
}

const ExtendedHoverCard: React.FC<ExtendedHoverCardProps> = ({
                                                                 children,
                                                                 className,
                                                                 side = "bottom",
                                                                 align = "center",
                                                                 sideOffset = 4,
                                                                 openDelay = 200,
                                                                 closeDelay = 100,
                                                                 ...props
                                                             }) => {
    return (
        <HoverCardPrimitive.Root openDelay={openDelay} closeDelay={closeDelay}>
            <div className={className} {...props}>
                {children}
            </div>
        </HoverCardPrimitive.Root>
    );
};

// HoverCard with image/icon support
interface HoverCardWithMediaProps {
    trigger: React.ReactNode;
    imageUrl?: string;
    title?: string;
    description?: string;
    footer?: React.ReactNode;
    className?: string;
}

const HoverCardWithMedia: React.FC<HoverCardWithMediaProps> = ({
                                                                   trigger,
                                                                   imageUrl,
                                                                   title,
                                                                   description,
                                                                   footer,
                                                                   className,
                                                               }) => {
    return (
        <HoverCard>
            <HoverCardTrigger asChild>{trigger}</HoverCardTrigger>
            <HoverCardContent className={cn("w-80 p-0", className)}>
                {imageUrl && (
                    <div className="relative h-40 w-full overflow-hidden rounded-t-lg">
                        <img
                            src={imageUrl}
                            alt={title || "Preview"}
                            className="h-full w-full object-cover"
                        />
                    </div>
                )}
                <div className={cn("p-4", !imageUrl && "rounded-lg")}>
                    {title && (
                        <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
                    )}
                    {description && (
                        <p className="mt-2 text-sm text-gray-600">{description}</p>
                    )}
                    {footer && <div className="mt-4">{footer}</div>}
                </div>
            </HoverCardContent>
        </HoverCard>
    );
};

export {
    HoverCard,
    HoverCardTrigger,
    HoverCardContent,
    ExtendedHoverCard,
    HoverCardWithMedia,
};