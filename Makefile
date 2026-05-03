# App name
APP_NAME=fitness-api

# Go files entry point
CMD=cmd/api/main.go

# Default target
.DEFAULT_GOAL := help

## ----------- Commands -----------

.PHONY: help
help:
	@echo "Available commands:"
	@echo "  make install     Install dependencies"
	@echo "  make dev         Run the app locally"
	@echo "  make build       Build the binary"
	@echo "  make run         Run built binary"
	@echo "  make clean       Remove build artifacts"
	@echo "  make fmt         Format code"
	@echo "  make tidy        Clean go.mod"

.PHONY: install
install:
	cd server && go mod tidy

.PHONY: dev
dev:
	cd server && go run $(CMD)

.PHONY: build
build:
	cd server && go build -o ../bin/$(APP_NAME) cmd/api/main.go

.PHONY: run
run:
	./bin/$(APP_NAME)

.PHONY: clean
clean:
	rm -rf bin

.PHONY: fmt
fmt:
	go fmt ./...

.PHONY: tidy
tidy:
	go mod tidy