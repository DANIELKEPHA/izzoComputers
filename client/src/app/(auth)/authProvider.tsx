"use client";

import React, { useEffect } from "react";
import { Amplify } from "aws-amplify";
import {
    Authenticator,
    Heading,
    Radio,
    RadioGroupField,
    useAuthenticator,
    View,
} from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { useRouter, usePathname } from "next/navigation";
import { useAddToCartMutation } from "@/state/api";

// Configure Amplify
Amplify.configure({
    Auth: {
        Cognito: {
            userPoolId: process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID!,
            userPoolClientId: process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_CLIENT_ID!,
        },
    },
});

const components = {
    Header() {
        return (
            <View className="mt-4 mb-7">
                <Heading level={3} className="!text-2xl !font-bold">
                    IZZO&nbsp;
                    <span className="text-secondary-500 font-light hover:!text-primary-300">
            COMPUTERS
          </span>
                </Heading>
                <p className="text-muted-foreground mt-2">
                    <span className="font-bold">Welcome!</span> Please sign in to continue
                </p>
            </View>
        );
    },
    SignIn: {
        Footer() {
            const { toSignUp } = useAuthenticator();
            return (
                <View className="text-center mt-4">
                    <p className="text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <button
                            onClick={toSignUp}
                            className="text-primary hover:underline bg-transparent border-none p-0"
                        >
                            Sign up here
                        </button>
                    </p>
                </View>
            );
        },
    },
    SignUp: {
        FormFields() {
            const { validationErrors } = useAuthenticator();
            return (
                <>
                    <Authenticator.SignUp.FormFields />
                    <RadioGroupField
                        legend="Role"
                        name="custom:role"
                        errorMessage={validationErrors?.["custom:role"]}
                        hasError={!!validationErrors?.["custom:role"]}
                        isRequired
                    >
                        <Radio value="user">User</Radio>
                        <Radio value="admin">Admin</Radio>
                    </RadioGroupField>
                </>
            );
        },
        Footer() {
            const { toSignIn } = useAuthenticator();
            return (
                <View className="text-center mt-4">
                    <p className="text-muted-foreground">
                        Already have an account?{" "}
                        <button
                            onClick={toSignIn}
                            className="text-primary hover:underline bg-transparent border-none p-0"
                        >
                            Sign in
                        </button>
                    </p>
                </View>
            );
        },
    },
};

const formFields = {
    signIn: {
        username: {
            placeholder: "Enter your email",
            label: "Email",
            isRequired: true,
        },
        password: {
            placeholder: "Enter your password",
            label: "Password",
            isRequired: true,
        },
    },
    signUp: {
        username: {
            order: 1,
            placeholder: "Choose a username",
            label: "Username",
            isRequired: true,
        },
        email: {
            order: 2,
            placeholder: "Enter your email address",
            label: "Email",
            isRequired: true,
        },
        password: {
            order: 3,
            placeholder: "Create a password",
            label: "Password",
            isRequired: true,
        },
        confirm_password: {
            order: 4,
            placeholder: "Confirm your password",
            label: "Confirm Password",
            isRequired: true,
        },
    },
};

const GUEST_CART_KEY = "guestCart";

const Auth = ({ children }: { children: React.ReactNode }) => {
    const { user, authStatus } = useAuthenticator((context) => [
        context.user,
        context.authStatus,
    ]);
    const router = useRouter();
    const pathname = usePathname();
    const isAuthPage = pathname.match(/^\/(signin|signup)$/);
    const isDashboardPage = pathname.startsWith("/admin") || pathname.startsWith("/users");

    const [addToCart] = useAddToCartMutation();

    // === GUEST CART SYNC ON SUCCESSFUL SIGN-IN ===
    useEffect(() => {
        if (authStatus === "authenticated" && user) {
            const syncGuestCart = async () => {
                const guestCartJson = localStorage.getItem(GUEST_CART_KEY);
                if (!guestCartJson) return;

                try {
                    const guestCart = JSON.parse(guestCartJson);

                    if (Array.isArray(guestCart) && guestCart.length > 0) {
                        // Sequentially add each item to the server cart
                        for (const item of guestCart) {
                            if (item.productId && item.quantity > 0) {
                                try {
                                    await addToCart({
                                        productId: item.productId,
                                        quantity: item.quantity,
                                    }).unwrap();
                                } catch (err) {
                                    console.error("Failed to sync guest cart item:", item.productId, err);
                                    // Optionally: collect failed items for retry later
                                }
                            }
                        }
                    }

                    // Clear guest cart from localStorage after successful sync
                    localStorage.removeItem(GUEST_CART_KEY);
                    window.dispatchEvent(new CustomEvent("guestCartUpdated"));
                } catch (err) {
                    console.error("Failed to parse or sync guest cart:", err);
                }
            };

            syncGuestCart();
        }
    }, [authStatus, user, addToCart]);

    // Redirect authenticated users away from auth pages
    useEffect(() => {
        if (user && isAuthPage) {
            // Optional: redirect to intended page (e.g., cart)
            const searchParams = new URLSearchParams(window.location.search);
            const redirect = searchParams.get("redirect") || "/";
            router.replace(redirect);
        }
    }, [user, isAuthPage, router]);

    // Public pages: render children directly (no auth required)
    if (!isAuthPage && !isDashboardPage) {
        return <>{children}</>;
    }

    return (
        <div className="h-full">
            <Authenticator
                initialState={pathname.includes("signup") ? "signUp" : "signIn"}
                components={components}
                formFields={formFields}
            >
                {() => <>{children}</>}
            </Authenticator>
        </div>
    );
};

export default Auth;