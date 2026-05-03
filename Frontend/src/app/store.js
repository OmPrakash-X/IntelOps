import { configureStore } from "@reduxjs/toolkit";
import authReducer from '../features/auth/authSlice';
import incidentReducer from '../features/incidents/incidentSlice';
import projectReducer from '../features/project/projectSlice';
import groupReducer from '../features/groups/groupSlice';
import userReducer from '../features/users/userSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        incidents: incidentReducer,
        projects: projectReducer,
        groups: groupReducer,
        users: userReducer,
    }
});