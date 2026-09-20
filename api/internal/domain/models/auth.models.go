package models

import "errors"

var (
	// ErrInvalidPassword возвращается при неверном пароле входа.
	ErrInvalidPassword = errors.New("invalid password")
	// ErrUnauthenticated возвращается, когда токен отсутствует, просрочен или неверен.
	ErrUnauthenticated = errors.New("unauthenticated")
)
