import { toast } from "@/shared/components/ui/toast";

export type ToastMode = "success" | "error" | "warning" | "info" | "loading";

const TOAST_TIMEOUTS: Record<ToastMode, number> = {
  success: 3000,
  error: 5000,
  warning: 5000,
  info: 3000,
  loading: 0,
};

export const showToast = (
  message: string,
  mode: ToastMode,
  overrides?: { description?: string; timeout?: number },
) =>
  toast.add({
    type: mode,
    title: message,
    timeout: TOAST_TIMEOUTS[mode],
    ...overrides,
  });
