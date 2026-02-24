// redux/slices/transactionSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

// ================= GET TRANSACTIONS =================
export const getTransactions = createAsyncThunk(
  "transactions/get",
  async (
    {
      page = 1,
      limit = 20,
      search = "",
      startDate,
      endDate,
      minAmount,
      maxAmount,
    } = {},
    thunkAPI
  ) => {
    try {
      const params = {
        page,
        limit,
        search,
      };

      // Only add filters if they exist
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (minAmount) params.minAmount = minAmount;
      if (maxAmount) params.maxAmount = maxAmount;

      const res = await api.get("/transactions", { params });

      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch transactions"
      );
    }
  }
);

// ================= GET STATS =================
export const getTransactionStats = createAsyncThunk(
  "transactions/getStats",
  async (_, thunkAPI) => {
    try {
      const res = await api.get("/transactions/stats");
      // controller: { success, data: { overview, revenueByDate, topProducts } }
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch stats"
      );
    }
  }
);

// ================= CREATE TRANSACTION =================
export const createTransaction = createAsyncThunk(
  "transactions/create",
  async (data, thunkAPI) => {
    try {
      const res = await api.post("/transactions", data);
      // { success, data: transaction }
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Transaction creation failed"
      );
    }
  }
);

// ================= BULK UPLOAD =================
export const bulkUploadTransactions = createAsyncThunk(
  "transactions/bulkUpload",
  async (transactions, thunkAPI) => {
    try {
      const res = await api.post("/transactions/bulk", { transactions });
      // { success, count, data: inserted[] } or 207
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Bulk upload failed"
      );
    }
  }
);

// ================= DELETE =================
export const deleteTransaction = createAsyncThunk(
  "transactions/delete",
  async (id, thunkAPI) => {
    try {
      await api.delete(`/transactions/${id}`);
      return id;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Delete failed"
      );
    }
  }
);

// ================= INITIAL STATE =================
const initialState = {
  transactions: [],
  transaction: null,
  stats: {
    overview: {
      totalRevenue: 0,
      totalTransactions: 0,
      uniqueCustomers: 0,
      averageTransactionValue: 0,
    },
    revenueByDate: [],
    topProducts: [],
  },
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: "",
  pagination: {
    page: 1,
    pages: 1,
    total: 0,
  },
};

// ================= SLICE =================
const transactionSlice = createSlice({
  name: "transactions",
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
      // ---------- GET TRANSACTIONS ----------
      .addCase(getTransactions.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(getTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.transactions =
          action.payload.data || action.payload.transactions || [];
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(getTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // ---------- STATS ----------
      .addCase(getTransactionStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTransactionStats.fulfilled, (state, action) => {
        state.isLoading = false;
        // expect { success, data: { overview, revenueByDate, topProducts } }
        state.stats = action.payload?.data || action.payload || initialState.stats;
      })
      .addCase(getTransactionStats.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // ---------- CREATE ----------
      .addCase(createTransaction.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        if (action.payload?.data) {
          state.transactions.unshift(action.payload.data);
          state.pagination.total += 1;
        }
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // ---------- BULK UPLOAD ----------
      .addCase(bulkUploadTransactions.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(bulkUploadTransactions.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(bulkUploadTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // ---------- DELETE ----------
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.transactions = state.transactions.filter(
          (t) => t._id !== action.payload
        );
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      })
      .addCase(deleteTransaction.rejected, (state, action) => {
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = transactionSlice.actions;
export default transactionSlice.reducer;
