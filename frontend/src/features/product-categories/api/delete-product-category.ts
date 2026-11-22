import { apiClient } from "@/shared/lib/api/client";

export async function deleteProductCategory(id: string): Promise<void> {
  await apiClient.delete(`/product-categories/${id}`);
}
