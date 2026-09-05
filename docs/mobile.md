# Mobile App (Flutter)

Clean architecture with BLoC. This document is the layer contract; deviating
from it needs a reason written down here first.

**Related:** [`architecture.md`](architecture.md) §7 for the API contract both
clients share, [`ai-astrologer.md`](ai-astrologer.md) for the streaming protocol.

---

## 1. Why the ceremony is worth it here

Clean architecture earns its keep when something outside your control changes
shape. Three things do, in this app:

1. **DTOs are generated from OpenAPI.** Regenerating must not ripple into your
   BLoCs. The `domain/entities` ↔ `data/models` split is the firebreak.
2. **Two clients, one API.** The domain layer is where "what a Kundali is"
   lives, independent of how the API happens to serialise it this month.
3. **The chart is offline-readable.** A repository that can serve from cache or
   network without the UI knowing is the whole point of the repository seam.

Where it does **not** earn its keep is called out in §11. Build the structure
below; don't add ceremony beyond it.

---

## 2. The dependency rule

```
        ┌─────────────────┐
        │  presentation   │   BLoC, pages, widgets
        └────────┬────────┘
                 │ depends on
        ┌────────▼────────┐
        │     domain      │   entities, repository interfaces, use cases
        └────────▲────────┘   ← depends on NOTHING
                 │ implements
        ┌────────┴────────┐
        │      data       │   DTOs, mappers, datasources, repository impls
        └─────────────────┘
```

- **`domain/` imports nothing** — not Flutter, not dio, not json_serializable,
  not another feature. If you can't run it in a plain `dart test` with no
  Flutter binding, it isn't domain.
- **`data/` implements `domain/` interfaces.** Dependency inversion: the
  repository *interface* lives in domain, the *implementation* in data.
- **`presentation/` talks only to domain.** A BLoC importing a DTO or a
  datasource is the single most common way this structure quietly collapses.
- **Features never import each other.** Shared concerns go to `core/`. If two
  features genuinely need the same entity, it belongs in `core/domain/`.

### Enforce it, don't document it

Same principle as the backend's import-linter contracts — a boundary nothing
checks is a boundary that erodes:

```dart
// tool/check_layers.dart — one rule per layer boundary
const _rules = <_Rule>[
  _Rule('domain_is_pure',
      pathContains: '/domain/',
      forbidden: ['package:flutter/', 'package:dio/', '/data/', '/presentation/'],
      why: 'domain must run under plain `dart test` with no Flutter binding'),
  _Rule('presentation_never_touches_data',
      pathContains: '/presentation/',
      forbidden: ['/data/'],
      why: 'a Cubit importing a DTO is how clean architecture quietly collapses'),
  _Rule('core_knows_no_features',
      pathContains: 'lib/core/',
      forbidden: ['package:kundali/features/'],
      why: 'features import core; core must never import one back'),
];
// features_are_islands is derived from the path, not enumerated, so a new
// feature is covered the moment it exists.
```


`dart run tool/check_layers.dart` in CI — a dependency-free `dart:io` script
rather than a package, because the guard must not itself be able to break the
build.

**Verify the guard, not just the code.** `--self-test` drives every rule against
synthetic paths and asserts each one both fires and stays quiet correctly. This
is not ceremony: the first version of that script matched `'/lib/core/'` while
`listSync()` yields `'lib/core/...'`, so two of its four rules could never fire
and it reported OK forever. A guard that cannot fail is worse than no guard,
because you trust it.

The first thing it caught once fixed: **`di.dart` was in `core/` and imported
every feature.** The rule was right and the layout was wrong — a composition
root legitimately knows every layer, which makes it part of `app/`, the
outermost ring, not part of the shared infrastructure that features import.

---

## 3. What exists today

A **vertical slice**, not seven empty feature folders. `kundali` is built end to
end through all three layers so the contract in §2 is demonstrated and enforced
rather than described; every other feature is the same shape, copied.

| | Status |
|---|---|
| `core/` — result, failures, exceptions, dio client, auth interceptor, secure store, DI | built |
| `features/kundali/` — all three layers, with tests | built |
| `app/` — router, theme stub, bootstrap | built |
| `tool/check_layers.dart` — the §2 rules, enforced, self-tested | built |
| `core/network/sse.dart` | **not built** — it ships with `ai_astrologer` in Phase 2, the feature that uses it |
| `auth`, `onboarding`, `horoscope`, `timeline`, `profile` | not built |
| North Indian chart `CustomPainter` | not built — the slice uses a planet list, which proves the layers without the drawing |
| DTO generation from OpenAPI | not wired — but `contracts/openapi.json` now exists, so this is unblocked. See the note below. |

Two deliberate stand-ins, both marked in the code:

