# Astrologer Marketplace — Feature Plan

Status: **planning**. Nothing here is built. This document exists to be argued
with before any code is written.

Builds on [`nakhatra.md`](../nakhatra.md) §40 (Human Astrologer), §41 (AI → Human
Handoff) and *Future User Types*, which already sketch this. Where this document
disagrees with those sections, this one is newer — but the disagreement should
be resolved deliberately, not silently.

---

## 1. What it is

Today Nakhatra has one astrologer, and it is a language model. This adds the
other kind: **verified human astrologers and pandits who take paid
consultations**, and a way for people to find them.

One line: *the AI reads your chart for free, and hands you to a human when you
want one.*

## 2. Why this shape, and not a generic directory

The obvious version of this feature is a listings page — photos, star ratings,
"book now". Every astrology marketplace already looks like that, and they all
compete on price and photographs.

The version worth building is the one only this product can build: **the
handoff**. A person has already generated a chart, already asked the AI three
questions, and already been told something they want a second opinion on. At
that moment they press one button and a human sees:

- the computed chart,
- the questions they asked,
- what the AI said,
- and what they actually want to know.

The astrologer starts the conversation already informed. The seeker does not
retype their birth details or re-explain their situation. That is the product;
the directory is just the part that makes it navigable.

`nakhatra.md` §41 calls this "one of the strongest future features". It should be
the first thing built, not the last.

---

## 3. The two sides

### Seeker (existing users)

Everything they have today, plus:

- Browse and filter astrologers.
- Request a consultation, optionally attached to a saved chart.
- Share a chart — and separately, a conversation — with an explicit, revocable
  grant.
- Message an astrologer, and later speak with one.
- Rate and review after a completed consultation.

### Astrologer / Pandit

A new account type. `nakhatra.md` treats Astrologer and Pandit as separate user
types; they differ in **what they offer** (readings vs rituals) rather than in
how their account works, so the plan is one role with a `practice_type` rather
than two parallel implementations.

- Apply, then be verified before appearing publicly.
- Profile: name, photo, bio, years practising, traditions and specialisations,
  languages, city.
- Set consultation types, durations and prices.
- Set availability.
- Accept or decline requests.
- View a shared chart, and the AI's analysis of it, before the call.
- Record their own interpretation, which is stored alongside the AI's.
- Get paid.

---

## 4. Scope

### In, for the first release

- Astrologer applications and manual verification.
- Public astrologer directory with filters.
- Consultation requests, accept/decline.
- Text consultations, asynchronous.
- Chart sharing with explicit consent.
- Payment for a consultation, and payout to the astrologer.
- Reviews on completed consultations only.

### Explicitly out, for now

- **Voice and video calls.** They need a media stack, recording policy and
  bandwidth assumptions Nepal may not support well. Text first; see §9.
- **Real-time presence** ("online now"). Scheduled and asynchronous only.
- **Astrologer-side chart calculation for third parties.** An astrologer works
  from charts a seeker shared, not by entering strangers' birth details.
- **Subscriptions or packages.** Single consultations until the unit economics
  are known.
- **Ritual/puja booking.** Pandit-specific, and logistically a different product
  (physical scheduling, location, materials).

---

## 5. Data model

Additive throughout — no existing table changes shape, per
[`docs/architecture.md`](architecture.md) §7 and CLAUDE.md rule 7.

### New tables

