import { Input } from "@/components/ui/input";
import { formatNationalPhone, parsePhoneInput } from "@/lib/phone";

/**
 * A Russian phone field with a live mask: "+7 (999) 123-45-67".
 * `value` holds only the national digits (up to 10); paste of
 * "8 999 123-45-67" or "+7…" is normalized.
 */
export function PhoneInput({
  value,
  onChange,
  onBlur,
  invalid,
}: {
  value: string;
  onChange: (national: string) => void;
  onBlur?: () => void;
  invalid?: boolean;
}) {
  return (
    <Input
      type="tel"
      inputMode="tel"
      autoComplete="tel"
      placeholder="+7 (999) 123-45-67"
      value={formatNationalPhone(value)}
      onChange={(e) => onChange(parsePhoneInput(e.target.value))}
      onBlur={onBlur}
      aria-invalid={invalid || undefined}
    />
  );
}
