import { describe, expect, it } from "vitest";
import { cleanValue } from "./input-utils";

describe("cleanValue", () => {
  describe("numeric", () => {
    it("elimina todo lo que no sea dígito", () => {
      expect(cleanValue("a1b2c3", "numeric")).toBe("123");
    });

    it("elimina ceros a la izquierda", () => {
      expect(cleanValue("007", "numeric")).toBe("7");
    });

    it("no rompe con un string vacío", () => {
      expect(cleanValue("", "numeric")).toBe("");
    });
  });

  describe("tel", () => {
    it("elimina todo lo que no sea dígito, preservando un + inicial", () => {
      expect(cleanValue("+54 (911) 234-5678", "tel")).toBe("+549112345678");
    });

    it("no preserva un + que no esté al inicio", () => {
      expect(cleanValue("54+911", "tel")).toBe("54911");
    });
  });

  describe("decimal", () => {
    it("colapsa varios puntos y trunca a 2 decimales sin perder dígitos", () => {
      // Caso del bug original: los dos pasos de la rama "decimal" pisaban
      // el resultado entre sí y terminaba dando "1.2" en vez de "1.23".
      expect(cleanValue("1.2.3", "decimal")).toBe("1.23");
    });

    it("trunca a 2 decimales cuando hay más de 2", () => {
      expect(cleanValue("12.345", "decimal")).toBe("12.34");
    });

    it("elimina ceros a la izquierda en la parte entera", () => {
      expect(cleanValue("007", "decimal")).toBe("7");
    });

    it("no toca un cero seguido de punto", () => {
      expect(cleanValue("0.5", "decimal")).toBe("0.5");
    });

    it("antepone un 0 si el valor empieza con punto", () => {
      expect(cleanValue(".5", "decimal")).toBe("0.5");
    });

    it("permite un punto final mientras se sigue escribiendo", () => {
      expect(cleanValue("1.", "decimal")).toBe("1.");
    });
  });

  describe("email", () => {
    it("quita espacios y pasa a minúsculas", () => {
      expect(cleanValue(" Nombre@Mail.COM ", "email")).toBe("nombre@mail.com");
    });
  });

  describe("url", () => {
    it("quita espacios sin cambiar mayúsculas/minúsculas", () => {
      expect(cleanValue(" https://Mokka.Cafe/Menu ", "url")).toBe(
        "https://Mokka.Cafe/Menu",
      );
    });
  });

  describe("text", () => {
    it("colapsa espacios múltiples a uno solo", () => {
      expect(cleanValue("Café   Mokka", "text")).toBe("Café Mokka");
    });
  });

  describe("search", () => {
    it("colapsa espacios múltiples y pasa a minúsculas", () => {
      expect(cleanValue("Café   MOKKA", "search")).toBe("café mokka");
    });
  });

  describe("none", () => {
    it("devuelve el valor sin modificar", () => {
      expect(cleanValue("  Sin Cambios  ", "none")).toBe("  Sin Cambios  ");
    });
  });
});