| Table | Holds |
|---|---|
| `astrologer_profiles` | One per astrologer account: bio, photo, experience, city, `practice_type`, verification status, payout details. |
| `astrologer_languages` | Which languages they consult in. Separate table so it is filterable. |
| `astrologer_specialities` | Career, marriage, remedies, muhurta, and so on. Same reason. |
| `consultation_offers` | What an astrologer sells: type, duration, price, currency. |
| `availability_rules` | Recurring weekly windows, stored with an IANA zone. |
| `availability_exceptions` | Holidays and one-off blocks. |
| `consultations` | The request and its lifecycle: seeker, astrologer, offer, state, scheduled window, price at time of booking. |
| `chart_grants` | A seeker granting an astrologer access to one saved kundali, with granted/revoked timestamps. |
| `conversation_grants` | The same for an AI conversation. Deliberately separate — see §7. |
| `consultation_messages` | Human-to-human messages within a consultation. |
| `astrologer_notes` | The astrologer's own interpretation, stored against a consultation. |
| `reviews` | Rating and text, one per completed consultation. |
| `payments` | Charge, provider reference, state. |
| `payouts` | What is owed and what has been sent. |

### Changes to existing tables

- `users` gains a nullable `role` (`seeker` | `astrologer` | `admin`), defaulting
  to `seeker`. Nullable and defaulted so old rows and old clients are unaffected.

That is the only change to anything that exists.

### The one that needs care

`consultation_messages` is **not** `chat_messages`. The existing table belongs to
AI conversations: one participant, no delivery state, no read receipts, no
moderation. Overloading it to carry human conversation would give both features
a shape that suits neither. New table, new module.

---

## 6. Backend modules

Following the module shape in CLAUDE.md — a module exists when a feature has
routes **and** tables.

```
modules/astrologers/     profiles, verification, directory search
modules/consultations/   requests, lifecycle, messages, notes
modules/grants/          chart and conversation sharing, consent
modules/payments/        charges, payouts, provider adapters
modules/reviews/         ratings on completed consultations
```

`grants/` is its own module rather than living inside `consultations/` because
consent has to be enforceable from anywhere — the reading page, the vault, an
admin tool — and it must be revocable independently of any consultation.

Astrologer directory search is a read-heavy filtered query. It belongs in
`astrologers/repository.py`, and it will want indexes on the filter columns from
day one rather than after the first slow page.

---

## 7. The hard parts

These are the decisions. Everything else is typing.

### 7.1 Consent is the whole trust story

Birth data is sensitive (CLAUDE.md rule 9), and this feature's entire purpose is
showing it to a stranger. `nakhatra.md` §39 already commits to the user
controlling "whether their Kundali and conversation history are shared".

Requirements:

- **Two separate grants.** A chart is birth data. A conversation is what someone
  asked about their marriage. Wanting a second opinion on the first is not
  consent to the second.
- **Scoped to one astrologer and one chart.** Never "share with all astrologers".
- **Revocable**, with the astrologer losing access immediately.
- **Visible** — a page listing every active grant and when it was made.
- **Expiring** by default when a consultation completes, with an explicit action
  to extend.
- **Audited.** Every access to a shared chart is logged with who and when.

The privacy policy needs a section for this before the feature ships, because it
adds a recipient category the current one does not cover.

### 7.2 Verification decides whether the product is trustworthy

An unverified marketplace fills with people who are not astrologers. Manual
review for the first cohort — documents, a video call, references — and no
public listing before approval.

Open: what evidence actually establishes competence in Jyotish? A certificate
from a Sanskrit university is verifiable. Twenty years of practice in a small
town is real but not documented. Getting this wrong in either direction is
expensive: too strict and there is no supply, too loose and there is no trust.

### 7.3 Payments in Nepal

The default advice — Stripe — does not serve Nepal well. Realistically:

- **eSewa, Khalti, IME Pay** for domestic seekers.
- **Cards** for diaspora, who are likely the higher-value segment.
- **Payouts** to Nepali bank accounts, which is a manual or semi-manual process
  at first.
- **Commission** rate, and whether it is visible to the astrologer.
- **Refunds** when a consultation does not happen or goes badly.
- **Currency**: price in NPR, or in the seeker's currency with a conversion.

This is the single most likely thing to delay the release, and none of it is
astrology. Decide it before building the directory, because pricing shape
affects the data model.

### 7.4 Human conversation is not AI conversation

