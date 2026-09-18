package app

import (
	"log/slog"

	"github.com/pressly/goose/v3"

	"dvgmu/tickets"
	grpcapp "dvgmu/tickets/internal/app/grpc"
	"dvgmu/tickets/internal/config"
	"dvgmu/tickets/internal/grpc"
	"dvgmu/tickets/internal/service"
	"dvgmu/tickets/internal/storage"
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
	goose.SetBaseFS(tickets.MigrationsFS)

	log.Info("running database migrations")
	if err := goose.Up(sqlDB, "db/migrations/ticket"); err != nil {
		log.Error("migration execution failed", "error", err.Error())
		panic(err)
	}
	log.Info("database migrations applied")

	dormitoryTicketStorage := storage.TicketDormitoryStorageNew(db, log)
	dormitoryTicketService := service.NewTicketDormitoryService(dormitoryTicketStorage)
	dormitoryTicketController := grpc.NewTicketDormitoryController(dormitoryTicketService)

	buildTicketStorage := storage.TicketBuildStorageNew(db, log)
	buildTicketService := service.NewTicketBuildService(buildTicketStorage)
	buildTicketController := grpc.NewTicketBuildController(buildTicketService)

	grpcApp := grpcapp.New(
		log,
		dormitoryTicketController,
		buildTicketController,
		cfg.GRPC.Port,
	)

	return &App{
		GRPCServer: grpcApp,
	}
}
