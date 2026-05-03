import { configureStore } from "@reduxjs/toolkit";
import { authSlice } from "@/features/auth/auth.slice";
import incidentReducer from "@/features/incidents/incidentSlice";
import groupReducer from "@/features/groups/groupSlice";
import projectReducer from "@/features/project/projectSlice";
import userReducer from "@/features/users/userSlice";

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    incidents: incidentReducer,
    groups: groupReducer,
    projects: projectReducer,
    users: userReducer,
  },
});