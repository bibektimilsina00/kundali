# Roadmap

Spec §88: make the astrology accurate → make the AI understand it → make
talking to it feel good → make daily use worth returning for → humans → pandits.

The build order below follows that. The **cut list** matters as much as the
build list.

---

## First: which client ships first?

Two clients does not mean two parallel tracks. Building web and mobile
simultaneously roughly doubles Phases 1–4, and neither ships.

**Recommendation: mobile first.** The evidence is in the product spec itself —
§75's home screen mockup is a phone, §52's navigation is a bottom tab bar, §10's
voice input assumes a device microphone, and §46's retention loop is a push
notification. The launch market (Nepal, North India) is mobile-first by a wide
margin. The web app is the secondary surface here, not the primary one.

That gives three viable orderings:

| Order | Cost | Fits when |
|---|---|---|
| **Mobile → web** (recommended) | One client through Phases 1–4, then port | The product is a phone app, which the spec says it is |
| Web → mobile | Same, but you validate on the weaker surface | You need a demo link more than you need users |
| Both in parallel | ~2× calendar time to first release | You have two client teams already |

If mobile leads, the web app in v1 can be marketing pages plus a read-only
"view your chart" — a week of work rather than a phase.

The phases below name the client where it matters. Substitute if you pick a
different order; nothing else in this roadmap changes.

---

## Phase 0 — Prove the engine

Nothing user-facing. The riskiest part of the product is the part with no UI.

- `astrology_core`: chart, nakshatra, dignity, aspects, dasha
- 20–30 golden-chart fixtures verified against an independent implementation
- `scripts/verify_chart.py` for eyeball diffs
- Historical timezone handling proven with pre-1986 Nepal and pre-1955 India births

**Done when:** `uv run pytest` is green. `test_phase0_complete` fails until every
fixture carries a `verified_against` value, so the gate is executable rather
than a note in a document.

Do not start the API until this holds. A beautiful app on a wrong chart is
worse than no app.

---

## Phase 1 — Chart in, chart out

- ~~`POST /v1/kundali` — birth details in, full chart out~~ **done**
- ~~`contracts/openapi.json` committed, deterministic, `make contract-check`~~ **done**
- ~~Shared error envelope + IANA zone validation at the boundary~~ **done**
- Auth (Google + phone OTP; skip email/password until someone asks)
- Persistence: `birth_profile` + cached `chart`, so `GET /v1/kundali` can exist
  (it needs auth to know whose chart, which is why it follows auth, not precedes it)
- Onboarding: name, date, time, time-accuracy, place → geocode → chart
- `GET /v1/kundali` and chart detail endpoints
- Yogas + doshas from the MVP set
- Client: onboarding flow, North Indian chart render, planet list, house list

**Done when:** a user can enter their birth details and read their own chart.

The North Indian chart is a custom-painted diamond grid on both platforms
(`CustomPainter` on Flutter, SVG on web). It is the only genuinely duplicated
UI work in the project — the data is shared, the drawing is not, and no
cross-platform sharing scheme is worth it for one widget.

---

## Phase 2 — The AI astrologer

This is the product. Everything before it was foundation.

- Claude Opus 5 with the five chart tools
- Chart snapshot + prompt caching
- Streaming end to end. On Flutter this is the single hardest piece of client
  work in the project: Dart has no `EventSource`, so the SSE frames are parsed
  by hand off a streamed dio response. Budget real time for it, and read
  [`mobile.md`](mobile.md) §8 before starting.
- `chart_factors` tail → the **"Why?"** expansion
- Safety pre-check on trigger topics
- Conversations + message persistence + history UI
- The magic moment (spec §82): an immediate personalised overview right after
  chart generation, before the user asks anything

**Done when:** you ask it a real question about your own chart and the answer
is specific enough that it could not have been written about anyone else.

---

## Phase 3 — Daily loop

- Personalised daily horoscope, generated lazily on first read, cached per day
- "Ask AI about today" → seeds a conversation from the horoscope
- Dasha timeline UI with the "you are here" marker
- Saved insights

**Done when:** you'd open the app on a day you weren't testing it.

Push notifications belong here, and they are the thing that finally forces a
background worker: a 6am "your horoscope is ready" push cannot carry text that
is generated lazily on first read. Generate inside the push-send job — the
fan-out already exists there — rather than adding a separate scheduler. See
[`architecture.md`](architecture.md) §6.

---

## Phase 4 — Voice

- STT for questions, TTS for answers
- Audio horoscope with player controls
- Both behind `integrations/` Protocols so the vendor is one file

Ship it when it's good. Do not let it block phases 1–3 (spec §69).

---

## Phase 5+ — After validation

Subscriptions and payments · notifications (dasha change, major transit) ·
Nepali and Hindi · shareable readings · compatibility matching · human
astrologers · pandit marketplace.

Each of these needs the AI astrologer to already be good. Spec §70: build the
AI experience first, and make it so useful people return without ever intending
to pay for a human consultation.

---

## Not building yet — and what unblocks each

| | Why not | Build when |
|---|---|---|
| Job queue (Celery/arq) | Nothing runs in the background. Horoscopes generate lazily. | A push notification must carry horoscope text, or report generation exceeds request time |
| Monorepo packages (`packages/*`) | One frontend consumer | A second TS consumer exists |
| Separate `astrology-core` Python package | Import-linter enforces the same boundary for free | A second Python consumer, or you open-source the engine |
| Multiple astrology systems (Western, KP) | Dilutes the MVP (spec §55) | Never, probably |
| Astrologer / pandit marketplace | Requires verification, booking, payments, escrow, disputes, moderation — a second product | The AI product has retention |
| Video consultation | See above, plus WebRTC | Same |
| Education library | Secondary to personalisation (spec §49) | The AI already answers "what is a dasha?" well |
| Admin panel | Use `psql` and a Django-admin-shaped tool later | Support load justifies it |
| Flutter `freezed` / `injectable` / `dartz` | Sealed classes and 30 lines of `get_it` cover it without a codegen step | Registration exceeds ~100 lines, or you need deep `copyWith` |
| Cross-platform UI sharing (Flutter web) | One codebase for two very different surfaces produces an app that feels wrong on both, and Flutter web's text rendering and SEO are poor for a marketing site | Never, for this product |
| Offline write queue on mobile | Only the chart needs offline reads, and it is immutable | Users report losing messages |
| Kubernetes | One Postgres, one Redis, one API, one web. Compose is enough. | You have a scaling problem, not before |
| PDF report generation | One-time purchase idea, not a core loop | Someone offers money for it |

---

## Things to decide before they become expensive

- **pyswisseph licensing.** AGPL or a commercial Swiss Ephemeris licence.
  Decide before launch, not after.
- **Where the DB lives.** Birth data is sensitive personal data; jurisdiction
  affects your privacy policy (spec §39).
- **Free-tier limit.** Pick a daily AI question cap in Phase 2 and instrument
  token usage per user from the first day, so Phase 5 pricing is based on
  measurement rather than a guess.
- **Minimum supported app version.** Decide the policy before the first
  release, not after: how long an old build keeps working, and how you force an
  upgrade when you must. A `min_supported_version` field in a startup config
  endpoint costs nothing now and is very hard to add later.
- **Ayanamsa configurability.** If it ever becomes per-user, every cached chart
  invalidates. Cheaper to decide now that it won't.
