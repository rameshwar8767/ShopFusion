import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  transactions: [],
  transaction: null,
  stats: null,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
  pagination: {
    page: 1,
    pages: 1,
    total: 0,
  },
};

// Get all transactions
export const getTransactions = createAsyncThunk(
  'transactions/getAll',
  async (params, thunkAPI) => {
    try {
      const response = await api.get('/transactions', { params });
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get transaction stats
export const getTransactionStats = createAsyncThunk(
  'transactions/getStats',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/transactions/stats');
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create transaction
export const createTransaction = createAsyncThunk(
  'transactions/create',
  async (transactionData, thunkAPI) => {
    try {
      const response = await api.post('/transactions', transactionData);
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Bulk upload transactions
export const bulkUploadTransactions = createAsyncThunk(
  'transactions/bulkUpload',
  async (transactions, thunkAPI) => {
    try {
      const response = await api.post('/transactions/bulk', { transactions });
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete transaction
export const deleteTransaction = createAsyncThunk(
  'transactions/delete',
  async (id, thunkAPI) => {
    try {
      await api.delete(`/transactions/${id}`);
      return id;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getTransactions.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.transactions = action.payload.data;
        state.pagination = {
          page: action.payload.page,
          pages: action.payload.pages,
          total: action.payload.total,
        };
      })
      .addCase(getTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getTransactionStats.fulfilled, (state, action) => {
        state.stats = action.payload.data;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.isSuccess = true;
        state.transactions.unshift(action.payload.data);
      })
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
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.transactions = state.transactions.filter(
          (transaction) => transaction._id !== action.payload
        );
      });
  },
});

export const { reset } = transactionSlice.actions;
export default transactionSlice.reducer;
