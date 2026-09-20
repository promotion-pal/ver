package main

import (
	"log/slog"
	"os"
	"os/signal"
	"syscall"

	"dvgmu/ver/internal/app"
	"dvgmu/ver/internal/config"

	"github.com/joho/godotenv"
)

var Version = "dev"

func main() {
	_ = godotenv.Load(".env")

	cfg := config.MustLoad()

	log := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelDebug,
	}))
	log.Info("starting dvgmu-ver", "version", Version)

	application := app.New(log, cfg)

	go func() {
		application.GRPCServer.MustRun()
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGTERM, syscall.SIGINT)

	<-stop

	application.GRPCServer.Stop()
	log.Info("Server gracefully stopped")
}
