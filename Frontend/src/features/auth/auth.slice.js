import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  access_token: "",
  isAuthenticated: false,
  loading: true,
  error: null,
  message: null,
  sessionExpired: false,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },

    setAccessToken: (state, action) => {
      state.access_token = action.payload;
    },

    setIsAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload;
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setAuthBootstrapComplete: (state) => {
      state.loading = false;
    },

    setAuthBootstrapStart: (state) => {
      state.loading = true;
    },

    setError: (state, action) => {
      state.error = action.payload;
    },

    setMessage: (state, action) => {
      state.message = action.payload;
    },

    setSessionExpired: (state, action) => {
      state.sessionExpired = action.payload;
    },

    setAuth: (state, action) => {
      state.user = action.payload.user;
      state.access_token = action.payload.access_token;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },

    clearError: (state) => {
      state.error = null;
    },

    clearMessage: (state) => {
      state.message = null;
    },

    logout: (state) => {
      state.user = null;
      state.access_token = "";
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      state.message = null;
      state.sessionExpired = false;
    },
  },
});

export const {
  setUser,
  setAccessToken,
  setIsAuthenticated,
  setLoading,
  setAuthBootstrapComplete,
  setAuthBootstrapStart,
  setSessionExpired,
  setError,
  setMessage,
  setAuth,
  clearError,
  clearMessage,
  logout,
} = authSlice.actions;

export default authSlice.reducer;