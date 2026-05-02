import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { login } from "../api/auth.api";

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,

    onSuccess: (data) => {
      if (data) {
        console.log(data);
        queryClient.setQueryData(["user"], data.user);

        toast.success("Login successfully.");
      }
    },

    onError: (err) => {
      console.log(err);
      const message =
        err?.response?.data?.message || "Failed login system. Please try again.";

      toast.error(message);
    },
  });
};