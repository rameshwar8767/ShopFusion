import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  products: [],
  product: null,
  categories: [],
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
};

// Get all products
export const getProducts = createAsyncThunk(
  'products/getAll',
  async (params, thunkAPI) => {
    try {
      const response = await api.get('/products', { params });
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get product categories
export const getCategories = createAsyncThunk(
  'products/getCategories',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/products/categories');
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create product
export const createProduct = createAsyncThunk(
  'products/create',
  async (productData, thunkAPI) => {
    try {
      const response = await api.post('/products', productData);
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Bulk upload products
export const bulkUploadProducts = createAsyncThunk(
  'products/bulkUpload',
  async (products, thunkAPI) => {
    try {
      const response = await api.post('/products/bulk', { products });
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const productSlice = createSlice({
  name: 'products',
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
      .addCase(getProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.products = action.payload.data;
      })
      .addCase(getProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getCategories.fulfilled, (state, action) => {
        state.categories = action.payload.data;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.isSuccess = true;
        state.products.unshift(action.payload.data);
      })
      .addCase(bulkUploadProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(bulkUploadProducts.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(bulkUploadProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = productSlice.actions;
export default productSlice.reducer;
