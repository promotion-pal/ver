package utils

import "errors"

// ErrInvalidPhone — номер не похож на российский (11 цифр, код страны 7).
var ErrInvalidPhone = errors.New("phone must be a Russian number, e.g. +7 (999) 123-45-67")

// NormalizePhone приводит российский номер к виду +7XXXXXXXXXX.
// Принимает любой ввод с пробелами, скобками и дефисами: "8 (999) 123-45-67",
// "+7 999 123 45 67", "9991234567".
func NormalizePhone(raw string) (string, error) {
	digits := make([]byte, 0, 11)
	for _, r := range raw {
		if r >= '0' && r <= '9' {
			digits = append(digits, byte(r))
		}
	}

	switch {
	case len(digits) == 10:
	case len(digits) == 11 && (digits[0] == '7' || digits[0] == '8'):
		digits = digits[1:]
	default:
		return "", ErrInvalidPhone
	}
	return "+7" + string(digits), nil
}
