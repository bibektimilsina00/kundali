# Nakhatra

AI-powered Vedic astrology platform. A personal AI astrologer that already
knows your birth chart.

> **Your chart. Your questions. Your answers.**

## Docs

| | |
|---|---|
| [`nakhatra.md`](nakhatra.md) | Product & feature specification |
| [`docs/architecture.md`](docs/architecture.md) | Repo layout, module shape, boundaries, data model |
| [`docs/astrology-methodology.md`](docs/astrology-methodology.md) | Ayanamsa, house system, dasha rules, test strategy |
| [`docs/ai-astrologer.md`](docs/ai-astrologer.md) | Model, context, tools, prompts, safety, streaming |
| [`docs/design.md`](docs/design.md) | Colour, type, spacing, components — the visual system for every client |
| [`docs/mobile.md`](docs/mobile.md) | Flutter clean architecture, BLoC conventions, SSE on Dart |
| [`docs/roadmap.md`](docs/roadmap.md) | Build order and the deliberate cut list |
| [`CLAUDE.md`](CLAUDE.md) | Working rules for agents and contributors |

## The core idea

```
Deterministic astrology  →  structured data  →  AI interpretation  →  user
    (astrology_core)                              (ai_astrologer)
```

The astrology engine is pure, offline, and regression-tested against golden
charts. The AI never computes — it explains. Everything else follows from
keeping that line intact.

## Stack

Backend: Python 3.12 · uv · FastAPI · SQLModel · Alembic · Postgres · Redis · pyswisseph
Web: Next.js (App Router) · TypeScript · TanStack Query · Zustand · Zod · Tailwind
Mobile: Flutter · BLoC · get_it · dio · drift
AI: Claude Opus 5 with tool use + streaming

One backend, two clients. Both generate their API types from the committed
OpenAPI spec in `contracts/` — see [architecture §7](docs/architecture.md).

## Getting started

```bash
make dev      # postgres, redis, api, web
make test
```

Start with [`docs/roadmap.md`](docs/roadmap.md) — Phase 0 is the astrology
engine, and nothing else should be built until its golden charts pass.
