package service

import (
	"errors"
	"testing"
	"time"

	"dvgmu/ver/internal/domain/models"
)

func TestAuthService(t *testing.T) {
	now := time.Date(2026, 9, 20, 12, 0, 0, 0, time.UTC)
	newService := func(password string) *AuthService {
		s := NewAuthService(password, time.Hour)
		s.now = func() time.Time { return now }
		return s
	}
	svc := newService("secret")

	if _, _, err := svc.Login("wrong"); !errors.Is(err, models.ErrInvalidPassword) {
		t.Fatalf("wrong password: got %v, want ErrInvalidPassword", err)
	}

	token, expires, err := svc.Login("secret")
	if err != nil {
		t.Fatalf("login: %v", err)
	}
	if want := now.Add(time.Hour); !expires.Equal(want) {
		t.Fatalf("expires = %v, want %v", expires, want)
	}
	if got, err := svc.Verify(token); err != nil || !got.Equal(expires) {
		t.Fatalf("verify fresh token: %v, %v", got, err)
	}

	t.Run("expired", func(t *testing.T) {
		later := newService("secret")
		later.now = func() time.Time { return now.Add(time.Hour) }
		if _, err := later.Verify(token); !errors.Is(err, models.ErrUnauthenticated) {
			t.Fatalf("got %v, want ErrUnauthenticated", err)
		}
	})

	t.Run("rotated password revokes tokens", func(t *testing.T) {
		if _, err := newService("other").Verify(token); !errors.Is(err, models.ErrUnauthenticated) {
			t.Fatalf("got %v, want ErrUnauthenticated", err)
		}
	})

	t.Run("tampered or malformed", func(t *testing.T) {
		for _, bad := range []string{"", "abc", "1.2.3", "9999999999.deadbeef", "x." + "00"} {
			if _, err := svc.Verify(bad); !errors.Is(err, models.ErrUnauthenticated) {
				t.Errorf("token %q: got %v, want ErrUnauthenticated", bad, err)
			}
		}
	})
}
