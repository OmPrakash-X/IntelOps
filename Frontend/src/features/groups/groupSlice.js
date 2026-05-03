import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "./services/group.api";

export const fetchGroups = createAsyncThunk(
  "groups/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const data = await api.fetchGroups();
      return data.data || data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch groups");
    }
  }
);

export const createGroup = createAsyncThunk(
  "groups/create",
  async (groupData, { rejectWithValue }) => {
    try {
      const data = await api.createGroup(groupData);
      return data.data || data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to create group");
    }
  }
);

const groupSlice = createSlice({
  name: "groups",
  initialState: {
    groups: [],
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGroups.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchGroups.fulfilled, (state, action) => {
        state.loading = false;
        state.groups = action.payload;
      })
      .addCase(fetchGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createGroup.fulfilled, (state, action) => {
        state.groups.push(action.payload);
      });
  },
});

export default groupSlice.reducer;
