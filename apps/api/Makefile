.DEFAULT_GOAL := help
FIXTURE ?= nepal_pre_1986

help:  ## show targets
	@grep -hE '^[a-z-]+:.*?## ' $(MAKEFILE_LIST) | awk -F':.*## ' '{printf "  %-12s %s\n", $$1, $$2}'

install:  ## sync dependencies
	uv sync

test:  ## run the engine test suite
	uv run pytest -q

lint:  ## ruff + the astrology_core boundary contracts
	uv run ruff check src tests scripts
	uv run lint-imports

chart:  ## print a fixture's chart for eyeball verification (FIXTURE=name)
	uv run python scripts/verify_chart.py --fixture $(FIXTURE)

migrate:  ## apply pending migrations to the configured database
	uv run alembic upgrade head

migration:  ## new hand-written migration (M="what it does") — autogenerate does not work here
	@test -n "$(M)" || (echo 'usage: make migration M="add x to y"'; exit 1)
	uv run alembic revision -m "$(M)"

contract:  ## regenerate the committed OpenAPI spec (both clients build from it)
	@uv run python scripts/export_openapi.py > ../../contracts/.openapi.json.tmp \
	  && mv ../../contracts/.openapi.json.tmp ../../contracts/openapi.json \
	  || (rm -f ../../contracts/.openapi.json.tmp; echo 'export failed — spec left unchanged'; exit 1)

contract-check:  ## CI: fail if the spec drifted from the code
	@$(MAKE) --no-print-directory contract
	@set -e; \
	if ! git -C ../.. rev-parse --is-inside-work-tree >/dev/null 2>&1; then \
	  echo "not a git repository — spec regenerated, nothing to diff against"; \
	elif ! git -C ../.. diff --exit-code -- contracts/openapi.json; then \
	  echo ""; \
	  echo "contracts/openapi.json is stale — run 'make contract' and commit it."; \
	  exit 1; \
	else \
	  echo "contract is current"; \
	fi

serve:  ## run the API locally
	uv run uvicorn app.main:app --reload --port 8000

.PHONY: help install test lint chart contract contract-check serve
