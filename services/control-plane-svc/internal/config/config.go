package config

import "os"

type Config struct {
	HTTPAddr    string
	DatabaseURL string
}

func Load() Config {
	return Config{
		HTTPAddr:    env("HTTP_ADDR", ":8081"),
		DatabaseURL: env("DATABASE_URL", "postgres://hookforge:hookforge@localhost:5432/hookforge?sslmode=disable"),
	}
}

func env(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
