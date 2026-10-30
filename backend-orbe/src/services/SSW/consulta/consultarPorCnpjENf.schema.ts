import { z } from "zod";

/**
 * Schemas de entrada da consulta pública SSW (CNPJ destinatário + NF).
 */
export const cnpjSchema = z
  .string()
  .transform((value) => value.replace(/\D/g, ""))
  .refine((value) => value.length === 14, "CNPJ deve conter 14 dígitos")
  .refine((value) => !/^(\d)\1{13}$/.test(value), "CNPJ inválido")
  .refine((value) => {
    const calculateDigit = (base: string, weights: number[]) => {
      const total = base
        .split("")
        .reduce((sum, digit, index) => sum + Number(digit) * weights[index], 0);
      const remainder = total % 11;
      return remainder < 2 ? 0 : 11 - remainder;
    };

    const firstDigit = calculateDigit(value.slice(0, 12), [
      5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2,
    ]);
    const secondDigit = calculateDigit(
      `${value.slice(0, 12)}${firstDigit}`,
      [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
    );
    return value === `${value.slice(0, 12)}${firstDigit}${secondDigit}`;
  }, "CNPJ inválido");

export const nfNumberSchema = z.string().trim().min(1, "Nota fiscal é obrigatória.");
