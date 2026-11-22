import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useRetainedValue } from "./use-retained-value";

describe("useRetainedValue", () => {
  it("devuelve null si nunca hubo un valor", () => {
    const { result } = renderHook(() => useRetainedValue<string>(null));

    expect(result.current).toBeNull();
  });

  it("devuelve el valor actual mientras no es null", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useRetainedValue(value),
      { initialProps: { value: "a" as string | null } },
    );

    expect(result.current).toBe("a");

    rerender({ value: "b" });

    expect(result.current).toBe("b");
  });

  it("conserva el último valor cuando el actual pasa a null", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useRetainedValue(value),
      { initialProps: { value: "a" as string | null } },
    );

    rerender({ value: null });

    expect(result.current).toBe("a");
  });

  it("al volver un valor nuevo después de null, usa el nuevo", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useRetainedValue(value),
      { initialProps: { value: "a" as string | null } },
    );

    rerender({ value: null });
    rerender({ value: "c" });

    expect(result.current).toBe("c");
  });
});