- **`data/models/kundali_dto.dart` is hand-written.** The mapper next door is
  precisely what makes replacing it cheap — nothing outside `data/` knows those
  classes exist. This is the §1 argument being cashed in.

  Now that `contracts/openapi.json` exists there is a real choice to make, and
  it is not obviously "generate": `openapi-generator` for Dart needs a Java
  toolchain and emits verbose output. The lighter option is to keep the
  hand-written DTO and add a contract test that validates it against the
  committed spec — that catches drift, which is the actual risk, without a
  build step. Decide with the spec in hand rather than by default.

  Until then, `test/fixtures/chart_response.json` is a **real captured API
  response** and the mapper test asserts against it. That is the current
  contract check, and it is not nothing: it caught nothing yet only because the
  shapes were built together.
- **`AuthInterceptor.refresh` always returns null** until the auth feature
  lands, which correctly routes to sign-in instead of looping.

---

## 4. Layout

```
apps/mobile/
├── pubspec.yaml
├── tool/check_layers.dart          # the §2 rules, enforced
├── analysis_options.yaml
├── lib/
│   ├── main.dart
│   ├── bootstrap.dart              # DI wiring + guarded error zone
│   │
│   ├── app/                        # outermost layer: may depend on everything
│   │   ├── app.dart                # MaterialApp.router
│   │   ├── di.dart                 # composition root — see note below
│   │   ├── router.dart             # go_router; auth + onboarding redirects
│   │   └── theme/
│   │
│   ├── core/                       # cross-feature. Features import this; it imports no feature.
│   │   ├── result.dart             # sealed Result<T>
│   │   ├── error/
│   │   │   ├── failure.dart        # domain vocabulary
│   │   │   └── exceptions.dart     # data vocabulary
│   │   ├── network/
│   │   │   ├── api_client.dart     # dio + interceptors
│   │   │   ├── auth_interceptor.dart
│   │   │   └── sse.dart            # Dart has no EventSource. See §8.
│   │   ├── storage/
│   │   │   ├── secure_store.dart   # flutter_secure_storage: tokens only
│   │   │   └── cache_store.dart    # drift: chart, horoscope
│   │   └── widgets/                # only with 2+ real consumers
│   │
│   ├── features/
│   │   ├── auth/
│   │   ├── onboarding/             # birth details capture
│   │   ├── kundali/
│   │   ├── horoscope/
│   │   ├── ai_astrologer/
│   │   ├── timeline/               # dasha
│   │   └── profile/
│   │
│   └── api/                        # OpenAPI-generated. Never hand-edited.
│       └── generated/
└── test/
    ├── features/…/domain/          # pure dart, no Flutter binding
    ├── features/…/data/            # mappers + repos against fakes
    └── features/…/presentation/    # bloc_test
```

---

## 5. Feature anatomy

Every feature is the same shape. `kundali` in full:

```
features/kundali/
├── domain/
│   ├── entities/
│   │   ├── kundali.dart            # plain Dart. No JSON, no Flutter.
│   │   ├── planet.dart
│   │   └── dasha_period.dart
│   ├── repositories/
│   │   └── kundali_repository.dart # abstract. The seam.
│   └── usecases/
│       ├── get_kundali.dart
│       └── create_kundali.dart
│
├── data/
│   ├── models/                     # re-exports of generated DTOs
│   ├── mappers/
│   │   └── kundali_mapper.dart     # DTO -> entity. The firebreak.
│   ├── datasources/
│   │   ├── kundali_remote_datasource.dart
│   │   └── kundali_local_datasource.dart
│   └── repositories/
│       └── kundali_repository_impl.dart
│
└── presentation/
    ├── bloc/
    │   ├── kundali_cubit.dart
    │   └── kundali_state.dart
    ├── pages/kundali_page.dart
    └── widgets/north_indian_chart.dart
```

### The seam, concretely

```dart
// domain/repositories/kundali_repository.dart — knows nothing about HTTP
abstract interface class KundaliRepository {
  Future<Result<Kundali>> getKundali({bool forceRefresh = false});
  Future<Result<Kundali>> createKundali(BirthDetails details);
}
```

```dart
// data/repositories/kundali_repository_impl.dart
final class KundaliRepositoryImpl implements KundaliRepository {
  KundaliRepositoryImpl(this._remote, this._local);
  final KundaliRemoteDataSource _remote;
  final KundaliLocalDataSource _local;

  @override
  Future<Result<Kundali>> getKundali({bool forceRefresh = false}) async {
    // Cache-first: a chart is derived from birth data that does not change,
    // so a stale read is correct, not a compromise. It also means the chart
    // opens instantly and works on a train.
    if (!forceRefresh) {
      final cached = await _local.read();
      if (cached != null) return Ok(cached.toEntity());
    }
    try {
      final dto = await _remote.fetch();
      await _local.write(dto);
      return Ok(dto.toEntity());
    } on ApiException catch (e) {
      // Falling back to a stale chart beats an error screen.
      final cached = await _local.read();
      if (cached != null) return Ok(cached.toEntity());
      return Err(e.toFailure());
    }
  }
}
```

