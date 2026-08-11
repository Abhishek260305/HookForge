.PHONY: gql-gen web-dev web-build

gql-gen:
	cd apps/web && npm run gql:gen

web-dev:
	cd apps/web && npm run dev

web-build:
	cd apps/web && npm run build
