import React from "react";
import {
    Loader2,
    Sparkles,
    Orbit,
    BarChart3,
    Infinity as InfinityIcon,
    Clock,
    Activity
} from "lucide-react";
import { cn } from "@/lib/utils";

export type LoadingVariant =
    | "default"
    | "fullscreen"
    | "overlay"
    | "inline"
    | "skeleton"
    | "spinner-only"
    | "pulse"
    | "wave"
    | "orbit";

export type LoadingSize = "sm" | "md" | "lg" | "xl";

interface LoadingProps {
    variant?: LoadingVariant;
    size?: LoadingSize;
    text?: string;
    fullPage?: boolean;
    className?: string;
    showBackground?: boolean;
    showProgress?: boolean;
    progress?: number;
}

const Loading: React.FC<LoadingProps> = ({
                                             variant = "default",
                                             size = "md",
                                             text = "Loading...",
                                             fullPage = false,
                                             className,
                                             showBackground = true,
                                             showProgress = false,
                                             progress = 0,
                                         }) => {
    const sizeClasses = {
        sm: "h-4 w-4",
        md: "h-6 w-6",
        lg: "h-8 w-8",
        xl: "h-12 w-12",
    };

    const textSizeClasses = {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base",
        xl: "text-lg",
    };

    const containerClasses = cn(
        "flex items-center justify-center",
        {
            "fixed inset-0 z-50": fullPage || variant === "fullscreen",
            "absolute inset-0 bg-background/80 backdrop-blur-sm":
                (variant === "overlay" || variant === "fullscreen") && showBackground,
            "relative inline-flex": variant === "inline" || variant === "spinner-only",
            "gap-2": variant !== "spinner-only" && variant !== "skeleton",
        },
        className
    );

    const renderSpinner = () => {
        switch (variant) {
            case "pulse":
                return (
                    <div className="relative">
                        <div className={cn(
                            "rounded-full bg-primary animate-ping",
                            sizeClasses[size]
                        )} />
                        <div className={cn(
                            "absolute inset-0 rounded-full border-2 border-primary/20",
                            sizeClasses[size]
                        )} />
                    </div>
                );

            case "wave":
                return (
                    <div className="flex items-center gap-1">
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "bg-primary rounded-full animate-wave",
                                    size === "sm" ? "h-1.5 w-1.5" :
                                        size === "md" ? "h-2 w-2" :
                                            size === "lg" ? "h-2.5 w-2.5" : "h-3 w-3"
                                )}
                                style={{
                                    animationDelay: `${i * 0.1}s`,
                                    animationDuration: "1s",
                                }}
                            />
                        ))}
                    </div>
                );

            case "orbit":
                return (
                    <div className="relative">
                        <Orbit className={cn(
                            "text-primary animate-spin",
                            sizeClasses[size]
                        )} />
                        <div className={cn(
                            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
                            "h-1/2 w-1/2 rounded-full border border-primary/30"
                        )} />
                    </div>
                );

            default:
                return (
                    <Loader2 className={cn(
                        "animate-spin text-primary",
                        sizeClasses[size]
                    )} />
                );
        }
    };

    const renderSkeleton = () => {
        if (variant !== "skeleton") return null;

        return (
            <div className="w-full space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
                <div className="space-y-2">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-5/6" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-4/6" />
                </div>
            </div>
        );
    };

    const renderProgress = () => {
        if (!showProgress) return null;

        return (
            <div className="w-full max-w-xs space-y-2">
                <div className="flex justify-between text-xs text-gray-500">
                    <span>{text}</span>
                    <span>{progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        );
    };

    if (variant === "skeleton") {
        return (
            <div className={cn("w-full", className)}>
                {renderSkeleton()}
            </div>
        );
    }

    return (
        <div className={containerClasses}>
            <div className="flex flex-col items-center justify-center gap-4">
                {variant !== "spinner-only" && variant !== "wave" && (
                    <div className="relative">
                        {renderSpinner()}
                        {variant === "default" && (
                            <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-primary/60 animate-pulse" />
                        )}
                    </div>
                )}

                {variant !== "spinner-only" && variant !== "wave" && (
                    <div className="flex flex-col items-center gap-2">
                        {showProgress ? (
                            renderProgress()
                        ) : (
                            <>
                <span className={cn(
                    "font-medium text-gray-700 dark:text-gray-300",
                    textSizeClasses[size]
                )}>
                  {text}
                </span>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <Clock className="h-3 w-3" />
                                    <span>Please wait</span>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {variant === "wave" && (
                    <div className="flex flex-col items-center gap-2">
                        {renderSpinner()}
                        <span className={cn(
                            "font-medium text-gray-700 dark:text-gray-300",
                            textSizeClasses[size]
                        )}>
              {text}
            </span>
                    </div>
                )}

                {/* Subtle animation in background for fullscreen variant */}
                {(variant === "fullscreen" || fullPage) && showBackground && (
                    <>
                        <div className="absolute inset-0 overflow-hidden opacity-5">
                            <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-primary blur-3xl" />
                            <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-secondary blur-3xl" />
                        </div>
                        <div className="absolute bottom-8 text-xs text-gray-400">
                            <div className="flex items-center gap-2">
                                <Activity className="h-3 w-3 animate-pulse" />
                                <span>Initializing application...</span>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

// Export variants as separate components for convenience
export const FullScreenLoading = (props: Omit<LoadingProps, 'variant' | 'fullPage'>) => (
    <Loading variant="fullscreen" fullPage {...props} />
);

export const OverlayLoading = (props: Omit<LoadingProps, 'variant'>) => (
    <Loading variant="overlay" {...props} />
);

export const InlineLoading = (props: Omit<LoadingProps, 'variant'>) => (
    <Loading variant="inline" {...props} />
);

export const SkeletonLoading = (props: Omit<LoadingProps, 'variant'>) => (
    <Loading variant="skeleton" {...props} />
);

export const SpinnerLoading = (props: Omit<LoadingProps, 'variant'>) => (
    <Loading variant="spinner-only" {...props} />
);

export default Loading;