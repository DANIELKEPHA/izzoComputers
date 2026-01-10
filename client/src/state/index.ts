import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ProductSpec {
    key: string;
    value: string;
}

export interface FiltersState {
    search?: string;
    categoryId?: number;
    priceMin?: number;
    priceMax?: number;
    sort?: string;
    page?: number;
    pageSize?: number;
    onlyFavorites?: boolean;
}

export interface CartItem {
    productId: number;
    quantity: number;
    product?: {
        id: number;
        name: string;
        price: any; // Decimal from Prisma
        imageUrl: string | null;
        discountPercent: number | null;
    };
}

export interface UseCartReturn {
    items: CartItem[];
    count: number;
    total: number;
    isLoading: boolean;
    addItem: (productId: number, quantity?: number) => Promise<void>;
    updateQuantity: (productId: number, quantity: number) => Promise<void>;
    removeItem: (productId: number) => Promise<void>;
    clearCart: () => Promise<void>;
}

export interface Advert {
    id: number;
    title: string;
    subtitle: string;
    description?: string | null;
    ctaText: string;
    ctaLink: string;
    backgroundColor: string;
    textColor: string;
    badge?: string | null;
    badgeColor?: string | null;
    discount?: string | null;
    timerText?: string | null;
}

export type AdvertFull = {
    id: number;
    title: string;
    subtitle: string;
    description?: string | null;
    ctaText: string;
    ctaLink: string;

    backgroundColor: string;
    backgroundImage?: string | null;     // ← NEW
    textColor: string;

    badge?: string | null;
    badgeColor?: string | null;
    discount?: string | null;
    timerText?: string | null;
    price?: string | null;               // ← NEW
    imageUrl?: string | null;            // ← NEW
    secondaryLink?: string | null;       // ← NEW
    features: string[];                  // ← NEW (always array)

    displayDuration: number;
    startsAt: string;
    endsAt?: string | null;
    priority: number;
    isActive: boolean;

    categories: Array<{
        category: {
            id: number;
            name: string;
            slug?: string;
        };
    }>;
};

export interface ProductDetailsResponse {
    product: any;
    relatedProducts: any[];
}

interface InitialStateTypes {
  filters: FiltersState;
  isFiltersFullOpen: boolean;
  viewMode: "table" | "card";
}

export const initialState: InitialStateTypes = {
    filters: {
        search: undefined,
        categoryId: undefined,
        priceMin: undefined,
        priceMax: undefined,
        sort: "featured",
        page: 1,
        pageSize: 20,
    },
    isFiltersFullOpen: false,
    viewMode: "table",
};


export const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<FiltersState>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    toggleFiltersFullOpen: (state) => {
      state.isFiltersFullOpen = !state.isFiltersFullOpen;
    },
    setViewMode: (state, action: PayloadAction<"table" | "card">) => {
      state.viewMode = action.payload;
    },
  },
});

export const { setFilters, toggleFiltersFullOpen, setViewMode } =
  globalSlice.actions;

export default globalSlice.reducer;
