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

export const updateGroup = createAsyncThunk(
  "groups/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.updateGroup(id, data);
      return res.data || res;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update group");
    }
  }
);

export const deleteGroup = createAsyncThunk(
  "groups/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.deleteGroup(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete group");
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
      .addCase(fetchGroups.pending, (state) => { state.loading = true; })
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
      })
      .addCase(updateGroup.fulfilled, (state, action) => {
        const idx = state.groups.findIndex(g => g._id === action.payload._id);
        if (idx !== -1) state.groups[idx] = action.payload;
      })
      .addCase(deleteGroup.fulfilled, (state, action) => {
        state.groups = state.groups.filter(g => g._id !== action.payload);
      });
  },
});

export default groupSlice.reducer;
