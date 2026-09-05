# AI Astrologer

How `modules/ai_astrologer` works. The product requirements are spec
§9–14, §31, §57–62; this is the implementation contract.

---

## Model

`claude-opus-5` (Claude Opus 5) — 1M context, 128K max output.

**Served through AgentRouter**, which is Anthropic-wire-compatible. That means
the official `anthropic` SDK, unchanged, with one override:

```python
# integrations/llm.py — the only place a client is constructed
from anthropic import AsyncAnthropic

client = AsyncAnthropic(
    base_url=settings.LLM_BASE_URL,   # https://agentrouter.org/v1
    api_key=settings.LLM_API_KEY,     # AgentRouter key
)
```

Model IDs are bare (`claude-opus-5`), same as first-party. Switching to
Anthropic directly later is a `.env` change, not a code change — drop
`LLM_BASE_URL` and swap the key.

Declare both in `core/config.py` as required settings and pass them
explicitly. Do **not** rely on the SDK picking up `ANTHROPIC_BASE_URL` from the
environment: if that var is missing you silently hit api.anthropic.com with an
AgentRouter key and get a 401 that reads like a bad key rather than a bad
config.

### Settings

```python
model="claude-opus-5"
thinking={"type": "adaptive"}          # on by default on Opus 5; explicit for clarity
output_config={"effort": "medium"}     # sweep low/medium/high on real questions
```

### Model gotchas (Opus 5)

- Thinking is **on by default**. `max_tokens` caps thinking + text together —
  size it with headroom or answers truncate mid-sentence.
- Do **not** pair `thinking: {"type": "disabled"}` with effort `xhigh`/`max` —
  that's a 400. Disabling thinking on Opus 5 can also emit tool calls as plain
  text that silently never run. Leave thinking on; use low/medium effort to
  control cost.
- `temperature` / `top_p` / `top_k` are **rejected**. Steer with prompting.
- Assistant prefill is **rejected**. Use `output_config.format` if you ever need
  forced JSON.
- Handle `stop_reason == "refusal"` before reading `content` — safety
  classifiers can decline, and `content` will be empty.

### Proxy gotchas — verify these on day one

A gateway forwards the request; it does not guarantee every parameter survives.
Three that this design depends on, in order of how much they cost you if
they're silently dropped:

| Feature | Why it matters here | How to verify |
|---|---|---|
| **Prompt caching** (`cache_control`) | The whole cost model. ~2K stable prefix per turn at 10% instead of 100%. | `response.usage.cache_read_input_tokens > 0` on the second turn of a conversation |
| **Tool use** | The five chart tools. Without it the AI has no way to look past the snapshot. | A question that needs a house lookup produces a `tool_use` block |
| **Streaming** | The entire chat UX. | Deltas arrive incrementally, not as one chunk at the end |

Write these as three integration tests hitting the real router, marked
`@pytest.mark.live`, and run them once before building on top. If caching
doesn't survive the proxy, that's not a bug to work around — it's a pricing
decision to make with real numbers.

Two things that are **first-party Anthropic API only** and won't be available
through a router: server-side `fallbacks` for refusals, and fast mode. Neither
is load-bearing. Handle `stop_reason == "refusal"` by returning a graceful
message rather than by falling back to another model.

### Cheap route

Conversation title generation and language detection go to
`claude-haiku-4-5` (`settings.LLM_MODEL_CHEAP`). Everything user-facing stays
on Opus 5.

Everything goes behind `integrations/llm.py` with a `Protocol`, so the vendor —
and the router in front of it — is one file. That is the whole abstraction: no
factory, no registry, no plugin system.

---

## Context pipeline

Every AI turn assembles the same four layers, in this order. Order is load-bearing
for prompt caching: stable content first, volatile content last.

```
1. system prompt          static      ─┐
2. tool definitions       static       ├─ cache_control breakpoint here
3. chart snapshot         per user    ─┘
4. conversation history   per turn
5. user question          per turn
```

