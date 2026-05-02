import { useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  logout,
  setAuthBootstrapComplete,
  setIsAuthenticated,
  setUser,
} from "@/features/auth/auth.slice";
import { useGetMe } from "@/features/auth/hooks/useAuth";

export default function AuthInitializer() {
  const dispatch = useDispatch();
  const { data, isSuccess, isError, isFetched } = useGetMe();

  const user = data?.user || data?.data || null

  useEffect(() => {
    if (isFetched) {
      console.log('AuthInitializer: isFetched', isFetched, data);
      dispatch(setAuthBootstrapComplete());
    }
  }, [isFetched, dispatch]);

  useEffect(() => {
    if (isSuccess && user) {
      console.log('AuthInitializer: isSuccess', isSuccess);
      console.log('AuthInitializer: user', user);
      dispatch(setUser(user));
      dispatch(setIsAuthenticated(true));
    }
  }, [isSuccess, user, dispatch]);

  useEffect(() => {
    if (isError) {
      console.log('AuthInitializer: isError', isError);
      dispatch(logout());
    }
  }, [isError, dispatch]);

  return null;
}