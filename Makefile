SHELL := /bin/bash
MYSQL := $(shell which mysql 2>/dev/null || echo /usr/local/mysql/bin/mysql)

.PHONY: help install setup secret db-reset db-schema db-seed db-setup db-check start dev clean

ENV_FILE := .env

include $(ENV_FILE)
export

help:
	@echo "Sports Social API Makefile"
	@echo ""
	@echo "Available commands:"
	@echo "  make install    Install Node dependencies"
	@echo "  make secret     Replace _SECRET_ in .env with a generated JWT secret"
	@echo "  make db-reset   Drop and recreate the database"
	@echo "  make db-schema  Create all database tables"
	@echo "  make db-seed    Insert starter data"
	@echo "  make db-setup   Run reset + schema + seed"
	@echo "  make setup      Install dependencies, generate secret, and setup DB"
	@echo "  make db-check   Show database tables"
	@echo "  make start      Start the server"
	@echo "  make dev        Start the server with nodemon"
	@echo "  make clean      Remove node_modules"

install:
	npm install

secret:
	@if [ ! -f "$(ENV_FILE)" ]; then \
		echo "Error: $(ENV_FILE) not found. Create it first, or run: cp .env.example .env"; \
		exit 1; \
	fi
	@if grep -q "_SECRET_\|replace_this_with_a_long_random_secret" "$(ENV_FILE)"; then \
		SECRET=$$(node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"); \
		SECRET="$$SECRET" python3 -c "from pathlib import Path; import os; p=Path('.env'); text=p.read_text(); text=text.replace('_SECRET_', os.environ['SECRET']).replace('replace_this_with_a_long_random_secret', os.environ['SECRET']); p.write_text(text)"; \
		echo "SESSION_SECRET generated and written to $(ENV_FILE)."; \
	else \
		echo "No placeholder secret found in $(ENV_FILE). Nothing changed."; \
	fi

db-reset:
	@if [ ! -f "$(ENV_FILE)" ]; then echo "Error: $(ENV_FILE) not found."; exit 1; fi
	@set -a; source "$(ENV_FILE)"; set +a; \
	if [ -n "$$DB_PASSWORD" ]; then \
		$(MYSQL) -h "$${DB_HOST:-localhost}" -u "$${DB_USER:-root}" -p"$$DB_PASSWORD" < database/reset.sql; \
	else \
		$(MYSQL) -h "$${DB_HOST:-localhost}" -u "$${DB_USER:-root}" < database/reset.sql; \
	fi
	@echo "Databse successfully reset."

db-schema:
	@if [ ! -f "$(ENV_FILE)" ]; then echo "Error: $(ENV_FILE) not found."; exit 1; fi
	@set -a; source "$(ENV_FILE)"; set +a; \
	if [ -n "$$DB_PASSWORD" ]; then \
		$(MYSQL) -h "$${DB_HOST:-localhost}" -u "$${DB_USER:-root}" -p"$$DB_PASSWORD" < database/schema.sql; \
	else \
		$(MYSQL) -h "$${DB_HOST:-localhost}" -u "$${DB_USER:-root}" < database/schema.sql; \
	fi
	@echo "Databse successfully built."

db-seed:
	@if [ ! -f "$(ENV_FILE)" ]; then echo "Error: $(ENV_FILE) not found."; exit 1; fi
	@set -a; source "$(ENV_FILE)"; set +a; \
	if [ -n "$$DB_PASSWORD" ]; then \
		$(MYSQL) -h "$${DB_HOST:-localhost}" -u "$${DB_USER:-root}" -p"$$DB_PASSWORD" < database/seed.sql; \
	else \
		$(MYSQL) -h "$${DB_HOST:-localhost}" -u "$${DB_USER:-root}" < database/seed.sql; \
	fi
	@echo "Databse successfully populated."

db-setup: db-reset db-schema db-seed
	@echo "Database setup complete."

setup: install secret db-setup
	@echo "Project setup complete. Run: make start"

db-check:
	@if [ ! -f "$(ENV_FILE)" ]; then echo "Error: $(ENV_FILE) not found."; exit 1; fi
	@set -a; source "$(ENV_FILE)"; set +a; \
	if [ -n "$$DB_PASSWORD" ]; then \
		$(MYSQL) -h "$${DB_HOST:-localhost}" -u "$${DB_USER:-root}" -p"$$DB_PASSWORD" -e "USE $${DB_NAME:-sports_social_db}; SHOW TABLES;"; \
	else \
		$(MYSQL) -h "$${DB_HOST:-localhost}" -u "$${DB_USER:-root}" -e "USE $${DB_NAME:-sports_social_db}; SHOW TABLES;"; \
	fi

start: secret
	npm start

dev: secret
	npm run dev

clean:
	rm -rf node_modules package-lock.json
