APP_DIR := api
BINARY_NAME := tickets
GO := go
MAIN_PATH := ./cmd
CONFIG_PATH := --config=config/local.yaml
PROTO_DIR := contract
VERSION := $(shell cat ../../.version 2>/dev/null || echo "0.0.0")
LDFLAGS := -X 'main.Version=$(VERSION)'

GREEN  := $(shell tput setaf 2)
BLUE   := $(shell tput setaf 4)
RED    := $(shell tput setaf 1)
YELLOW := $(shell tput setaf 3)
CYAN   := $(shell tput setaf 6)
MAGENTA:= $(shell tput setaf 5)
NC     := $(shell tput sgr0)

.DEFAULT_GOAL := menu

.PHONY: menu deps build run test lint proto grpcui clean dev up down logs stack stack-down stack-logs

menu:
	@clear
	@echo "${BLUE}                 🎫  DVGMU TICKETS SERVICE${NC}"
	@echo ""
	@echo "${GREEN}  1. 🚀  Run server${NC}"
	@echo "${CYAN}  2. 🔨  Build project${NC}"
	@echo "${YELLOW}  3. 📦  Install dependencies${NC}"
	@echo "${MAGENTA}  4. 🧪  Run tests${NC}"
	@echo "${GREEN}  5. 🔍  Lint code${NC}"
	@echo "${CYAN}  6. 📝  Generate protobuf${NC}"
	@echo "${YELLOW}  7. 🔍  Run gRPC UI${NC}"
	@echo "${GREEN}  8. 🐳  Start dev dependencies (docker compose)${NC}"
	@echo "${RED}  9. 🐳  Stop dev dependencies (docker compose)${NC}"
	@echo "${RED}  0. ❌  Exit${NC}"
	@echo ""
	@printf "${YELLOW}👉  Select option (0-10): ${NC}"
	@read choice; \
	case $$choice in \
		1) clear && make run ;; \
		2) clear && make build ;; \
		3) clear && make deps ;; \
		4) clear && make test ;; \
		5) clear && make lint ;; \
		6) clear && make proto ;; \
		7) clear && make grpcui ;; \
		8) clear && make up ;; \
		9) clear && make down ;; \
		0) clear && echo "${RED}👋  Goodbye!${NC}" && exit 0 ;; \
		*) clear && echo "${RED}❌  Invalid choice!${NC}" && sleep 1 && make menu ;; \
	esac

deps:
	@echo "${YELLOW}📦  Installing dependencies...${NC}"
	cd $(APP_DIR) && $(GO) mod download && $(GO) mod tidy
	@echo "${GREEN}✅  Done!${NC}"
	@sleep 1 && make menu

build:
	@echo "${CYAN}🔨  Building project (v$(VERSION))...${NC}"
	cd $(APP_DIR) && $(GO) build -ldflags "$(LDFLAGS)" -o $(BINARY_NAME) $(MAIN_PATH)
	@echo "${GREEN}✅  Done!${NC}"
	@sleep 1 && make menu

run:
	@echo "${GREEN}🚀  Starting server...${NC}"
	cd $(APP_DIR) && $(GO) run $(MAIN_PATH) $(CONFIG_PATH)

test:
	@echo "${MAGENTA}🧪  Running tests...${NC}"
	cd $(APP_DIR) && $(GO) test -v ./...
	@echo "${GREEN}✅  Done!${NC}"
	@sleep 2 && make menu

lint:
	@echo "${GREEN}🔍  Linting code...${NC}"
	@if command -v golangci-lint >/dev/null 2>&1; then \
		cd $(APP_DIR) && golangci-lint run ./...; \
	else \
		echo "${YELLOW}⚠️  Installing golangci-lint...${NC}"; \
		$(GO) install github.com/golangci/golangci-lint/cmd/golangci-lint@latest; \
		cd $(APP_DIR) && golangci-lint run ./...; \
	fi
	@echo "${GREEN}✅  Done!${NC}"
	@sleep 1 && make menu

proto:
	@echo "${CYAN}📝  Generating protobuf with Buf...${NC}"
	cd $(APP_DIR)/$(PROTO_DIR) && buf generate
	@echo "${GREEN}✅  Done!${NC}"
	@sleep 1 && make menu

grpcui:
	@echo "${YELLOW}🔍  Starting gRPC UI...${NC}"
	grpcui -plaintext 127.0.0.1:4000

clean:
	@echo "${RED}🧹  Cleaning files...${NC}"
	rm -rf $(APP_DIR)/$(BINARY_NAME)
	rm -rf $(APP_DIR)/coverage.out $(APP_DIR)/coverage.html
	@echo "${GREEN}✅  Done!${NC}"
	@sleep 1 && make menu

dev:
	@echo "${MAGENTA}🔄  Starting with hot-reload...${NC}"
	@if command -v air >/dev/null 2>&1; then \
		cd $(APP_DIR) && air; \
	else \
		echo "${YELLOW}⚠️  Installing air...${NC}"; \
		$(GO) install github.com/cosmtrek/air@latest; \
		cd $(APP_DIR) && air; \
	fi

up:
	@echo "${GREEN}🐳  Starting dev dependencies...${NC}"
	docker compose -f docker-compose.dev.yml up -d
	@echo "${GREEN}✅  Done!${NC}"
	@sleep 1 && make menu

down:
	@echo "${RED}🐳  Stopping dev dependencies...${NC}"
	docker compose -f docker-compose.dev.yml down
	@echo "${GREEN}✅  Done!${NC}"
	@sleep 1 && make menu

logs:
	docker compose -f docker-compose.dev.yml logs -f

stack:
	@echo "${GREEN}🐳  Starting full stack (API + DB) in Docker...${NC}"
	@docker network inspect traefik-network >/dev/null 2>&1 || docker network create traefik-network
	docker compose -f docker-compose.yml up -d --build
	@echo "${GREEN}✅  API: http://dvgmu_apps_ticket_api:4000 (внутри traefik-network)${NC}"
	@sleep 1 && make menu

stack-down:
	@echo "${RED}🐳  Stopping full stack...${NC}"
	docker compose -f docker-compose.yml down
	@echo "${GREEN}✅  Done!${NC}"
	@sleep 1 && make menu

stack-logs:
	docker compose -f docker-compose.yml logs -f
