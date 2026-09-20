package service

import (
	"crypto/hmac"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/hex"
	"strconv"
	"strings"
	"time"

	"dvgmu/ver/internal/domain/models"
)

// AuthService — временный доступ по общему паролю.
//
// Токен не хранится на сервере: это "<unix-время-истечения>.<HMAC>", подписанный
// ключом, выведенным из пароля. Смена пароля сразу отзывает все выданные токены.
type AuthService struct {
	passwordHash [sha256.Size]byte
	key          []byte
	ttl          time.Duration
	now          func() time.Time
}

func NewAuthService(password string, ttl time.Duration) *AuthService {
	key := sha256.Sum256([]byte("ver-session:" + password))
	return &AuthService{
		passwordHash: sha256.Sum256([]byte(password)),
		key:          key[:],
		ttl:          ttl,
		now:          time.Now,
	}
}

// Login проверяет пароль (за постоянное время) и выдаёт токен.
func (s *AuthService) Login(password string) (string, time.Time, error) {
	given := sha256.Sum256([]byte(password))
	if subtle.ConstantTimeCompare(given[:], s.passwordHash[:]) != 1 {
		return "", time.Time{}, models.ErrInvalidPassword
	}

	expires := s.now().Add(s.ttl).Truncate(time.Second)
	exp := strconv.FormatInt(expires.Unix(), 10)
	return exp + "." + s.sign(exp), expires, nil
}

// Verify проверяет подпись и срок токена и возвращает момент истечения.
func (s *AuthService) Verify(token string) (time.Time, error) {
	exp, mac, ok := strings.Cut(token, ".")
	if !ok {
		return time.Time{}, models.ErrUnauthenticated
	}
	unix, err := strconv.ParseInt(exp, 10, 64)
	if err != nil {
		return time.Time{}, models.ErrUnauthenticated
	}
	if !hmac.Equal([]byte(mac), []byte(s.sign(exp))) {
		return time.Time{}, models.ErrUnauthenticated
	}

	expires := time.Unix(unix, 0)
	if !s.now().Before(expires) {
		return time.Time{}, models.ErrUnauthenticated
	}
	return expires, nil
}

func (s *AuthService) sign(payload string) string {
	m := hmac.New(sha256.New, s.key)
	m.Write([]byte(payload))
	return hex.EncodeToString(m.Sum(nil))
}
