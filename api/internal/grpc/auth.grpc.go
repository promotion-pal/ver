package grpc

import (
	"context"
	"strings"
	"time"

	"connectrpc.com/connect"
	"google.golang.org/protobuf/types/known/timestamppb"

	pb "dvgmu/ver/contract/gen/go/service"
	"dvgmu/ver/contract/gen/go/service/serviceconnect"
	"dvgmu/ver/internal/domain/models"
	"dvgmu/ver/internal/service"
)

// wrongPasswordDelay замедляет перебор пароля.
const wrongPasswordDelay = 500 * time.Millisecond

const bearerPrefix = "Bearer "

// bearerToken достаёт токен из заголовка Authorization.
func bearerToken(header string) (string, bool) {
	return strings.CutPrefix(header, bearerPrefix)
}

type AuthController struct {
	service *service.AuthService
}

func NewAuthController(service *service.AuthService) *AuthController {
	return &AuthController{service: service}
}

func (h *AuthController) Login(
	ctx context.Context,
	req *connect.Request[pb.LoginRequest],
) (*connect.Response[pb.LoginResponse], error) {
	token, expires, err := h.service.Login(req.Msg.GetPassword())
	if err != nil {
		select {
		case <-time.After(wrongPasswordDelay):
		case <-ctx.Done():
		}
		return nil, connect.NewError(connect.CodeUnauthenticated, models.ErrInvalidPassword)
	}

	return connect.NewResponse(&pb.LoginResponse{
		Token:     token,
		ExpiresAt: timestamppb.New(expires),
	}), nil
}

// Check доходит до обработчика только с валидным токеном (см. NewAuthInterceptor).
func (h *AuthController) Check(
	_ context.Context,
	req *connect.Request[pb.CheckRequest],
) (*connect.Response[pb.CheckResponse], error) {
	token, _ := bearerToken(req.Header().Get("Authorization"))
	expires, err := h.service.Verify(token)
	if err != nil {
		return nil, connect.NewError(connect.CodeUnauthenticated, err)
	}
	return connect.NewResponse(&pb.CheckResponse{ExpiresAt: timestamppb.New(expires)}), nil
}

// NewAuthInterceptor требует валидный токен для всех процедур, кроме Login.
func NewAuthInterceptor(auth *service.AuthService) connect.Interceptor {
	return connect.UnaryInterceptorFunc(func(next connect.UnaryFunc) connect.UnaryFunc {
		return func(ctx context.Context, req connect.AnyRequest) (connect.AnyResponse, error) {
			if req.Spec().Procedure == serviceconnect.AuthServiceLoginProcedure {
				return next(ctx, req)
			}

			token, ok := bearerToken(req.Header().Get("Authorization"))
			if !ok {
				return nil, connect.NewError(connect.CodeUnauthenticated, models.ErrUnauthenticated)
			}
			if _, err := auth.Verify(token); err != nil {
				return nil, connect.NewError(connect.CodeUnauthenticated, err)
			}
			return next(ctx, req)
		}
	})
}