The existing chat is request/response: one participant, no waiting. Human
consultation needs unread counts, delivery state, notifications when the other
party is asleep, and an answer to "the astrologer has not replied in three days".

Start asynchronous and message-based, with clear response-time expectations set
by the astrologer and shown before booking. That avoids presence, WebSockets and
the entire real-time problem for the first release.

### 7.5 Availability means time zones, again

Astrologers in Nepal, seekers in Sydney and Toronto. Availability must be stored
against an IANA zone and rendered in the viewer's, which is the same discipline
already applied to birth data — and the same failure mode if it is not.

### 7.6 Trust and safety

- Reviews only from seekers who completed and paid for a consultation.
- A reporting path, and a defined response.
- Guidance for astrologers on what not to predict — the AI is already
  instructed never to predict death or terminal illness, and a human on this
  platform should be held to the same line.
- Off-platform payment is the standard failure of every marketplace. Detect and
  discourage it, and make on-platform payment the easier path.

---

## 8. Phases

Each phase is shippable and independently useful.

| Phase | Ships | Proves |
|---|---|---|
| **0. Waitlist** | "Talk to a real astrologer — coming soon" on the site. Two forms: seekers register interest, astrologers apply. | Whether either side wants this, before building any of it. |
| **1. Directory** | Astrologer profiles, verification pipeline, public browse and filter. No booking. Contact goes through a request form. | That supply exists and can be verified. |
| **2. Consultations** | Requests, accept/decline, asynchronous messaging, chart grants, astrologer notes. Still free or paid off-platform. | That the handoff is actually valuable. |
| **3. Payments** | Charging, payouts, commission, refunds, reviews. | That the unit economics work. |
| **4. Live** | Scheduled voice, then video. Presence. | Only once the asynchronous version has demand it cannot serve. |

Phase 0 is a landing section and two database tables. It answers the most
expensive question — *does anyone want this* — for a fraction of the cost of
finding out in Phase 3.

---

## 9. Open questions

These need answers from the product owner, not from an engineer.

1. **"Astrologers share their kundali"** — from the original request, this is
   ambiguous. Does an astrologer publish *their own* chart as a credential
   ("Jupiter in the 9th, as you would expect"), or is this about seekers sharing
   theirs? The first is unusual and rather good; the second is assumed
   throughout this document. Which is meant?
2. Are Pandits in the first release, or astrologers only? Ritual booking is a
   different logistics problem.
3. Who runs verification, and how long does one application take?
4. What commission, and is it shown to the astrologer?
5. Is there any free tier for human consultations, or is every one paid?
6. Which market first — Nepal domestic, or diaspora? It changes the payment
   work, the pricing and the language mix.
7. Does the AI actively suggest a human ("this is a question worth asking a
   person about"), or does the seeker have to go looking?

---

## 10. What this means for existing code

- **Auth** gains roles. `get_current_user` returns an id; something will need
  `require_role("astrologer")`. That is a `router_deps.py` addition.
- **The vault** gains the concept of a chart being shared, which is a read path
  that is no longer "mine only". Every existing vault query is scoped
  `WHERE user_id = ?`; grants deliberately do not change those, and add separate
  queries instead.
- **The contract grows** by roughly five modules' worth of routes. Additive
  throughout, and `make contract` after each.
- **Mobile** is unaffected until it chooses to adopt any of it. Nothing here
  removes or narrows an existing field.
- **The privacy policy** needs a new recipient category before Phase 2 ships.

---

## 11. What would make this fail

Worth writing down while it is still cheap to avoid:

- Building the directory before knowing whether astrologers will join.
- Building payments before knowing whether consultations happen.
- Letting unverified astrologers list, and losing trust permanently in week one.
- Treating consent as a checkbox instead of a revocable, audited grant.
- Reusing `chat_messages` for human conversation and ending up with a table that
  serves neither.
- Building voice and video first because they demo well.
