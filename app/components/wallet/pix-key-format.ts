export type PixKeyType = "cpf" | "cnpj" | "email" | "phone" | "random";

import { formatCpf } from "~/util/cpf";

export function formatCnpj(value: string) {
  // New CNPJ format (IN RFB 2.043/2024) supports alphanumeric characters
  // Mask: XX.XXX.XXX/XXXX-XX  (X = digit or uppercase letter)
  const clean = value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 14);
  return clean
    .replace(/^([A-Z0-9]{2})([A-Z0-9])/, "$1.$2")
    .replace(/^([A-Z0-9]{2})\.([A-Z0-9]{3})([A-Z0-9])/, "$1.$2.$3")
    .replace(/\.([A-Z0-9]{3})([A-Z0-9])/, ".$1/$2")
    .replace(/([A-Z0-9]{4})([A-Z0-9])/, "$1-$2");
}

export function formatPhone(value: string) {
  // Descarta o DDI (+55) quando presente: usa os últimos 11 dígitos (DDD + número)
  const all = value.replace(/\D/g, "");
  const digits = all.length > 11 ? all.slice(-11) : all;
  const formatted = digits.replace(/^(\d{2})(\d)/, "($1) $2");
  if (digits.length <= 10) {
    return formatted.replace(/(\d{4})(\d)/, "$1-$2");
  }
  return formatted.replace(/(\d{5})(\d)/, "$1-$2");
}

export function formatByType(value: string, type: PixKeyType | ""): string {
  if (!type || !value) return value;
  if (type === "cpf") return formatCpf(value);
  if (type === "cnpj") return formatCnpj(value);
  if (type === "phone") return formatPhone(value);
  return value;
}

export function normalizeByType(raw: string, type: PixKeyType | ""): string {
  if (!type) return raw;
  if (type === "cpf") return raw.replace(/\D/g, "");
  // CNPJ: strip formatting but keep alphanumeric (new format)
  if (type === "cnpj") return raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (type === "phone") {
    const digits = raw.replace(/\D/g, "");
    // Descarta o DDI (+55): grava só DDD + número
    if (digits.length > 11 && digits.startsWith("55")) {
      return digits.substring(2);
    }
    return digits;
  }
  return raw.trim();
}

export function getTypeName(type: string) {
  const types: Record<string, string> = {
    cpf: "CPF",
    cnpj: "CNPJ",
    email: "E-mail",
    phone: "Telefone",
    random: "Aleatória",
  };
  return types[type.toLowerCase()] || type;
}

/**
 * Exibe um valor mascarado vindo do backend sem o DDI.
 * Cobre chaves antigas gravadas como "+55 (12) 9****-3417" -> "(12) 9****-3417".
 */
export function displayMaskedKey(
  masked: string | undefined | null,
): string {
  if (!masked) return "";
  return masked.replace(/^\+\d{1,3}\s/, "");
}

/**
 * Formata o valor completo de uma chave Pix para exibição
 * (ex. CPF "12345678901" -> "123.456.789-01").
 * Usado onde o usuário precisa confirmar o destino exato (ex. modal de saque).
 * Faz fallback para o valor informado quando o tipo não tem máscara.
 */
export function formatPixKeyValue(
  key: string | undefined | null,
  keyType: string | undefined | null,
): string {
  if (!key) return "";
  const normalized = (keyType ?? "").toLowerCase() as PixKeyType | "";
  if (normalized === "cpf" || normalized === "cnpj" || normalized === "phone") {
    return formatByType(key, normalized);
  }
  return key;
}

export interface PixKeyDisplay {
  key?: string | null;
  keyMasked?: string | null;
  keyType?: string | null;
  /** @deprecated Backend agora expõe `keyMasked`. */
  pixValue?: string | null;
}

/**
 * Exibição canônica da chave: completa (com máscara por tipo) ou mascarada.
 * Sem `keyType` (chave excluída ou backend antigo): exibe o valor como veio.
 */
export function getPixDisplayName(
  item: PixKeyDisplay,
  showFull: boolean,
): string {
  if (showFull) {
    const full = item.key ?? item.keyMasked ?? "—";
    if (!item.key || !item.keyType) return full;
    return formatPixKeyValue(item.key, item.keyType);
  }
  return displayMaskedKey(item.keyMasked ?? item.pixValue ?? "—");
}
