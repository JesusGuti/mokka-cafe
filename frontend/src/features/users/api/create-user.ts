import { apiClient } from "@/shared/lib/api/client";
import type { UserPayload } from "../schemas/users.schema";

export interface CreateUserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export async function createUser(
  payload: UserPayload,
): Promise<CreateUserResponse> {
  const { data } = await apiClient.post<CreateUserResponse>("/users", payload);
  return data;
}
