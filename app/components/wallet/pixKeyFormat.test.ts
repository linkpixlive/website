import { describe, expect, it } from "vitest";
import {
  displayMaskedKey,
  formatPhone,
  formatPixKeyValue,
  normalizeByType,
} from "./pixKeyFormat";

describe("phone sem DDI", () => {
  it("formata 11 dígitos como (DD) 9NNNN-NNNN", () => {
    expect(formatPhone("11999993417")).toBe("(11) 99999-3417");
  });

  it("descarta o +55 ao formatar valor completo com 13 dígitos", () => {
    expect(formatPhone("+5511999993417")).toBe("(11) 99999-3417");
    expect(formatPixKeyValue("5511999993417", "phone")).toBe(
      "(11) 99999-3417",
    );
  });

  it("normaliza telefone removendo o DDI antes de enviar", () => {
    expect(normalizeByType("+55 (11) 99999-3417", "phone")).toBe(
      "11999993417",
    );
    expect(normalizeByType("11999993417", "phone")).toBe("11999993417");
  });

  it("remove o +55 de máscaras legadas", () => {
    expect(displayMaskedKey("+55 (12) 9****-3417")).toBe("(12) 9****-3417");
    expect(displayMaskedKey("(12) 9****-3417")).toBe("(12) 9****-3417");
    expect(displayMaskedKey("joh***@email.com")).toBe("joh***@email.com");
  });
});
