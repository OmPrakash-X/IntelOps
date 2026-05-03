import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiGetMe, apiLogin, apiLogout } from "../api/auth.api";
import { useDispatch } from "react-redux";
import { logout, setAuth } from "../auth.slice";

export const useLogin = ()  => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: apiLogin,

    onSuccess: (data) => {
      if (data?.user) {
        queryClient.setQueryData(["user"], data.user);

        dispatch(
          setAuth({
            user: data.user,
            access_token: data.access_token || "",
            message: data.message || "Login successful",
          })
        );

        toast.success("Login successfully.");
      } else {
        console.log(data);
      }
    },

    onError: (err) => {
      console.log(err);
      const message =
        err?.response?.data?.message ||
        "Failed login system. Please try again.";

      toast.error(message);
    },
  });
};

export const useGetMe = () => {
  return useQuery({
    queryKey: ["user"],
    queryFn: apiGetMe,
    staleTime: 1000 * 60 * 5,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    enabled: true,
  });
};

export const useLogout = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiLogout,
    onSuccess: (data) => {
      if (data) {
        queryClient.removeQueries({ queryKey: ["user"] });
        dispatch(logout());
        toast.success("Logout successfully.");
      }
    },
  });
};