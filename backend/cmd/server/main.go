
package main

import (
	"context"
	"embed"
	"io/fs"
	"log/slog"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"

	"pgdoctor/internal/api"
	"pgdoctor/internal/config"
	"pgdoctor/internal/db"
	customMiddleware "pgdoctor/internal/middleware"
	"pgdoctor/internal/repository"
	"pgdoctor/internal/service"
	"pgdoctor/internal/worker"
)

//go:embed all:dist
var frontendFS embed.FS

func main() {
	// Initialize logger
	logger := slog.New(slog.NewTextHandler(os.Stdout, nil))
	slog.SetDefault(logger)

	// 1. Load configuration and connect to database
	cfg := config.LoadConfig()
	ctx := context.Background()
	pool, err := db.NewPool(ctx, cfg.PGConnString)
	if err != nil {
		slog.Error("Database connection failed", "error", err)
		os.Exit(1)
	}
	defer pool.Close()

	// 2. Start background ASH worker
	worker.StartAshWorker(pool)

	// 3. Initialize Repositories (Data access layer)
	sessionRepo := &repository.SessionRepo{Pool: pool}
	dbRepo := &repository.DatabaseRepo{Pool: pool}
	ashRepo := &repository.AshRepo{Pool: pool}
	bloatRepo := &repository.BloatRepo{Pool: pool}
	historyRepo := &repository.HistoryRepo{Pool: pool}
	queryRepo := &repository.QueryRepo{Pool: pool}

	// 4. Initialize Services (Business logic & security layer)
	sessionService := &service.SessionService{Repo: sessionRepo, Config: cfg}
	dbService := &service.DatabaseService{Repo: dbRepo}
	ashService := &service.AshService{Repo: ashRepo}
	bloatService := &service.BloatService{Repo: bloatRepo}
	historyService := &service.HistoryService{Repo: historyRepo}
	queryService := &service.QueryService{Repo: queryRepo}

	// 5. Initialize Handlers (API controllers)
	sessionHandler := &api.SessionHandler{Service: sessionService}
	dbHandler := &api.DatabaseHandler{Service: dbService}
	ashHandler := &api.AshHandler{Service: ashService}
	bloatHandler := &api.BloatHandler{Service: bloatService}
	historyHandler := &api.HistoryHandler{Service: historyService}
	queryHandler := &api.QueryHandler{Service: queryService}
	systemHandler := &api.SystemHandler{}

	// 6. Setup Router and Middlewares
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(customMiddleware.CORS)

	// 7. Define API Routes
	r.Route("/api", func(r chi.Router) {
		// Public/Read-only routes
		r.Get("/sessions", sessionHandler.GetSessions)
		r.Get("/history", historyHandler.GetAshHistory)
		r.Get("/databases", dbHandler.GetDatabases)
		r.Get("/ash/waits", ashHandler.GetTopWaits)
		r.Get("/ash/queries", ashHandler.GetTopQueries)
		r.Get("/bloat", bloatHandler.GetBloatStats)
		r.Get("/system/metrics", systemHandler.GetSystemMetrics)
		r.Get("/queries/slow", queryHandler.GetSlowQueries)

		// Protected/Destructive routes
		r.Group(func(protected chi.Router) {
			protected.Post("/sessions/{pid}/cancel", sessionHandler.CancelSession)
			protected.Post("/sessions/{pid}/terminate", sessionHandler.TerminateSession)
		})
	})

	// 8. Serve Frontend
	publicFS, err := fs.Sub(frontendFS, "dist")
	if err != nil {
		slog.Error("Frontend static fayllarni yuklashda xatolik", "error", err)
	}
	r.Handle("/*", http.FileServer(http.FS(publicFS)))

	// 9. Start HTTP Server
	slog.Info("Starting pgdoctor Console", "port", cfg.ServerPort)
	if err := http.ListenAndServe(":"+cfg.ServerPort, r); err != nil {
		slog.Error("Server start failed", "error", err)
		os.Exit(1)
	}
}
