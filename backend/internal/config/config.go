package config

import (
	"log/slog"
	"os"
	"strings"
	"github.com/joho/godotenv"
)

type Config struct {
	PGConnString    string
	ServerPort      string
	EnableTerminate bool
	EnableCancel    bool
	ProtectedUsers  map[string]bool
}

func LoadConfig() *Config {
	err := godotenv.Load()
	if err != nil {
		slog.Warn("No .env file found, using system environment variables")
	}

	protected := make(map[string]bool)
	users := strings.Split(getEnv("PROTECTED_USERS", "postgres,dbadmin,pgdoctor"), ",")
	for _, u := range users {
		protected[strings.TrimSpace(u)] = true
	}

	return &Config{
		PGConnString:    buildPGString(),
		ServerPort:      getEnv("SERVER_PORT", "8080"),
		EnableTerminate: getEnv("ENABLE_TERMINATE", "false") == "true",
		EnableCancel:    getEnv("ENABLE_CANCEL", "true") == "true",
		ProtectedUsers:  protected,
	}
}

func buildPGString() string {
	return "host=" + getEnv("PG_HOST", "localhost") +
		" port=" + getEnv("PG_PORT", "5432") +
		" user=" + getEnv("PG_USER", "postgres") +
		" password=" + getEnv("PG_PASSWORD", "postgres") +
		" dbname=" + getEnv("PG_DATABASE", "postgres") +
		" sslmode=" + getEnv("PG_SSLMODE", "disable")
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}
