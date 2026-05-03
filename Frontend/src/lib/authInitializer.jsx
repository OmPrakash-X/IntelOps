import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  logout,
  setAuthBootstrapComplete,
  setIsAuthenticated,
  setUser,
} from "@/features/auth/auth.slice";
import { useGetMe } from "@/features/auth/hooks/useAuth";
import { socket, joinUserRoom } from "@/lib/socket";

export default function AuthInitializer() {
  const dispatch = useDispatch();
  const { data, isSuccess, isError, isFetched } = useGetMe();
  const { user, isAuthenticated } = useSelector((s) => s.auth);

  const resolvedUser = data?.user || data?.data || null;

  // Bootstrap complete (either success or error)
  useEffect(() => {
    if (isFetched) {
      dispatch(setAuthBootstrapComplete());
    }
  }, [isFetched, dispatch]);

  // Authenticated
  useEffect(() => {
    if (isSuccess && resolvedUser) {
      dispatch(setUser(resolvedUser));
      dispatch(setIsAuthenticated(true));
    }
  }, [isSuccess, resolvedUser, dispatch]);

  // Not authenticated / session expired
  useEffect(() => {
    if (isError) {
      dispatch(logout());
    }
  }, [isError, dispatch]);

  // Connect socket when authenticated and join personal room
  useEffect(() => {
    if (isAuthenticated && user?._id) {
      if (!socket.connected) socket.connect();
      joinUserRoom(user._id);
    } else {
      if (socket.connected) socket.disconnect();
    }

    return () => {
      // Do NOT disconnect on every render — only when component unmounts (app unloads)
    };
  }, [isAuthenticated, user?._id]);

  return null;
}