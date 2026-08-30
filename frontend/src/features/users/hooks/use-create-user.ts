import { useMutation } from "@tanstack/react-query";
import type { ApiErrorResponse } from "@/shared/types/api-error";
import { createUser, CreateUserResponse } from "../api/create-user";
import { UserPayload } from "../schemas/users.schema";
import type { AxiosError } from "axios";

export const useCreateUser = () => {
  return useMutation<
    CreateUserResponse,
    AxiosError<ApiErrorResponse>,
    UserPayload
  >({
    mutationFn: createUser,
    retry: false,
    onSuccess: (data) => {},
  });
};
