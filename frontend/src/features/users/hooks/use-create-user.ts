import { useMutation } from "@tanstack/react-query";
import type { ApiErrorResponse } from "@/shared/types/api-error";
import { getQueryClient } from "@/shared/lib/query-client";
import { createUser } from "../api/create-user";
import { usersKeys } from "../api/users.keys";
import { UserPayload } from "../schemas/users.schema";
import { UserResponse } from "../types/users.types";
import type { AxiosError } from "axios";

export const useCreateUser = () => {
  const queryClient = getQueryClient();
  return useMutation<UserResponse, AxiosError<ApiErrorResponse>, UserPayload>({
    mutationFn: createUser,
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
    },
  });
};
