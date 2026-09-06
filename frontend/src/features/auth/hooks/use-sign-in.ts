import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { signIn, type SignInResponse } from "../api/sign-in";
import type { SignInPayload } from "../schemas/sign-in.schema";
import { useAuthStore } from "@/shared/store/auth-store";
import type { ApiErrorResponse } from "@/shared/types/api-error";

export function useSignIn() {
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation<SignInResponse, AxiosError<ApiErrorResponse>, SignInPayload>({
    mutationFn: signIn,
    retry: false,
    onSuccess: (data) => {
      setSession(data);
    },
  });
}
