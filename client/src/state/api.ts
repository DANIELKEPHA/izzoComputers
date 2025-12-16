import { cleanParams, createNewUserInDatabase, withToast } from "@/lib/utils";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";
import { FiltersState } from ".";
import {Admin, User, Product} from "@/types/prismaTypes";

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
      { cognitoId: string; propertyId: number }
    >({
      query: ({ cognitoId, propertyId }) => ({
        url: `users/${cognitoId}/favorites/${propertyId}`,
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

    // admin related endpoints
      getProduct: build.query<Product, number>({
          query: (id) => `products/${id}`,
          providesTags: (result) =>
              result
                  ? [
                      { type: "ProductDetails", id: result.id },
                      { type: "Products", id: result.id },
                      { type: "Products", id: "LIST" },
                  ]
                  : [{ type: "Products", id: "LIST" }],
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
              params: {
                  search,
                  categoryId,
                  priceMin,
                  priceMax,
                  sort,
                  page,
                  pageSize,
              },
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

      getCategories: build.query<{ id: number; name: string }[], void>({
          query: () => "products/categories",
          providesTags: ["Categories"],
      }),

      createProduct: build.mutation<
          Product,
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

              // Images
              productData.images?.forEach((image) => {
                  formData.append("images", image); // matches req.files in backend
              });

              // Specs (JSON string)
              if (productData.specs !== undefined) {
                  formData.append("specs", productData.specs);
              }

              // === NEW FIELDS ===
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
          invalidatesTags: [{ type: "Products", id: "LIST" }],
          async onQueryStarted(_, { queryFulfilled }) {
              await withToast(queryFulfilled, {
                  success: "Product created successfully!",
                  error: "Failed to create product.",
              });
          },
      }),

      deleteProduct: build.mutation<{ message: string; deletedProductId: number }, number>({
          query: (productId) => ({
              url: `products/${productId}`,
              method: "DELETE",
          }),
          invalidatesTags: (_result, _error, productId) => [
              { type: "Products", id: productId },
              { type: "Products", id: "LIST" },
          ],
          async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
              await withToast(queryFulfilled, {
                  success: "Product deleted successfully!",
                  error: "Failed to delete product.",
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

              // New images
              images?.forEach((image) => {
                  formData.append("images", image);
              });

              // Keep existing images
              if (keepImageUrls !== undefined) {
                  formData.append("keepImageUrls", JSON.stringify(keepImageUrls));
              }

              // Specs
              if (specs !== undefined) {
                  formData.append("specs", JSON.stringify(specs ?? []));
              }

              // === NEW DYNAMIC FIELDS ===
              if (averageRating !== undefined && averageRating !== null) {
                  formData.append("averageRating", averageRating.toString());
              } else if (averageRating === null) {
                  formData.append("averageRating", ""); // or omit — backend handles undefined as no change
              }

              if (reviewCount !== undefined && reviewCount !== null) {
                  formData.append("reviewCount", reviewCount.toString());
              } else if (reviewCount === null) {
                  formData.append("reviewCount", "");
              }

              if (discountPercent !== undefined && discountPercent !== null) {
                  formData.append("discountPercent", discountPercent.toString());
              } else if (discountPercent === null) {
                  formData.append("discountPercent", "");
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
          invalidatesTags: (_result, _error, { productId }) => [
              { type: "Products", id: productId },
              { type: "Products", id: "LIST" },
          ],
          async onQueryStarted(_arg, { queryFulfilled }) {
              await withToast(queryFulfilled, {
                  success: "Product updated successfully!",
                  error: "Failed to update product.",
              });
          },
      }),

      createCategory: build.mutation<{ id: number; name: string }, { name: string }>({
          query: (body) => ({
              url: "products/categories",
              method: "POST",
              body,
          }),
          invalidatesTags: ["Categories"],
          async onQueryStarted(_, { queryFulfilled }) {
              await withToast(queryFulfilled, {
                  success: "Category created successfully!",
                  error: "Failed to create category",
              });
          },
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
    useCreateCategoryMutation,
    useUpdateProductMutation,
    useDeleteProductMutation,
    useGetProductsQuery,
    useGetProductQuery,
} = api;
