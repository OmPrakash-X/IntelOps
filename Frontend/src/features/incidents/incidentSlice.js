import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "./services/incidents.api";

export const fetchIncidents = createAsyncThunk(
  "incidents/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const data = await api.getIncidents();
      return data.data || data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch incidents");
    }
  }
);

const incidentSlice = createSlice({
  name: "incidents",
  initialState: {
    incidents: [],
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchIncidents.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchIncidents.fulfilled, (state, action) => {
        state.loading = false;
        state.incidents = action.payload;
      })
      .addCase(fetchIncidents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default incidentSlice.reducer;
