FROM python:3.12-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY apps/api/pyproject.toml ./
RUN pip install --no-cache-dir pyswisseph tzdata pydantic pydantic-settings fastapi "uvicorn[standard]" psycopg2-binary asyncpg

COPY apps/api/ ./

EXPOSE 8000

ENV PYTHONPATH=/app/src
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
