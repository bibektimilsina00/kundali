.DEFAULT_GOAL := help
FLUTTER ?= flutter

help:  ## show targets
	@grep -hE '^[a-z-]+:.*?## ' $(MAKEFILE_LIST) | awk -F':.*## ' '{printf "  %-12s %s\n", $$1, $$2}'

install:  ## fetch packages
	$(FLUTTER) pub get

test:  ## unit + widget tests
	$(FLUTTER) test

lint:  ## analyzer + the clean-architecture layer contracts
	$(FLUTTER) analyze
	dart run tool/check_layers.dart

run:  ## run against a local API
	$(FLUTTER) run --dart-define=API_BASE_URL=http://localhost:8000

generate-api:  ## regenerate DTOs from the committed OpenAPI spec (Phase 1)
	@echo "Not wired yet — contracts/openapi.json does not exist until the API has routes."
	@echo "See docs/architecture.md section 7."

.PHONY: help install test lint run generate-api
