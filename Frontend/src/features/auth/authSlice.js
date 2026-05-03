import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { loginUser, getMe } from "./services/auth.api";

// --- Thunks ---

export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const data = await loginUser(credentials);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Login failed");
    }
  }
);

export const fetchMyProfile = createAsyncThunk(
  "auth/fetchMyProfile",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getMe();
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch profile");
    }
  }
);

// --- Slice ---

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: localStorage.getItem("token") || null,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        const { user, token } = action.payload;
        state.user = user;
        state.token = token;
        if (token) localStorage.setItem("token", token);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Profile
      .addCase(fetchMyProfile.fulfilled, (state, action) => {
        state.user = action.payload.user || action.payload.data || action.payload;
      })
      .addCase(fetchMyProfile.rejected, (state, action) => {
        // Don't log the user out on profile fetch failure
        // (e.g., brief network error). The token is still valid.
        console.warn('[auth] fetchMyProfile failed:', action.payload);
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;