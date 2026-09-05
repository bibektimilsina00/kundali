# Multi-stage Dockerfile for Sidereal Ephemeris Python Engine + Next.js App
FROM python:3.12-slim AS base

# Install Node.js 20, npm, and compiler tools for pyswisseph C bindings
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    gnupg \
    build-essential \
    python3-dev \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python requirements for astrology ephemeris engine
COPY apps/api/pyproject.toml apps/api/
RUN pip install --no-cache-dir pyswisseph tzdata pydantic pydantic-settings fastapi uvicorn

# Copy whole repository code
COPY . .

# Install dependencies and build Next.js Web App
RUN npm --prefix apps/web ci || npm --prefix apps/web install
RUN npm --prefix apps/web run build

# Expose Next.js port
EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production
ENV PYTHON_PATH=python3

# Run Next.js production server
CMD ["npm", "--prefix", "apps/web", "start"]
