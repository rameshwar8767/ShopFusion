import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

// Load user from localStorage
const storedUser = JSON.parse(localStorage.getItem("user"));

const initialState = {
  user: storedUser || null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: "",
};

// ======================
// REGISTER
// ======================
export const register = createAsyncThunk(
  "auth/register",
  async (userData, thunkAPI) => {
    try {
      const res = await api.post("/auth/register", userData);
      localStorage.setItem("user", JSON.stringify(res.data.data));
      return res.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Registration failed"
      );
    }
  }
);

// ======================
// LOGIN
// ======================
export const login = createAsyncThunk(
  "auth/login",
  async (userData, thunkAPI) => {
    try {
      const res = await api.post("/auth/login", userData);
      localStorage.setItem("user", JSON.stringify(res.data.data));
      return res.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Login failed"
      );
    }
  }
);

// ======================
// LOGOUT
// ======================
export const logout = createAsyncThunk("auth/logout", async () => {
  localStorage.removeItem("user");
});

// ======================
// GET PROFILE
// ======================
export const getMe = createAsyncThunk(
  "auth/getMe",
  async (_, thunkAPI) => {
    try {
      const res = await api.get("/auth/me");
      return res.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue("Session expired");
    }
  }
);
export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (data, thunkAPI) => {
    try {
      const res = await api.put("/auth/update-profile", data);
      localStorage.setItem("user", JSON.stringify(res.data.data));
      return res.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Profile update failed"
      );
    }
  }
);
// ======================
// SLICE
// ======================
const authSlice = createSlice({
  name: "auth",
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
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })

      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })

      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
      })

      // GetMe
      .addCase(getMe.fulfilled, (state, action) => {
        state.user = {
          ...state.user,
          ...action.payload, // keep token safe
        };
      })
      .addCase(getMe.rejected, (state) => {
        state.user = null;
        localStorage.removeItem("user");
      });
  },
});


export const { reset } = authSlice.actions;
export default authSlice.reducer;