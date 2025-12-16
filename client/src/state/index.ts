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
