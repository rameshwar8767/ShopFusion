// redux/slices/productSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

const initialState = {
  products: [],
  product: null,
  categories: [],
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: "",
};

// ================= GET ALL PRODUCTS =================
export const getProducts = createAsyncThunk(
  "products/getAll",
  async (params, thunkAPI) => {
    try {
      const res = await api.get("/products", { params });
      // Expecting { success, data: [ ...products ] }
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch products"
      );
    }
  }
);
// ================= UPDATE PRODUCT =================
export const updateProduct = createAsyncThunk(
  "products/update",
  async ({ id, data }, thunkAPI) => {
    try {
      const res = await api.put(`/products/${id}`, data);
      // Expecting { success, data: updatedProduct }
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Product update failed"
      );
    }
  }
);


// ================= GET CATEGORIES =================
export const getCategories = createAsyncThunk(
  "products/getCategories",
  async (_, thunkAPI) => {
    try {
      const res = await api.get("/products/categories");
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch categories"
      );
    }
  }
);
// ================= DELETE PRODUCT =================
export const deleteProduct = createAsyncThunk(
  "products/delete",
  async (id, thunkAPI) => {
    try {
      const res = await api.delete(`/products/${id}`);
      // Return the id so we can remove it from the state in the reducer
      return { id, message: res.data.message };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to delete product"
      );
    }
  }
);
// ================= CREATE PRODUCT =================
export const createProduct = createAsyncThunk(
  "products/create",
  async (productData, thunkAPI) => {
    try {
      const res = await api.post("/products", productData);
      // Expecting { success, data: product }
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Product creation failed"
      );
    }
  }
);

// ================= BULK UPLOAD =================
export const bulkUploadProducts = createAsyncThunk(
  "products/bulkUpload",
  async (products, thunkAPI) => {
    try {
      const res = await api.post("/products/bulk", { products });
      // Could be { success, data: inserted[] } or count, etc.
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Bulk upload failed"
      );
    }
  }
);

// ================= SLICE =================
const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // ---------- GET PRODUCTS ----------
      .addCase(getProducts.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(getProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        // Support either { data: [...] } or { products: [...] }
        state.products = action.payload?.data || action.payload?.products || [];
      })
      .addCase(getProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // ---------- GET CATEGORIES ----------
      .addCase(getCategories.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload?.data || [];
      })
      .addCase(getCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // ---------- CREATE PRODUCT ----------
      .addCase(createProduct.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        if (action.payload?.data) {
          state.products.unshift(action.payload.data);
        }
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // ---------- BULK UPLOAD ----------
      .addCase(bulkUploadProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(bulkUploadProducts.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
        // Note: Components should call getProducts() after success
      })
      .addCase(bulkUploadProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // ---------- UPDATE PRODUCT ----------
.addCase(updateProduct.pending, (state) => {
  state.isLoading = true;
  state.isError = false;
})
.addCase(updateProduct.fulfilled, (state, action) => {
  state.isLoading = false;
  state.isSuccess = true;
  if (action.payload?.data) {
    const index = state.products.findIndex(
      (p) => p._id === action.payload.data._id
    );
    if (index !== -1) {
      // Replace the updated product in the list
      state.products[index] = action.payload.data;
    }
  }
})
.addCase(updateProduct.rejected, (state, action) => {
  state.isLoading = false;
  state.isError = true;
  state.message = action.payload;
})
.addCase(deleteProduct.pending, (state) => {
  state.isLoading = true;
})
.addCase(deleteProduct.fulfilled, (state, action) => {
  state.isLoading = false;
  state.isSuccess = true;
  // Remove the product from the local state list immediately
  state.products = state.products.filter(
    (product) => product._id !== action.payload.id
  );
})
.addCase(deleteProduct.rejected, (state, action) => {
  state.isLoading = false;
  state.isError = true;
  state.message = action.payload;
});

      
  },
});

export const { reset } = productSlice.actions;
export default productSlice.reducer;
