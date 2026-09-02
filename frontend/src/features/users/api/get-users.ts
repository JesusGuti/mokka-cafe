import { apiClient } from "@/shared/lib/api/client";
import { UserResponse } from "../types/users.types";

export async function getUsers(): Promise<UserResponse[]> {
  const { data } = await apiClient.get<UserResponse[]>("/users");
  return data;
}
