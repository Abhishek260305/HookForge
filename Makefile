.PHONY: gql-gen web-dev web-build be-up be-down be-logs be-infra migrate gateway control-plane

gql-gen:
	cd apps/web && npm run gql:gen

web-dev:
	cd apps/web && npm run dev

web-build:
	cd apps/web && npm run build

be-infra:
	docker compose -f deploy/compose/docker-compose.yml up -d postgres redis

be-up:
	docker compose -f deploy/compose/docker-compose.yml up --build -d

be-down:
	docker compose -f deploy/compose/docker-compose.yml down

be-logs:
	docker compose -f deploy/compose/docker-compose.yml logs -f

migrate:
	goose -dir migrations postgres "$${DATABASE_URL:-postgres://hookforge:hookforge@localhost:5432/hookforge?sslmode=disable}" up

gateway:
	cd services/graphql-gateway && go run ./cmd/server

control-plane:
	cd services/control-plane-svc && go run ./cmd/server
