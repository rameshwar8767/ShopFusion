import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

// Fetch paginated movement logs
export const getInventoryLogs = createAsyncThunk(
  "inventory/getLogs",
  async (params, thunkAPI) => {
    try {
      const res = await api.get("/inventory/logs", { params });
      return res.data; // This returns { data: [], pagination: {} }
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Error fetching logs"
      );
    }
  }
);

// Fetch aggregated stats for the cards
export const getWarehouseStats = createAsyncThunk(
  "inventory/getStats",
  async (_, thunkAPI) => {
    try {
      const res = await api.get("/inventory/stats");
      // res.data.data contains the array of aggregated stats
      return res.data.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Error fetching stats"
      );
    }
  }
);

const inventorySlice = createSlice({
  name: "inventory",
  initialState: {
    logs: [],
    stats: [],
    pagination: {
      total: 0,
      totalPages: 1,
      currentPage: 1,
    },
    isLoading: false,
    isError: false,
    errorMessage: "",
  },
  reducers: {
    clearInventoryError: (state) => {
      state.isError = false;
      state.errorMessage = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle Inventory Logs
      .addCase(getInventoryLogs.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(getInventoryLogs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.logs = action.payload.data;
        // Map backend 'pagination' keys to the state
        if (action.payload.pagination) {
          state.pagination.totalPages = action.payload.pagination.pages;
          state.pagination.currentPage = action.payload.pagination.page;
          state.pagination.total = action.payload.pagination.total;
        }
      })
      .addCase(getInventoryLogs.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload;
      })

      // Handle Warehouse Stats
      .addCase(getWarehouseStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(getWarehouseStats.rejected, (state) => {
        state.isError = true;
      });
  },
});

export const { clearInventoryError } = inventorySlice.actions;
export default inventorySlice.reducer;