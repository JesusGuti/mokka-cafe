import { apiClient } from "@/shared/lib/api/client";
import type { UserPayload } from "../schemas/users.schema";
import { UserResponse } from "../types/users.types";

export async function createUser(payload: UserPayload): Promise<UserResponse> {
  const { data } = await apiClient.post<UserResponse>("/users", payload);
  return data;
}
