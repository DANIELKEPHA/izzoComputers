import { cleanParams, createNewUserInDatabase, withToast } from "@/lib/utils";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";
import {AdvertFull, FiltersState} from ".";
import {Admin, User, Product, Advert} from "@/types/prismaTypes";

export interface ProductDetailsResponse {
    product: Product;
    relatedProducts: Product[];
}

export const api = createApi({
    baseQuery: fetchBaseQuery({
        baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
        prepareHeaders: async (headers) => {
            const session = await fetchAuthSession();
            const { idToken } = session.tokens ?? {};
            if (idToken) {
                headers.set("Authorization", `Bearer ${idToken}`);
            }
            return headers;
        },
    }),
    reducerPath: "api",
    tagTypes: [
        "Admin",
        "Users",
        "Products",
        "ProductDetails",
        "Categories",
        "Adverts",
        "NewsletterSubscribers",
        "Cart",
        "CartItems",
        "Orders",
        "DeliveryLocation",
        'RelatedProducts',
        "Review",
        "ProductReviews",
    ],
    endpoints: (build) => ({
        getAuthUser: build.query<User, void>({
            queryFn: async (_, _queryApi, _extraoptions, fetchWithBQ) => {
                try {
                    const session = await fetchAuthSession();
                    const { idToken } = session.tokens ?? {};
                    const user = await getCurrentUser();
                    const userRole = idToken?.payload["custom:role"] as string;

                    const endpoint =
                        userRole === "admin"
                            ? `/admins/${user.userId}`
                            : `/users/${user.userId}`;

                    let userDetailsResponse = await fetchWithBQ(endpoint);

                    // if user doesn't exist, create new user
                    if (
                        userDetailsResponse.error &&
                        userDetailsResponse.error.status === 404
                    ) {
                        userDetailsResponse = await createNewUserInDatabase(
                            user,
                            idToken,
                            userRole,
                            fetchWithBQ
                        );
                    }

                    return {
                        data: {
                            cognitoInfo: { ...user },
                            userInfo: userDetailsResponse.data as User | Admin,
                            userRole,
                        },
                    };
                } catch (error: any) {
                    return { error: error.message || "Could not fetch user data" };
                }
            },
        }),
        // user related endpoints
        getUser: build.query<User, string>({
            query: (cognitoId) => `users/${cognitoId}`,
            providesTags: (result) => [{ type: "Users", id: result?.id }],
            async onQueryStarted(_, { queryFulfilled }) {
                await withToast(queryFulfilled, {
                    error: "Failed to load user profile.",
                });
            },
        }),

        updateUserSettings: build.mutation<
            User,
            { cognitoId: string } & Partial<User>
        >({
            query: ({ cognitoId, ...updatedUser }) => ({
                url: `users/${cognitoId}`,
                method: "PUT",
                body: updatedUser,
            }),
            invalidatesTags: (result) => [{ type: "Users", id: result?.id }],
            async onQueryStarted(_, { queryFulfilled }) {
                await withToast(queryFulfilled, {
                    success: "Settings updated successfully!",
                    error: "Failed to update settings.",
                });
            },
        }),

        addFavoriteProduct: build.mutation<
            User,
            { cognitoId: string; productId: number }
        >({
            query: ({ cognitoId, productId }) => ({
                url: `users/${cognitoId}/favorites/${productId}`,
                method: "POST",
            }),
            invalidatesTags: (result) => [
                { type: "Users", id: result?.id },
                { type: "Products", id: "LIST" },
            ],
            async onQueryStarted(_, { queryFulfilled }) {
                await withToast(queryFulfilled, {
                    success: "Added to favorites!!",
                    error: "Failed to add to favorites",
                });
            },
        }),

        removeFavoriteProduct: build.mutation<
            User,
            { cognitoId: string; productId: number }
        >({
            query: ({ cognitoId, productId }) => ({
                url: `users/${cognitoId}/favorites/${productId}`,
                method: "DELETE",
            }),
            invalidatesTags: (result) => [
                { type: "Users", id: result?.id },
                { type: "Products", id: "LIST" },
            ],
            async onQueryStarted(_, { queryFulfilled }) {
                await withToast(queryFulfilled, {
                    success: "Removed from favorites!",
                    error: "Failed to remove from favorites.",
                });
            },
        }),

        // Product & Category endpoints
        getProduct: build.query<ProductDetailsResponse, number>({
            query: (id) => `products/${id}`,
            providesTags: (result, error, id) => {
                if (!result) {
                    return [{ type: "Products" as const, id: "LIST" }];
                }

                const { product } = result;

                return [
                    { type: "ProductDetails" as const, id: product.id },
                    { type: "Products" as const, id: product.id },
                    { type: "Products" as const, id: "LIST" },
                    { type: "Products" as const, id: `CATEGORY-${product.categoryId}` },
                ];
            },
        }),

        getFeaturedProducts: build.query<Product[], void>({
            query: () => "/products/featured",
        }),

        getProducts: build.query<
            { products: Product[]; total: number },
            FiltersState
        >({
            query: ({
                        search,
                        categoryId,
                        priceMin,
                        priceMax,
                        sort,
                        page = 1,
                        pageSize = 20,
                    }) => ({
                url: "products",
                params: cleanParams({
                    search,
                    categoryId,
                    priceMin,
                    priceMax,
                    sort,
                    page,
                    pageSize,
                }),
            }),
            providesTags: (result) =>
                result
                    ? [
                        ...result.products.map(({ id }) => ({
                            type: "Products" as const,
                            id,
                        })),
                        { type: "Products", id: "LIST" },
                    ]
                    : [{ type: "Products", id: "LIST" }],
        }),
        // === CATEGORY ENDPOINTS
        createCategory: build.mutation<
            { id: number; name: string; slug: string; coverImageUrl: string | null },
            { name: string; slug?: string; coverImage?: File }
        >({
            query: (body) => {
                const formData = new FormData();
                formData.append("name", body.name);
                if (body.slug) formData.append("slug", body.slug);
                if (body.coverImage) formData.append("coverImage", body.coverImage);

                return {
                    url: "products/categories",
                    method: "POST",
                    body: formData,
                    // Important: Do NOT set Content-Type header — let browser set it with boundary
                    headers: {},
                };
            },
            invalidatesTags: ["Categories"],
            async onQueryStarted(_, { queryFulfilled }) {
                await withToast(queryFulfilled, {
                    success: "Category created successfully!",
                    error: "Failed to create category",
                });
            },
        }),

        updateCategory: build.mutation<
            { id: number; name: string; slug: string; coverImageUrl: string | null },
            { id: number; name?: string; slug?: string; coverImage?: File; keepCoverImage?: boolean }
        >({
            query: ({ id, ...body }) => {
                const formData = new FormData();
                if (body.name) formData.append("name", body.name);
                if (body.slug) formData.append("slug", body.slug);
                if (body.coverImage) formData.append("coverImage", body.coverImage);
                if (body.keepCoverImage !== undefined) {
                    formData.append("keepCoverImage", body.keepCoverImage ? "true" : "false");
                }

                return {
                    url: `products/categories/${id}`,
                    method: "PATCH",
                    body: formData,
                    headers: {},
                };
            },
            invalidatesTags: ["Categories"],
            async onQueryStarted(_, { queryFulfilled }) {
                await withToast(queryFulfilled, {
                    success: "Category updated successfully!",
                    error: "Failed to update category",
                });
            },
        }),

        deleteCategory: build.mutation<
            { message: string },
            number // category id
        >({
            query: (id) => ({
                url: `products/categories/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Categories"],
            async onQueryStarted(_, { queryFulfilled }) {
                await withToast(queryFulfilled, {
                    success: "Category deleted successfully!",
                    error: "Failed to delete category",
                });
            },
        }),

        getCategories: build.query<
            Array<{ id: number; name: string; slug: string; coverImageUrl: string | null }>,
            void
        >({
            query: () => "products/categories",
            providesTags: ["Categories"],
        }),

        getCategoriesWithCount: build.query<
            Array<{
                id: number;
                name: string;
                slug: string;
                coverImageUrl: string | null;
                productCount: number;
            }>,
            void
        >({
            query: () => "products/categories/with-count",
            providesTags: ["Categories"],
        }),

        createProduct: build.mutation<
            { message: string; product: Product },
            {
                name: string;
                description: string;
                price: string | number;
                stock: number;
                categoryId: number;
                images?: File[];
                specs?: string;
                averageRating?: number | string | null;
                reviewCount?: number | null;
                discountPercent?: number | null;
                warranty?: string | null;
            }
        >({
            query: (productData) => {
                const formData = new FormData();

                formData.append("name", productData.name);
                formData.append("description", productData.description);
                formData.append("price", productData.price.toString());
                formData.append("stock", productData.stock.toString());
                formData.append("categoryId", productData.categoryId.toString());

                productData.images?.forEach((image) => {
                    formData.append("images", image);
                });

                if (productData.specs !== undefined) {
                    formData.append("specs", productData.specs);
                }

                if (productData.averageRating !== undefined && productData.averageRating !== null) {
                    formData.append("averageRating", productData.averageRating.toString());
                }

                if (productData.reviewCount !== undefined && productData.reviewCount !== null) {
                    formData.append("reviewCount", productData.reviewCount.toString());
                }

                if (productData.discountPercent !== undefined && productData.discountPercent !== null) {
                    formData.append("discountPercent", productData.discountPercent.toString());
                }

                if (productData.warranty !== undefined) {
                    formData.append("warranty", productData.warranty || "");
                }

                return {
                    url: "products",
                    method: "POST",
                    body: formData,
                };
            },
            invalidatesTags: (result) => {
                if (!result?.product) {
                    return [{ type: "Products", id: "LIST" }];
                }
                return [
                    { type: "Products", id: "LIST" },
                    { type: "Products", id: `CATEGORY-${result.product.categoryId}` },
                    { type: "ProductDetails", id: result.product.id },
                    { type: "Products", id: result.product.id },
                ];
            },
            async onQueryStarted(_, { queryFulfilled }) {
                await withToast(queryFulfilled, {
                    success: "Product created successfully!",
                    error: "Failed to create product.",
                });
            },
        }),

        updateProduct: build.mutation<
            { message: string; product: Product },
            {
                productId: number;
                name?: string;
                description?: string;
                price?: string | number;
                stock?: number;
                categoryId?: number;
                images?: File[];
                keepImageUrls?: string[];
                specs?: { key: string; value: string }[] | null;
                averageRating?: number | string | null;
                reviewCount?: number | null;
                discountPercent?: number | null;
                warranty?: string | null;
            }
        >({
            query: ({
                        productId,
                        name,
                        description,
                        price,
                        stock,
                        categoryId,
                        images,
                        keepImageUrls,
                        specs,
                        averageRating,
                        reviewCount,
                        discountPercent,
                        warranty,
                    }) => {
                const formData = new FormData();

                if (name !== undefined) formData.append("name", name);
                if (description !== undefined) formData.append("description", description ?? "");
                if (price !== undefined) formData.append("price", price.toString());
                if (stock !== undefined) formData.append("stock", stock.toString());
                if (categoryId !== undefined) formData.append("categoryId", categoryId.toString());

                images?.forEach((image) => {
                    formData.append("images", image);
                });

                if (keepImageUrls !== undefined) {
                    formData.append("keepImageUrls", JSON.stringify(keepImageUrls));
                }

                if (specs !== undefined) {
                    formData.append("specs", JSON.stringify(specs ?? []));
                }

                if (averageRating !== undefined && averageRating !== null) {
                    formData.append("averageRating", averageRating.toString());
                }

                if (reviewCount !== undefined && reviewCount !== null) {
                    formData.append("reviewCount", reviewCount.toString());
                }

                if (discountPercent !== undefined && discountPercent !== null) {
                    formData.append("discountPercent", discountPercent.toString());
                }

                if (warranty !== undefined) {
                    formData.append("warranty", warranty || "");
                }

                return {
                    url: `products/${productId}`,
                    method: "PATCH",
                    body: formData,
                };
            },
            invalidatesTags: (result, error, { productId }) => {
                const tags = [
                    { type: "Products" as const, id: productId },
                    { type: "ProductDetails" as const, id: productId },
                    { type: "Products" as const, id: "LIST" },
                ];

                if (result?.product.categoryId) {
                    tags.push({
                        type: "Products" as const,
                        id: `CATEGORY-${result.product.categoryId}`,
                    });
                }

                return tags;
            },
            async onQueryStarted(_, { queryFulfilled }) {
                await withToast(queryFulfilled, {
                    success: "Product updated successfully!",
                    error: "Failed to update product.",
                });
            },
        }),

        // In your api slice
        getRelatedProducts: build.query({
            query: ({ productId, categoryId, page = 1, pageSize = 8 }) => ({
                url: '/products',
                params: {
                    categoryId,
                    page,
                    pageSize,
                    // Optional: mimic your current related logic
                    inStock: 'true', // only in-stock
                },
            }),
            // Important: merge results for infinite scroll
            serializeQueryArgs: ({ endpointName, queryArgs }) => {
                return { endpointName, categoryId: queryArgs.categoryId }; // cache per category
            },
            merge: (currentCache, newItems, { arg }) => {
                if (arg.page === 1) {
                    return newItems.products;
                }
                return [...currentCache, ...newItems.products];
            },
            forceRefetch({ currentArg, previousArg }) {
                return currentArg?.page !== previousArg?.page;
            },
        }),

        deleteProduct: build.mutation<{ message: string; deletedProductId: number }, number>({
            query: (productId) => ({
                url: `products/${productId}`,
                method: "DELETE",
            }),
            invalidatesTags: (_result, _error, productId) => [
                { type: "Products", id: productId },
                { type: "ProductDetails", id: productId },
                { type: "Products", id: "LIST" },
                // Category-specific invalidation not possible here without extra data
                // Relying on "LIST" is safe and sufficient for most cases
            ],
            async onQueryStarted(_arg, { queryFulfilled }) {
                await withToast(queryFulfilled, {
                    success: "Product deleted successfully!",
                    error: "Failed to delete product.",
                });
            },
        }),

        getDashboardStats: build.query<{
            quickStats: {
                totalRevenue: number;
                totalOrders: number;
                activeUsers: number;
                conversionRate: number;
            };
            revenueOverTime: Array<{
                date: string;
                revenue: number;
                orders: number;
            }>;
            categoryDistribution: Array<{
                name: string;
                value: number;
            }>;
            topProducts: Array<{
                id: number;
                name: string;
                sales: number;
                revenue: number;
                growth: number;
            }>;
            recentActivity: Array<{
                id: number;
                user: string;
                action: string;
                time: string;
            }>;
            summary: {
                averageOrderValue: number;
                customerSatisfaction: number;
                returningCustomersPercent: number;
            };
        }, { range?: "week" | "month" | "quarter" | "year" }>({
            query: ({ range = "month" }) => ({
                url: "dashboard/stats",
                params: cleanParams({ range }),
            }),
            providesTags: ["Orders", "Products", "Users"],
            async onQueryStarted(_, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                } catch {
                    await withToast(Promise.reject(), {
                        error: "Failed to load dashboard statistics",
                    });
                }
            },
        }),
        // === CART ENDPOINTS ===
        getCart: build.query<
            {
                cart: {
                    id: number | null;
                    userId: number;
                    items: Array<{
                        id: number;
                        cartId: number;
                        productId: number;
                        quantity: number;
                        product: {
                            id: number;
                            name: string;
                            slug: string;
                            price: any;
                            imageUrl: string | null;
                            imageUrls: string[];
                            stock: number;
                            discountPercent: number | null;
                            warranty: string | null;
                        };
                    }>;
                };
                totalItems: number;
                totalPrice: any;
            },
            void
        >({
            query: () => "carts",
            providesTags: ["Cart", "CartItems"],
        }),

        addToCart: build.mutation<
            { message: string; cartItem: any },
            { productId: number; quantity?: number }
        >({
            query: (body) => ({
                url: "carts",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Cart", "CartItems"],
            async onQueryStarted(arg, { queryFulfilled, dispatch }) {
                try {
                    await queryFulfilled;
                    await withToast(queryFulfilled, {
                        success: "Added to cart!",
                    });
                } catch (error: any) {
                    // If unauthorized (guest user), save to localStorage
                    if (error?.error?.status === 401 || error?.error?.originalStatus === 401) {
                        const GUEST_CART_KEY = "guestCart";
                        const currentCart = JSON.parse(localStorage.getItem(GUEST_CART_KEY) || "[]");

                        const existingIndex = currentCart.findIndex(
                            (item: any) => item.productId === arg.productId
                        );

                        if (existingIndex !== -1) {
                            // Update quantity
                            currentCart[existingIndex].quantity += arg.quantity || 1;
                        } else {
                            // Add new item
                            currentCart.push({
                                productId: arg.productId,
                                quantity: arg.quantity || 1,
                            });
                        }

                        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(currentCart));

                        // Dispatch custom event to update navbar/cart count
                        window.dispatchEvent(new CustomEvent("guestCartUpdated"));

                        // Show success toast even for guests
                        await withToast(Promise.resolve(), {
                            success: "Added to cart!",
                        });
                    } else {
                        // For all other errors, show error toast
                        await withToast(Promise.reject(error), {
                            error: "Failed to add to cart",
                        });
                    }
                }
            },
        }),

        updateCartItem: build.mutation<
            { message: string; cartItem?: any },
            { productId: number; quantity: number }
        >({
            query: ({ productId, quantity }) => ({
                url: `carts/${productId}`,
                method: "PATCH",
                body: { quantity },
            }),
            invalidatesTags: ["Cart", "CartItems"],
            async onQueryStarted(_, { queryFulfilled }) {
                await withToast(queryFulfilled, {
                    success: "Cart updated!",
                    error: "Failed to update cart",
                });
            },
        }),

        removeFromCart: build.mutation<{ message: string }, number>({
            query: (productId) => ({
                url: `carts/${productId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Cart", "CartItems"],
            async onQueryStarted(_, { queryFulfilled }) {
                await withToast(queryFulfilled, {
                    success: "Item removed from cart",
                    error: "Failed to remove item",
                });
            },
        }),

        clearCart: build.mutation<{ message: string }, void>({
            query: () => ({
                url: "carts",
                method: "DELETE",
            }),
            invalidatesTags: ["Cart", "CartItems"],
            async onQueryStarted(_, { queryFulfilled }) {
                await withToast(queryFulfilled, {
                    success: "Cart cleared!",
                    error: "Failed to clear cart",
                });
            },
        }),

        syncGuestCart: build.mutation<
            { message: string },
            { guestCart: Array<{ productId: number; quantity: number }> }
        >({
            query: (body) => ({
                url: "carts/sync",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Cart", "CartItems"],
        }),

        updateAdminSettings: build.mutation<
            Admin,
            { cognitoId: string } & Partial<Admin>
        >({
            query: ({ cognitoId, ...updatedAdmin }) => ({
                url: `admins/${cognitoId}`,
                method: "PUT",
                body: updatedAdmin,
            }),
            invalidatesTags: (result) => [{ type: "Admin", id: result?.id }],
            async onQueryStarted(_, { queryFulfilled }) {
                await withToast(queryFulfilled, {
                    success: "Settings updated successfully!",
                    error: "Failed to update settings.",
                });
            },
        }),

        getAdverts: build.query<Array<AdvertFull>, { categoryId?: string | number } | void>({
            query: (params) => ({
                url: "adverts",
                params: params?.categoryId ? { categoryId: params.categoryId } : undefined,
            }),
            providesTags: ["Adverts"],
        }),

        createAdvert: build.mutation<
            { message: string; advert: AdvertFull },
            {
                title: string;
                subtitle: string;
                description?: string | null;
                ctaText: string;
                ctaLink: string;
                backgroundColor: string;
                backgroundImage?: string | null;
                textColor: string;
                badge?: string | null;
                badgeColor?: string | null;
                discount?: string | null;
                timerText?: string | null;
                price?: string | null;
                imageUrl?: string | null;
                secondaryLink?: string | null;
                features?: string[];
                displayDuration?: number;
                startsAt?: string;
                endsAt?: string | null;
                priority?: number;
                categoryIds?: number[];
            }
        >({
            query: (body) => ({
                url: "adverts",
                method: "POST",
                body: {
                    ...body,
                    features: body.features || [],
                    categoryIds: body.categoryIds ? JSON.stringify(body.categoryIds) : undefined,
                },
            }),
            invalidatesTags: ["Adverts"],
            async onQueryStarted(_, { queryFulfilled }) {
                await withToast(queryFulfilled, {
                    success: "Advert created successfully!",
                    error: "Failed to create advert.",
                });
            },
        }),

        updateAdvert: build.mutation<
            { message: string; advert: AdvertFull },
            {
                id: number;
                title?: string;
                subtitle?: string;
                description?: string | null;
                ctaText?: string;
                ctaLink?: string;
                backgroundColor?: string;
                backgroundImage?: string | null;     // ← NEW
                textColor?: string;
                badge?: string | null;
                badgeColor?: string | null;
                discount?: string | null;
                timerText?: string | null;
                price?: string | null;               // ← NEW
                imageUrl?: string | null;            // ← NEW
                secondaryLink?: string | null;       // ← NEW
                features?: string[];                 // ← NEW
                displayDuration?: number;
                startsAt?: string;
                endsAt?: string | null;
                priority?: number;
                isActive?: boolean;
                categoryIds?: number[];
            }
        >({
            query: ({ id, ...body }) => ({
                url: `adverts/${id}`,
                method: "PUT",
                body: {
                    ...body,
                    features: body.features !== undefined ? body.features : undefined,
                    categoryIds: body.categoryIds ? JSON.stringify(body.categoryIds) : undefined,
                },
            }),
            invalidatesTags: ["Adverts"],
            async onQueryStarted(_, { queryFulfilled }) {
                await withToast(queryFulfilled, {
                    success: "Advert updated successfully!",
                    error: "Failed to update advert.",
                });
            },
        }),

        deleteAdvert: build.mutation<{ message: string }, number>({
            query: (id) => ({
                url: `adverts/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Adverts"],
            async onQueryStarted(_, { queryFulfilled }) {
                await withToast(queryFulfilled, {
                    success: "Advert deleted successfully!",
                    error: "Failed to delete advert.",
                });
            },
        }),

        // Newsletter endpoints
        subscribeToNewsletter: build.mutation<
            { message: string; subscriber: any },
            { email: string; name?: string; userId?: number }
        >({
            query: (body) => ({
                url: "newsletter/subscribe",
                method: "POST",
                body,
            }),
            invalidatesTags: ["NewsletterSubscribers"],
            async onQueryStarted(_, { queryFulfilled }) {
                await withToast(queryFulfilled, {
                    success: "Thank you for subscribing!",
                    error: "Failed to subscribe. Please try again.",
                });
            },
        }),

        unsubscribeFromNewsletter: build.mutation<
            { message: string; email: string },
            { email: string }
        >({
            query: (body) => ({
                url: "newsletter/unsubscribe",
                method: "POST",
                body,
            }),
            invalidatesTags: ["NewsletterSubscribers"],
            async onQueryStarted(_, { queryFulfilled }) {
                await withToast(queryFulfilled, {
                    success: "You've been unsubscribed.",
                    error: "Failed to unsubscribe.",
                });
            },
        }),

        getNewsletterSubscribers: build.query<
            {
                subscribers: Array<{
                    id: number;
                    email: string;
                    name: string | null;
                    isActive: boolean;
                    subscribedAt: string;
                    userId: number | null;
                }>;
                pagination: {
                    page: number;
                    pageSize: number;
                    total: number;
                    totalPages: number;
                };
            },
            { page?: number; pageSize?: number; includeInactive?: boolean }
        >({
            query: ({ page = 1, pageSize = 50, includeInactive = false }) => ({
                url: "newsletter/subscribers",
                params: cleanParams({ page, pageSize, includeInactive }),
            }),
            providesTags: ["NewsletterSubscribers"],
        }),

        // === ORDER ENDPOINTS ===
        createOrder: build.mutation<
            {
                message: string;
                order: {
                    id: number;
                    total: number;
                    status: string;
                    createdAt: string;
                    paymentMethod: string;
                };
            },
            {
                paymentMethod: string;
                address: string;
                phone: string;
                name: string;
                city: string;
                notes?: string;
            }
        >({
            query: (orderData) => ({
                url: "orders",
                method: "POST",
                body: orderData,
            }),

            // Invalidate tags to refresh related queries
            invalidatesTags: ["Cart", "CartItems", "Orders"],

            // Optional: Handle side effects or custom toasts
            async onQueryStarted(_, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                } catch (err) {
                }
            },
        }),

        getOrders: build.query<{
            orders: Array<any>;
            pagination: { page: number; pageSize: number; total: number; totalPages: number };
        }, { page?: number; pageSize?: number; status?: string }>({
            query: (params) => ({
                url: "orders",
                params: cleanParams(params),
            }),
            providesTags: ["Orders"],
        }),

        getOrderById: build.query<{ order: any }, number>({
            query: (id) => `orders/${id}`,
            providesTags: (result, error, id) => [{ type: "Orders", id }],
        }),

        updateOrderStatus: build.mutation<
            { message: string; order: any },
            { orderId: number; status: string }
        >({
            query: ({ orderId, status }) => ({
                url: `orders/${orderId}/status`,
                method: "PATCH",
                body: { status },
            }),
            invalidatesTags: (result, error, { orderId }) => [
                { type: "Orders", id: orderId },
                "Orders",
            ],
        }),

        // === DELIVERY LOCATION ENDPOINTS ===
        getCounties: build.query<
            Array<{ id: number; name: string }>,
            void
        >({
            query: () => "/delivery-location/counties",
            providesTags: ["DeliveryLocation"],
        }),

        getTownsByCounty: build.query<
            Array<{ id: number; name: string; postalCode: string }>,
            number
        >({
            query: (countyId) => `/delivery-location/towns/${countyId}`,
            providesTags: ["DeliveryLocation"],
        }),

        getMyDeliveryLocation: build.query<
            | {
            userId: number;
            countyId: number;
            townId: number;
            county: { id: number; name: string };
            town: { id: number; name: string; postalCode: string };
        }
            | null,
            void
        >({
            query: () => "/delivery-location/my",
            providesTags: ["DeliveryLocation"],
        }),

        saveMyDeliveryLocation: build.mutation<
            {
                message: string;
                location: {
                    userId: number;
                    countyId: number;
                    townId: number;
                    county: { id: number; name: string };
                    town: { id: number; name: string; postalCode: string };
                };
            },
            { countyId: number; townId: number }
        >({
            query: (body) => ({
                url: "/delivery-location/my",
                method: "POST",
                body,
            }),
            invalidatesTags: ["DeliveryLocation"],
            async onQueryStarted(_, { queryFulfilled }) {
                await withToast(queryFulfilled, {
                    success: "Delivery location saved successfully!",
                    error: "Failed to save delivery location",
                });
            },
        }),

        deleteMyDeliveryLocation: build.mutation<
            { message: string },
            void
        >({
            query: () => ({
                url: "/delivery-location/my",
                method: "DELETE",
            }),
            invalidatesTags: ["DeliveryLocation"],
            async onQueryStarted(_, { queryFulfilled }) {
                await withToast(queryFulfilled, {
                    success: "Delivery location removed",
                    error: "Failed to delete delivery location",
                });
            },
        }),

        getProductReviews: build.query<any[], number>({
            query: (productId) => `/reviews/product/${productId}`,
            providesTags: ["ProductReviews"],
        }),


        getMyProductReview: build.query<
            {
                id: number;
                rating: number;
                title: string | null;
                comment: string | null;
                createdAt: string;
            } | null,
            number
        >({
            query: (productId) => `/reviews/my/${productId}`,
            providesTags: (result, error, productId) => [
                { type: "Review", id: "MY_REVIEW" },
                { type: "ProductReviews", id: productId },
            ],
        }),

        upsertReview: build.mutation<
            { message: string; review: any },
            { productId: number; rating: number; title?: string; comment?: string }
        >({
            query: (body) => ({
                url: "/reviews",
                method: "POST",
                body,
            }),
            invalidatesTags: ["ProductReviews", "Products", "ProductDetails"],
        }),

        deleteMyReview: build.mutation<{ message: string }, number>({
            query: (productId) => ({
                url: `/reviews/${productId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["ProductReviews", "Products", "ProductDetails"],
        }),

    }),
});

export const {
    useGetAuthUserQuery,
    useUpdateUserSettingsMutation,
    useUpdateAdminSettingsMutation,
    useGetUserQuery,
    useAddFavoriteProductMutation,
    useRemoveFavoriteProductMutation,
    useCreateProductMutation,
    useGetCategoriesQuery,
    useGetCategoriesWithCountQuery,
    useCreateCategoryMutation,
    useDeleteCategoryMutation,
    useUpdateCategoryMutation,
    useUpdateProductMutation,
    useDeleteProductMutation,
    useGetProductsQuery,
    useGetProductQuery,
    useGetFeaturedProductsQuery,
    useGetRelatedProductsQuery,
    useGetDashboardStatsQuery,
    useGetAdvertsQuery,
    useCreateAdvertMutation,
    useUpdateAdvertMutation,
    useDeleteAdvertMutation,
    useSubscribeToNewsletterMutation,
    useUnsubscribeFromNewsletterMutation,
    useGetNewsletterSubscribersQuery,
    useGetCartQuery,
    useAddToCartMutation,
    useUpdateCartItemMutation,
    useRemoveFromCartMutation,
    useClearCartMutation,
    useSyncGuestCartMutation,
    useCreateOrderMutation,
    useGetOrdersQuery,
    useGetOrderByIdQuery,
    useUpdateOrderStatusMutation,
    useGetCountiesQuery,
    useGetTownsByCountyQuery,
    useGetMyDeliveryLocationQuery,
    useSaveMyDeliveryLocationMutation,
    useDeleteMyDeliveryLocationMutation,
    useGetProductReviewsQuery,
    useGetMyProductReviewQuery,
    useUpsertReviewMutation,
    useDeleteMyReviewMutation,
} = api;