The `try/catch → Result` conversion happens **here and only here**. Exceptions
are a data-layer vocabulary; `Failure` is a domain one. A BLoC that catches
`DioException` has a layer leak.

---

## 6. Result and Failure

Dart 3 sealed classes. No `dartz` — twenty lines beats a functional-programming
dependency the team has to learn.

```dart
// core/result.dart
sealed class Result<T> {
  const Result();
}

final class Ok<T> extends Result<T> {
  const Ok(this.value);
  final T value;
}

final class Err<T> extends Result<T> {
  const Err(this.failure);
  final Failure failure;
}
```

```dart
// core/error/failure.dart — what the UI is allowed to know
sealed class Failure {
  const Failure(this.message);
  final String message;
}

final class NetworkFailure   extends Failure { const NetworkFailure(super.m); }
final class AuthFailure      extends Failure { const AuthFailure(super.m); }
final class ServerFailure    extends Failure { const ServerFailure(super.m); }
final class ValidationFailure extends Failure {
  const ValidationFailure(super.m, this.fieldErrors);
  final Map<String, String> fieldErrors;
}
```

Exhaustive `switch` on a sealed type means adding a failure kind produces a
compile error at every place that must handle it. That is the payoff.

---

## 7. BLoC conventions

### Cubit by default, Bloc when the event stream matters

`Bloc` buys you named events and event transformers. When a screen has one
action, that's three files describing a method call. Use `Cubit` there.

Reach for `Bloc` when concurrency is real — when events can overlap and the
*ordering or dropping* of them is a decision:

| Feature | Type | Why |
|---|---|---|
| `kundali` | Cubit | load, refresh. No concurrency. |
| `horoscope` | Cubit | load today. |
| `timeline` | Cubit | load, select period. |
| `onboarding` | Cubit | form state. |
| `auth` | Bloc | sign-in, refresh, and sign-out race; ordering matters |
| `ai_astrologer` | **Bloc** | user sends while a stream is live; needs `droppable()` and cancellation |

This is not a style preference — it is "use the transformer machinery when you
need transformers".

### State as a sealed hierarchy

```dart
sealed class KundaliState {
  const KundaliState();
}

final class KundaliInitial extends KundaliState { const KundaliInitial(); }
final class KundaliLoading extends KundaliState { const KundaliLoading(); }

final class KundaliLoaded extends KundaliState {
  const KundaliLoaded(this.kundali, {this.isStale = false});
  final Kundali kundali;
  final bool isStale;   // served from cache after a failed refresh
}

final class KundaliFailed extends KundaliState {
  const KundaliFailed(this.failure);
  final Failure failure;
}
```

Rules:
- **Never** `bool isLoading` + `T? data` + `String? error` in one class. That
  makes `loading && error != null && data == null` representable, and something
  will eventually produce it.
- The widget layer `switch`es exhaustively. No `if (state.data != null)`.
- `Equatable` (or `freezed`) on every state, or BLoC can't suppress duplicate
  emissions and you get needless rebuilds.

### Cubit, in full

```dart
final class KundaliCubit extends Cubit<KundaliState> {
  KundaliCubit(this._getKundali) : super(const KundaliInitial());
  final GetKundali _getKundali;

  Future<void> load({bool forceRefresh = false}) async {
    emit(const KundaliLoading());
    final result = await _getKundali(forceRefresh: forceRefresh);
    emit(switch (result) {
      Ok(value: final k) => KundaliLoaded(k),
      Err(failure: final f) => KundaliFailed(f),
    });
  }
}
```

The Cubit contains no `try`, no `dio`, no JSON. If it does, a layer leaked.

---

## 8. Streaming the AI chat

The hardest part of the mobile app, and the core product surface. Two Dart
facts drive the design:

**Dart has no `EventSource`.** There is no browser SSE primitive. You issue a
streamed HTTP response and parse the frames yourself.

**Use one HTTP client.** It is tempting to use `package:http` for the stream
and `dio` for everything else. Don't — your auth interceptor and token refresh
live on the dio instance, and the streaming call is the one you least want
silently unauthenticated.

