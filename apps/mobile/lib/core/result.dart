/// Dart 3 sealed result. Twenty lines instead of a functional-programming
/// dependency the whole team has to learn (docs/mobile.md §5).
///
/// Exhaustive `switch` is the payoff: adding a case produces a compile error
/// everywhere that must handle it.
library;

import 'package:kundali/core/error/failure.dart';

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

extension ResultX<T> on Result<T> {
  bool get isOk => this is Ok<T>;

  /// Value if present, else null. Use sparingly — prefer an exhaustive switch,
  /// which forces you to decide what a failure means at that call site.
  T? get valueOrNull => switch (this) {
        Ok(value: final v) => v,
        Err() => null,
      };

  Result<R> map<R>(R Function(T) transform) => switch (this) {
        Ok(value: final v) => Ok(transform(v)),
        Err(failure: final f) => Err(f),
      };
}