Put the `cache_control: {"type": "ephemeral"}` breakpoint on the **chart
snapshot** — it's the last block that's identical across every turn of a
conversation. Everything above it (system prompt + tools) caches with it.

Cache-killers to avoid: never interpolate `datetime.now()`, a request ID, or the
user's name into the system prompt. Serialise the chart snapshot with sorted
keys so the bytes are stable.

### The chart snapshot

A compact, pre-rendered view of the user's chart — not the full JSONB blob.
Aim for ~1–2K tokens:

- Lagna, Moon sign, Sun sign, birth nakshatra + pada
- All 9 planets: sign, house, degree, retro/combust, dignity — one line each
- Active yogas and doshas with strength/severity
- Current mahadasha + antardasha with dates
- Today's date and current transit positions

Anything deeper (full house analysis, dasha sub-periods, transit dates for a
future year) is fetched **by tool call**, not preloaded. This is the point of
tools: the model asks for what the question actually needs.

---

## Tools

The model reasons; `astrology_core` computes. Five tools:

| Tool | Returns |
|---|---|
| `get_house_details(house: int)` | Sign, lord + its placement, occupants, aspects to the house |
| `get_planet_details(planet: str)` | Full placement, dignity, aspects given/received, dasha significance |
| `get_dasha_periods(from_date, to_date)` | Maha/antar/pratyantar covering the range |
| `get_transits(date)` | Transit positions and their relation to the natal chart |
| `check_yoga_or_dosha(name: str)` | Presence, planets involved, strength, cancellations checked |

Each dispatches into `astrology_core` and returns structured data. **No tool
returns interpretive text** — interpretation is the model's job, computation is
the engine's, and mixing them is how you get a system nobody can debug.

Write descriptions prescriptively — say *when* to call, not just what it does.
Opus 5 under-reaches for tools with purely descriptive schemas:

> "Call this when the user asks about a specific life area (career, marriage,
> money, health) and you need the governing house's details beyond the summary
> in the chart snapshot."

Use the SDK tool runner rather than hand-writing the agentic loop.

---

## System prompt

Structure, with the reasoning for each part:

**Identity + boundary.** Personal Vedic astrologer for this specific user.
"You never calculate. Positions, dashas, yogas, doshas are given to you or
fetched by tool. If a fact you need isn't available, say so and offer to
look it up — never estimate a position or a date."

**Voice** (spec §12): knowledgeable, calm, direct, respectful, plain modern
language. Explain Sanskrit terms on first use in a clause, not a glossary dump.

**Honesty** (spec §13, §58–59): distinguish strong / moderate / mixed / weak /
insufficient indications, and say which one you're giving. Do not manufacture
positivity. Do not manufacture doom. When a chart shows difficulty, say it,
then say what supports the person, then say what the tradition suggests doing.

**Cite the chart** (spec §31, §77): every substantive claim names the factors
behind it — the house, its lord, the dasha, the transit. This powers the "Why?"
button and is the product's trust mechanism. Emit those factors in a structured
tail the client can parse (see below).

**Safety** (spec §14): see next section.

**Length.** Opus 5 defaults long. Include explicitly:

> Keep responses focused and concise. Lead with the direct answer in one or
> two sentences, then the chart basis, then the practical read. Skip preamble.
> Do not restate the question. A simple question gets a short prose answer,
> not headers and sections.

**Scope.** Also needed on Opus 5:

> Answer what was asked at the scope intended. Don't expand a question about
> career into a full chart reading. Offer to go deeper instead.

Keep the prompt in `prompts/` as Python constants, byte-stable, versioned in git.
When you change it you invalidate the cache for everyone — batch prompt changes.

---

## Safety

Spec §14. Non-negotiable and separate from tone.

Trigger topics: **medical, mental health / self-harm, legal, major financial
decisions, pregnancy and fertility, death and longevity, criminal matters.**

Required behaviour on those topics:

