import { useId, type ChangeEvent } from "react";
import { cleanValue } from "@/shared/lib/input-utils";
import type { InputMode } from "@/shared/types/input";

interface UseInputParams {
  mode: InputMode;
  name: string;
}

const useInput = ({ mode, name }: UseInputParams) => {
  const generatedId = useId();
  const id = `${name}-${generatedId}`;

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement>,
    onChange: (value: string) => void,
  ) => {
    onChange(cleanValue(event.target.value, mode));
  };

  return { id, handleInputChange };
};

export { useInput };
