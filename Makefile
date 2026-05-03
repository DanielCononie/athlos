# App name
APP_NAME=fitness-api

# Go files entry point
CMD=cmd/api/main.go
SERVER_DIR=server
MOBILE_DIR=mobile

# Default target
.DEFAULT_GOAL := help

## ----------- Commands -----------

.PHONY: help
help:
	@echo "Available commands:"
	@echo "  make install      Install server and mobile dependencies"
	@echo "  make dev          Run the server and Expo client together"
	@echo "  make dev-server   Run the API server locally on port 3000"
	@echo "  make dev-client   Run the Expo client"
	@echo "  make dev-web      Run the Expo client for web"
	@echo "  make db-start     Start the local Postgres container"
	@echo "  make db-stop      Stop the local Postgres container"
	@echo "  make build        Build the server binary"
	@echo "  make run          Run the built server binary"
	@echo "  make clean        Remove build artifacts"
	@echo "  make fmt          Format server code"
	@echo "  make tidy         Clean server go.mod"

.PHONY: install
install:
	cd $(SERVER_DIR) && go mod tidy
	cd $(MOBILE_DIR) && npm install

.PHONY: dev
dev:
	@echo "Starting API server and Expo client..."
	@(cd $(SERVER_DIR) && go run $(CMD)) & \
	server_pid=$$!; \
	(cd $(MOBILE_DIR) && npm run start) & \
	client_pid=$$!; \
	trap 'kill $$server_pid $$client_pid 2>/dev/null' INT TERM EXIT; \
	wait

.PHONY: dev-server
dev-server:
	cd $(SERVER_DIR) && go run $(CMD)

.PHONY: dev-client
dev-client:
	cd $(MOBILE_DIR) && npm run start

.PHONY: dev-web
dev-web:
	cd $(MOBILE_DIR) && npm run web

.PHONY: db-start
db-start:
	docker start fitness-postgres

.PHONY: db-stop
db-stop:
	docker stop fitness-postgres

.PHONY: build
build:
	cd $(SERVER_DIR) && go build -o ../bin/$(APP_NAME) $(CMD)

.PHONY: run
run:
	./bin/$(APP_NAME)

.PHONY: clean
clean:
	rm -rf bin

.PHONY: fmt
fmt:
	cd $(SERVER_DIR) && go fmt ./...

.PHONY: tidy
tidy:
	cd $(SERVER_DIR) && go mod tidy
