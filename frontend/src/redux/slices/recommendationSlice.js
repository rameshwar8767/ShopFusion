import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  rules: [],
  bundles: [],
  crossSell: [],
  inventory: [],
  dashboard: null,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
};

// Generate MBA
export const generateMBA = createAsyncThunk(
  'recommendations/generateMBA',
  async (params, thunkAPI) => {
    try {
      const response = await api.post('/recommendations/mba', params);
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get association rules
export const getAssociationRules = createAsyncThunk(
  'recommendations/getRules',
  async (params, thunkAPI) => {
    try {
      const response = await api.get('/recommendations/rules', { params });
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get product bundles
export const getProductBundles = createAsyncThunk(
  'recommendations/getBundles',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/recommendations/bundles');
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get cross-selling recommendations
export const getCrossSelling = createAsyncThunk(
  'recommendations/getCrossSell',
  async (productIds, thunkAPI) => {
    try {
      const response = await api.post('/recommendations/cross-sell', {
        productIds,
      });
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get inventory optimization
export const getInventoryOptimization = createAsyncThunk(
  'recommendations/getInventory',
  async (_, thunkAPI) => {
    try {
      const response = await api.post('/recommendations/inventory');
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get dashboard data
export const getDashboard = createAsyncThunk(
  'recommendations/getDashboard',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/recommendations/dashboard');
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const recommendationSlice = createSlice({
  name: 'recommendations',
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
      .addCase(generateMBA.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(generateMBA.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.rules = action.payload.data.rules;
      })
      .addCase(generateMBA.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getAssociationRules.fulfilled, (state, action) => {
        state.rules = action.payload.data;
      })
      .addCase(getProductBundles.fulfilled, (state, action) => {
        state.bundles = action.payload.data;
      })
      .addCase(getCrossSelling.fulfilled, (state, action) => {
        state.crossSell = action.payload.data;
      })
      .addCase(getInventoryOptimization.fulfilled, (state, action) => {
        state.inventory = action.payload.data;
      })
      .addCase(getDashboard.fulfilled, (state, action) => {
        state.dashboard = action.payload.data;
      });
  },
});

export const { reset } = recommendationSlice.actions;
export default recommendationSlice.reducer;
