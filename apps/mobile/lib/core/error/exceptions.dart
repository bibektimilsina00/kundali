/// Data-layer vocabulary. These never escape a repository — see failure.dart.
library;

import 'package:kundali/core/error/failure.dart';

sealed class AppException implements Exception {
  const AppException(this.message);
  final String message;

  /// The one translation point between layers.
  Failure toFailure();
}

final class NetworkException extends AppException {
  const NetworkException([super.message = 'No connection.']);
  @override
  Failure toFailure() => NetworkFailure(message);
}

final class UnauthorizedException extends AppException {
  const UnauthorizedException([super.message = 'Session expired.']);
  @override
  Failure toFailure() => AuthFailure(message);
}

final class NotFoundException extends AppException {
  const NotFoundException([super.message = 'Not found.']);
  @override
  Failure toFailure() => NotFoundFailure(message);
}

final class ApiException extends AppException {
  const ApiException(super.message, {this.code, this.statusCode});
  final String? code;
  final int? statusCode;
  @override
  Failure toFailure() => ServerFailure(message, code);
}

final class ValidationException extends AppException {
  const ValidationException(super.message, {this.fieldErrors = const {}});
  final Map<String, String> fieldErrors;
  @override
  Failure toFailure() => ValidationFailure(message, fieldErrors);
}

final class CacheException extends AppException {
  const CacheException([super.message = 'Cache read failed.']);
  @override
  Failure toFailure() => CacheFailure(message);
}
