# graphql-gateway
FROM golang:1.25-alpine AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /out/graphql-gateway ./cmd/server

FROM alpine:3.20
RUN apk add --no-cache ca-certificates
WORKDIR /app
COPY --from=build /out/graphql-gateway /app/graphql-gateway
EXPOSE 8080
ENTRYPOINT ["/app/graphql-gateway"]
