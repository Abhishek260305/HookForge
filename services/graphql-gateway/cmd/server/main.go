package main

import (
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/lru"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/Abhishek260305/HookForge/services/graphql-gateway/graph"
	"github.com/Abhishek260305/HookForge/services/graphql-gateway/internal/controlplane"
	"github.com/vektah/gqlparser/v2/ast"
)

func main() {
	addr := env("HTTP_ADDR", ":8080")
	controlPlaneURL := env("CONTROL_PLANE_URL", "http://localhost:8081")
	corsOrigins := env("CORS_ORIGINS", "http://localhost:3000")

	resolver := &graph.Resolver{
		ControlPlane: controlplane.NewClient(controlPlaneURL),
	}

	srv := handler.New(graph.NewExecutableSchema(graph.Config{Resolvers: resolver}))
	srv.AddTransport(transport.Options{})
	srv.AddTransport(transport.GET{})
	srv.AddTransport(transport.POST{})
	srv.SetQueryCache(lru.New[*ast.QueryDocument](1000))
	srv.Use(extension.Introspection{})
	srv.Use(extension.AutomaticPersistedQuery{
		Cache: lru.New[string](100),
	})

	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"service":"graphql-gateway","status":"ok"}`))
	})
	mux.Handle("/graphql", srv)
	mux.Handle("/", playground.Handler("Hookforge GraphQL", "/graphql"))

	handlerWithCORS := withCORS(mux, strings.Split(corsOrigins, ","))

	log.Printf("graphql-gateway listening on %s (control-plane=%s)", addr, controlPlaneURL)
	log.Fatal(http.ListenAndServe(addr, handlerWithCORS))
}

func env(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func withCORS(next http.Handler, origins []string) http.Handler {
	allowed := map[string]struct{}{}
	for _, o := range origins {
		o = strings.TrimSpace(o)
		if o != "" {
			allowed[o] = struct{}{}
		}
	}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if _, ok := allowed[origin]; ok {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		}
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}
