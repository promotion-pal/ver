/** Digits of the national part of a Russian number (after +7), at most 10. */
export const NATIONAL_LENGTH = 10;

/**
 * Turns whatever was typed or pasted ("8 (999) 123-45-67", "+7 999…",
 * "9991234567") into the national digits. The field always shows "+7",
 * so a leading 7 or 8 is the country code, not part of the number.
 */
export function parsePhoneInput(value: string): string {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("7") || digits.startsWith("8")) digits = digits.slice(1);
  return digits.slice(0, NATIONAL_LENGTH);
}

/** "9991234567" → "+7 (999) 123-45-67", progressively while typing. */
export function formatNationalPhone(national: string): string {
  if (!national) return "";
  const [a, b, c, d] = [national.slice(0, 3), national.slice(3, 6), national.slice(6, 8), national.slice(8, 10)];
  let out = `+7 (${a}`;
  if (national.length > 3) out += `) ${b}`;
  if (national.length > 6) out += `-${c}`;
  if (national.length > 8) out += `-${d}`;
  return out;
}

export const isCompletePhone = (national: string) => national.length === NATIONAL_LENGTH;

/** "+79991234567" (as stored by the API) → "+7 (999) 123-45-67". */
export function formatStoredPhone(phone: string): string {
  return phone.startsWith("+7") ? formatNationalPhone(phone.slice(2)) : phone;
}

export const toStoredPhone = (national: string) => `+7${national}`;
