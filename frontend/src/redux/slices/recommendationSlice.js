// redux/slices/recommendationSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

const initialState = {
  rules: [],
  bundles: [],
  crossSell: [],
  inventory: [],
  dashboard: { bundles: [] },
  urgentBundles: [],
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: "",
};

// ================= GENERATE MBA =================
export const generateMBA = createAsyncThunk(
  "recommendations/generateMBA",
  async (params, thunkAPI) => {
    try {
      const res = await api.post("/recommendations/mba", params);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "MBA generation failed"
      );
    }
  }
);

// ================= GET RULES =================
export const getAssociationRules = createAsyncThunk(
  "recommendations/getRules",
  async (_, thunkAPI) => {
    try {
      const res = await api.get("/recommendations/rules");
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch rules"
      );
    }
  }
);

// ================= GET BUNDLES =================
export const getProductBundles = createAsyncThunk(
  "recommendations/getBundles",
  async (_, thunkAPI) => {
    try {
      const res = await api.get("/recommendations/bundles");
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch bundles"
      );
    }
  }
);

// ================= CROSS SELL =================
export const getCrossSelling = createAsyncThunk(
  "recommendations/getCrossSell",
  async (productIds, thunkAPI) => {
    try {
      const res = await api.post("/recommendations/cross-sell", {
        productIds,
      });
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Cross-sell failed"
      );
    }
  }
);

// ================= INVENTORY =================
export const getInventoryOptimization = createAsyncThunk(
  "recommendations/getInventory",
  async (_, thunkAPI) => {
    try {
      const res = await api.post("/recommendations/inventory");
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Inventory optimization failed"
      );
    }
  }
);

// ================= DASHBOARD =================
export const getDashboard = createAsyncThunk(
  "recommendations/getDashboard",
  async (_, thunkAPI) => {
    try {
      const res = await api.get("/recommendations/dashboard");
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Dashboard fetch failed"
      );
    }
  }
);

const recommendationSlice = createSlice({
  name: "recommendations",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // ---------- GENERATE MBA ----------
      .addCase(generateMBA.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
      })
      .addCase(generateMBA.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.rules = action.payload?.data?.rules || [];
      })
      .addCase(generateMBA.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // ---------- RULES ----------
      .addCase(getAssociationRules.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAssociationRules.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rules = action.payload?.data || [];
      })
      .addCase(getAssociationRules.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // ---------- BUNDLES ----------
      .addCase(getProductBundles.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProductBundles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bundles = action.payload?.data || [];
      })
      .addCase(getProductBundles.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // ---------- CROSS SELL ----------
      .addCase(getCrossSelling.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCrossSelling.fulfilled, (state, action) => {
        state.isLoading = false;
        state.crossSell = action.payload?.data || [];
      })
      .addCase(getCrossSelling.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // ---------- INVENTORY ----------
      .addCase(getInventoryOptimization.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getInventoryOptimization.fulfilled, (state, action) => {
        state.isLoading = false;
        state.inventory = action.payload?.data || [];
      })
      .addCase(getInventoryOptimization.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // ---------- DASHBOARD ----------
      .addCase(getDashboard.pending, (state) => {
        state.isLoading = true;
      })
.addCase(getDashboard.fulfilled, (state, action) => {
  state.isLoading = false;
  state.isSuccess = true;

  const dashboard = action.payload?.data || action.payload || null;
  state.dashboard = dashboard;

  if (dashboard?.bundles) {
    state.bundles = dashboard.bundles;
    state.urgentBundles = dashboard.bundles.filter(
      (b) => b.metadata?.nearExpiryInBundle
    );
  }
})

      .addCase(getDashboard.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = recommendationSlice.actions;
export default recommendationSlice.reducer;