1. The astrological reading may still be given.
2. It must be explicitly framed as traditional interpretation, not fact.
3. It must not be stated as certainty about an outcome. Never "you will die at
   47", never "you have this illness", never "invest now".
4. It must point to the appropriate professional.

Self-harm is the hard stop: no astrological framing at all. Respond with care
and surface crisis resources for the user's region. Implement this as a
**pre-check on the user's message before the LLM call**, not as a prompt
instruction — a prompt rule is a strong default, not a guarantee, and this is
the one case where the difference matters.

Log every safety-path trigger with the conversation id for review.

---

## Response format

Free-form prose (not rigid headers — that's what makes it read like a form),
followed by a machine-readable tail the client strips out and renders as UI:

```json
{
  "chart_factors": [
    {"type": "house",  "ref": "10", "note": "career"},
    {"type": "planet", "ref": "Saturn"},
    {"type": "dasha",  "ref": "Venus/Saturn"}
  ],
  "confidence": "moderate",
  "follow_ups": ["When will this improve?", "Does this affect money?"]
}
```

- `chart_factors` → the **"Why?"** expansion (spec §77)
- `confidence` → how the UI hedges the statement (spec §58)
- `follow_ups` → the suggested-question chips (spec §79)

Emit it as a fenced block after the prose. The client parses with zod and
discards it from the visible text; if parsing fails, show the prose alone —
never show the user a JSON blob.

---

## Streaming

Design it in from day one (spec, "Streaming AI"). Retrofitting streaming onto
a request/response chat is a rewrite of the whole message path.

```
Next.js  ──POST /v1/conversations/{id}/messages──▶  FastAPI
                                                     └─ SSE ─▶ Claude (stream)
         ◀────────── SSE ──────────────────────────────┘
```

FastAPI returns `StreamingResponse` with `text/event-stream`. Frame types:

| Event | Payload |
|---|---|
| `token` | text delta |
| `tool_start` | tool name → renders "Checking your 10th house…" |
| `tool_end` | — |
| `factors` | the structured tail |
| `done` | final message id |
| `error` | code + user-safe message |

Frontend: `use-chat.ts` owns the `EventSource`/fetch-stream, accumulates tokens
into local component state, and on `done` writes the finished message into
TanStack Query with `setQueryData` so it joins the normal cache. Zustand holds
only "is streaming", "is recording" — never the message list.

Persist the assistant message **after** the stream completes, including
`chart_factors`. On a mid-stream disconnect, persist the partial and mark it
incomplete so the UI can offer regenerate.

---

## Conversations

`ai_astrologer` does **not** own conversation storage. `modules/conversations`
does. The AI service calls the conversations service to read history and write
messages.

Why: the same message store is read by the saved-insights feature, conversation
history UI, and eventually a human-astrologer handoff (spec §41). If persistence
lives inside the AI module, all three end up importing it, and the boundary is
gone.

**History window:** send the last ~20 messages. Beyond that, summarise older
turns into a running conversation summary rather than growing the prompt — the
chart snapshot is the expensive stable part and you want it cached, not pushed
out by chat scrollback.

---

## Cost

Rough per-turn shape: ~2K stable prefix (system + tools + chart) + ~1K history
+ output. With caching, the prefix costs ~10% after the first turn.

- Cache hits are the whole game. Verify with
  `response.usage.cache_read_input_tokens` — if it's 0 across turns in one
  conversation, either something in the prefix is changing (diff the rendered
  bytes) or the router isn't forwarding `cache_control` at all. Rule out the
  router first; it's the cheaper check.
- **Billing is AgentRouter's, not Anthropic's.** Don't budget against the
  published $5/$25 per MTok — read the router's own rates and its usage
  dashboard, and reconcile against your per-user token counters monthly.
- Start at `effort: "medium"`. Opus 5 is unusually strong at low/medium; don't
  assume a prior model's effort setting transfers.
- Rate-limit free-tier users per day. Track token usage per user per day from
  day one — you cannot price a subscription tier you never measured.
