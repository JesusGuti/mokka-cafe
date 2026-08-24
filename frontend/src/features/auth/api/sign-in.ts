import { apiClient } from "@/shared/lib/api/client";
import type { SignInPayload } from "../schemas/sign-in.schema";

export type { SignInPayload };

export interface SignInResponse {
  accessToken: string;
}

export async function signIn(payload: SignInPayload): Promise<SignInResponse> {
  const { data } = await apiClient.post<SignInResponse>(
    "/auth/sign-in",
    payload,
  );
  return data;
}
