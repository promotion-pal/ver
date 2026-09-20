package utils

import "testing"

func TestNormalizePhone(t *testing.T) {
	valid := map[string]string{
		"+7 (999) 123-45-67":  "+79991234567",
		"8 (999) 123-45-67":   "+79991234567",
		"89991234567":         "+79991234567",
		"7 999 123 45 67":     "+79991234567",
		"9991234567":          "+79991234567",
		"  +7-999-123-45-67 ": "+79991234567",
	}
	for in, want := range valid {
		got, err := NormalizePhone(in)
		if err != nil || got != want {
			t.Errorf("NormalizePhone(%q) = %q, %v; want %q", in, got, err, want)
		}
	}

	for _, in := range []string{"", "123", "+7 (999) 123-45", "+1 999 123 45 67", "99912345678", "abc"} {
		if got, err := NormalizePhone(in); err == nil {
			t.Errorf("NormalizePhone(%q) = %q; want error", in, got)
		}
	}
}
