/// What the UI is allowed to know about something going wrong.
///
/// Domain vocabulary. The data layer's exceptions are translated into these at
/// the repository boundary and nowhere else — a Cubit that catches
/// DioException is a layer leak (docs/mobile.md §4).
library;

import 'package:equatable/equatable.dart';

sealed class Failure extends Equatable {
  const Failure(this.message);

  /// Human-readable, already localised where it matters. Never parsed.
  final String message;

  @override
  List<Object?> get props => [message];
}

final class NetworkFailure extends Failure {
  const NetworkFailure([super.message = 'No connection.']);
}

final class AuthFailure extends Failure {
  const AuthFailure([super.message = 'Please sign in again.']);
}

final class ServerFailure extends Failure {
  const ServerFailure([super.message = 'Something went wrong.', this.code]);

  /// The API's stable `error.code`. Switch on this, never on `message` —
  /// see docs/architecture.md §7.
  final String? code;

  @override
  List<Object?> get props => [message, code];
}

final class NotFoundFailure extends Failure {
  const NotFoundFailure([super.message = 'Not found.']);
}

final class ValidationFailure extends Failure {
  const ValidationFailure(super.message, [this.fieldErrors = const {}]);
  final Map<String, String> fieldErrors;

  @override
  List<Object?> get props => [message, fieldErrors];
}

final class CacheFailure extends Failure {
  const CacheFailure([super.message = 'No saved copy available.']);
}
