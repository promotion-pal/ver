package app

import (
	"log/slog"

	"github.com/pressly/goose/v3"

	"dvgmu/ver"
	grpcapp "dvgmu/ver/internal/app/grpc"
	"dvgmu/ver/internal/config"
	"dvgmu/ver/internal/grpc"
	"dvgmu/ver/internal/service"
	"dvgmu/ver/internal/storage"
)

type App struct {
	GRPCServer *grpcapp.App
}

func New(
	log *slog.Logger,
	cfg *config.Config,
) *App {
	db, err := storage.New(cfg.Database, log)
	if err != nil {
		log.Error("failed to connect database", "error", err.Error())
		panic(err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		log.Error("failed to obtain sql.DB from gorm pool", "error", err.Error())
		panic(err)
	}

	if err := goose.SetDialect("postgres"); err != nil {
		log.Error("failed to set goose dialect", "error", err.Error())
		panic(err)
	}
	goose.SetBaseFS(ver.MigrationsFS)

	log.Info("running database migrations")
	if err := goose.Up(sqlDB, "db/migrations/journal"); err != nil {
		log.Error("migration execution failed", "error", err.Error())
		panic(err)
	}
	log.Info("database migrations applied")

	authService := service.NewAuthService(cfg.Auth.Password, cfg.Auth.SessionTTL)
	authController := grpc.NewAuthController(authService)

	journalController := grpc.NewJournalController(
		service.NewJournalService(storage.JournalStorageNew(db, log)),
	)
	workEntryController := grpc.NewWorkEntryController(
		service.NewWorkEntryService(storage.WorkEntryStorageNew(db, log)),
	)

	feedbackController := grpc.NewFeedbackController(
		service.NewFeedbackService(storage.FeedbackStorageNew(db, log)),
	)

	schemeStageController := grpc.NewSchemeStageController(
		service.NewSchemeStageService(storage.SchemeStageStorageNew(db, log)),
	)

	grpcApp := grpcapp.New(
		log,
		authController,
		grpc.NewAuthInterceptor(authService),
		journalController,
		workEntryController,
		feedbackController,
		schemeStageController,
		cfg.GRPC.Port,
	)

	return &App{
		GRPCServer: grpcApp,
	}
}
