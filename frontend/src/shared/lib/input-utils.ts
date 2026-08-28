import type { InputMode } from "@/shared/types/input";

const cleanValue = (value: string, mode: InputMode) => {
  let val = value;

  switch (mode) {
    case "numeric":
      val = val.replaceAll(/\D/g, "");
      val = val.replace(/^0+(\d)/, "$1");
      break;

    case "tel":
      val = val.replaceAll(/(?!^\+)\D/g, "");
      break;

    case "decimal": {
      val = val.replaceAll(/[^\d.]/g, "");
      val = val.replace(/^0+(\d)/, "$1");

      if (val.startsWith(".")) {
        val = "0" + val;
      }

      const [integerPart, ...decimalParts] = val.split(".");
      val =
        decimalParts.length > 0
          ? `${integerPart}.${decimalParts.join("").slice(0, 2)}`
          : integerPart;
      break;
    }

    case "email":
      val = val.replaceAll(/\s/g, "").toLowerCase();
      break;

    case "url":
      val = val.replaceAll(/\s/g, "");
      break;

    case "text":
      val = val.replaceAll(/\s{2,}/g, " ");
      break;

    case "search":
      val = val.replaceAll(/\s{2,}/g, " ").toLowerCase();
      break;

    case "none":
    default:
      break;
  }

  return val;
};

export { cleanValue };
