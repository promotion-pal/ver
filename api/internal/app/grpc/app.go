package grpc

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"time"

	"connectrpc.com/connect"
	"connectrpc.com/grpcreflect"
	"github.com/rs/cors"
	"golang.org/x/net/http2"
	"golang.org/x/net/http2/h2c"

	"dvgmu/ver/contract/gen/go/service/serviceconnect"
	"dvgmu/ver/internal/grpc"
)

type App struct {
	log        *slog.Logger
	httpServer *http.Server
	port       int
}

func New(
	log *slog.Logger,
	authController *grpc.AuthController,
	authInterceptor connect.Interceptor,
	journalController *grpc.JournalController,
	workEntryController *grpc.WorkEntryController,
	feedbackController *grpc.FeedbackController,
	schemeStageController *grpc.SchemeStageController,
	port int,
) *App {
	mux := http.NewServeMux()

	corsHandler := cors.New(cors.Options{
		AllowedOrigins: []string{
			"http://localhost:3000",
			"http://localhost:5173",
			"https://ver.dvgmu.promotion-pal.ru",
		},
		AllowedMethods: []string{
			"GET", "POST", "OPTIONS", "PUT", "DELETE",
		},
		AllowedHeaders: []string{
			"Connect-Protocol-Version",
			"Content-Type",
			"Authorization",
			"Cookie",
			"X-Grpc-Web",
			"X-User-Agent",
		},
		ExposedHeaders: []string{
			"Connect-Content-Encoding",
			"Connect-Accept-Encoding",
			"Grpc-Status",
			"Grpc-Message",
		},
		AllowCredentials: true,
	})

	protected := connect.WithInterceptors(authInterceptor)

	authPath, authHandler := serviceconnect.NewAuthServiceHandler(authController, protected)
	mux.Handle(authPath, authHandler)

	journalPath, journalHandler := serviceconnect.NewJournalServiceHandler(journalController, protected)
	mux.Handle(journalPath, journalHandler)

	workEntryPath, workEntryHandler := serviceconnect.NewWorkEntryServiceHandler(workEntryController, protected)
	mux.Handle(workEntryPath, workEntryHandler)

	feedbackPath, feedbackHandler := serviceconnect.NewFeedbackServiceHandler(feedbackController, protected)
	mux.Handle(feedbackPath, feedbackHandler)

	schemeStagePath, schemeStageHandler := serviceconnect.NewSchemeStageServiceHandler(schemeStageController, protected)
	mux.Handle(schemeStagePath, schemeStageHandler)

	reflector := grpcreflect.NewStaticReflector(
		serviceconnect.AuthServiceName,
		serviceconnect.JournalServiceName,
		serviceconnect.WorkEntryServiceName,
		serviceconnect.FeedbackServiceName,
		serviceconnect.SchemeStageServiceName,
	)
	mux.Handle(grpcreflect.NewHandlerV1(reflector))
	mux.Handle(grpcreflect.NewHandlerV1Alpha(reflector))

	srv := &http.Server{
		Addr:    fmt.Sprintf(":%d", port),
		Handler: corsHandler.Handler(h2c.NewHandler(mux, &http2.Server{})),
	}

	return &App{
		log:        log,
		httpServer: srv,
		port:       port,
	}
}

func (a *App) MustRun() {
	if err := a.Run(); err != nil {
		panic(err)
	}
}

func (a *App) Run() error {
	const op = "grpcapp.Run"
	a.log.Info("Connect RPC (gRPC/JSON) server started", slog.Int("port", a.port))
	if err := a.httpServer.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		return fmt.Errorf("%s: %w", op, err)
	}
	return nil
}

func (a *App) Stop() {
	const op = "grpcapp.Stop"
	a.log.With(slog.String("op", op)).Info("stopping Connect RPC server", slog.Int("port", a.port))
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := a.httpServer.Shutdown(ctx); err != nil {
		a.log.Error("server forced to shutdown", slog.String("error", err.Error()))
	}
}