```dart
// core/network/sse.dart
Stream<SseFrame> sseStream(Dio dio, String path, Object body) async* {
  final res = await dio.post<ResponseBody>(
    path,
    data: body,
    options: Options(responseType: ResponseType.stream, headers: {
      'Accept': 'text/event-stream',
    }),
  );

  String? event;
  final buffer = StringBuffer();

  // Decode then split: a chunk boundary can fall mid-line, and mid-UTF8.
  final lines = res.data!.stream
      .cast<List<int>>()
      .transform(utf8.decoder)
      .transform(const LineSplitter());

  await for (final line in lines) {
    if (line.isEmpty) {                    // blank line terminates a frame
      if (event != null) yield SseFrame(event, buffer.toString());
      event = null;
      buffer.clear();
    } else if (line.startsWith('event:')) {
      event = line.substring(6).trim();
    } else if (line.startsWith('data:')) {
      buffer.write(line.substring(5).trimLeft());
    }
    // ':' comment lines (heartbeats) fall through and are ignored.
  }
}
```

Frame types are defined in [`ai-astrologer.md`](ai-astrologer.md#streaming):
`token`, `tool_start`, `tool_end`, `factors`, `done`, `error`.

### The Bloc

```dart
final class ChatBloc extends Bloc<ChatEvent, ChatState> {
  ChatBloc(this._ask) : super(const ChatState.idle()) {
    // droppable: if a stream is live, ignore a second send rather than
    // interleaving two token streams into one message.
    on<MessageSent>(_onSent, transformer: droppable());
    on<StreamStopped>(_onStopped);
  }

  Future<void> _onSent(MessageSent e, Emitter<ChatState> emit) async {
    emit(state.startStreaming(e.text));
    await emit.onEach<SseFrame>(
      _ask(e.text),
      onData: (frame) => emit(state.applyFrame(frame)),
      onError: (err, _) => emit(state.failed(err)),
    );
    emit(state.finishStreaming());
  }
}
```

`emit.onEach` (not a raw `listen`) so the subscription is cancelled with the
Bloc — a leaked SSE subscription holds a socket open and keeps emitting into a
closed emitter.

### Three things that will bite

1. **Backgrounding kills the connection.** iOS suspends sockets within seconds.
   Persist the partial message and mark it incomplete so the UI can offer
   regenerate — same contract as the web client.
2. **Don't `setState` per token.** Tokens arrive faster than 60fps. Buffer and
   emit on a ~50ms timer, or the frame budget goes entirely to rebuilds.
3. **The `factors` frame is JSON inside an SSE frame.** Parse defensively; if it
   fails, render the prose alone. Never surface a JSON blob to a user asking
   about their marriage.

---

## 9. Cross-cutting

### Auth
Access token in memory, refresh token in `flutter_secure_storage` — **never**
`SharedPreferences`, which is plaintext on disk. A dio interceptor refreshes on
401 and retries once; concurrent 401s must share one refresh future or you
stampede the endpoint and invalidate your own new token.

### Offline
`drift` for the chart and the last N horoscopes. The chart is derived from
unchanging birth data, so cache-first is *correct*, not a degradation.
Conversations sync-on-open; don't build offline message queuing until someone
asks.

### DI
`get_it`, registered in one `core/di.dart`. Skip `injectable` — code generation
to avoid writing thirty registration lines is a build step that earns nothing.

### Push notifications
`firebase_messaging`. Note this changes a backend decision: see
[`architecture.md`](architecture.md) §6 — lazy horoscope generation stops
working the moment a 6am push must contain the horoscope text.

---

## 10. Testing

| Layer | Tool | Needs Flutter binding |
|---|---|---|
| domain (entities, use cases) | `dart test` | no — that's the point |
| mappers | `dart test` | no |
| repositories | `mocktail` fakes | no |
| BLoC/Cubit | `bloc_test` | no |
| widgets | `flutter_test` | yes |

Mapper tests matter more than they look: they are where a regenerated DTO
silently changes meaning. Assert against a **real captured API response**, not a
hand-built DTO — a hand-built one encodes your assumption, not the server's
behaviour.

---

## 11. What this structure deliberately does not include

| | Why | Add when |
|---|---|---|
| `freezed` on everything | Sealed classes + `Equatable` cover states. Codegen on every model is a build-time tax. | You want deep `copyWith` on nested state |
| `injectable` | Thirty hand-written `get_it` lines are clearer than a codegen step | Registration exceeds ~100 lines |
| A use case per repository method | Honest note: about half of these will be a single `call()` forwarding to one repository method. They are kept because clean architecture's dependency rule is what you asked for and they are the layer that makes orchestration have an obvious home later. **If a feature's use cases are all pure pass-through, calling the repository from the Cubit is a defensible local exception** — write it in this table when you do. | — |
| `dartz` / `fpdart` | 20 lines of sealed `Result` beats a paradigm | Never, probably |
| Offline write queue | Only the chart needs offline reads | Users report losing messages |
| Modular navigation per feature | One `go_router` config is easier to reason about than N | The router file exceeds ~200 lines |
