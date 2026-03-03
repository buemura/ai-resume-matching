.PHONY: install run dev migrate migrate-down migrate-create seed test lint format

# --- Dependencies ---
install:
	pip install ".[test]"

# --- Run ---
run:
	uvicorn app.main:app --host 0.0.0.0 --port 8000

dev:
	uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# --- Database Migrations ---
migrate:
	alembic upgrade head

migrate-down:
	alembic downgrade -1

migrate-create:
	@read -p "Migration message: " msg; alembic revision --autogenerate -m "$$msg"

seed:
	python -m app.seeds.jobs

# --- Testing ---
test:
	python -m pytest -v

# --- Linting & Formatting ---
lint:
	ruff check .

format:
	ruff format .
