/// The single dio instance. One HTTP client, not two — the auth interceptor and
/// token refresh live here, and the streaming AI call (Phase 2) is the one you
/// least want silently unauthenticated (docs/mobile.md §7).
library;

import 'package:dio/dio.dart';
import 'package:nakhatra/core/error/exceptions.dart';

Dio buildApiClient({required String baseUrl, required List<Interceptor> interceptors}) {
  final dio = Dio(
    BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 10),
      // Generous: chart generation is synchronous server-side and the AI
      // horoscope is generated on first read of the day.
      receiveTimeout: const Duration(seconds: 60),
      headers: {'Accept': 'application/json'},
    ),
  );
  dio.interceptors.addAll([...interceptors, _ErrorInterceptor()]);
  return dio;
}

/// Translates transport errors into the data layer's exception vocabulary, so
/// no repository ever has to know what a DioException is.
final class _ErrorInterceptor extends Interceptor {

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    handler.reject(
      DioException(
        requestOptions: err.requestOptions,
        response: err.response,
        type: err.type,
        error: _translate(err),
      ),
    );
  }

  AppException _translate(DioException err) {
    switch (err.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.receiveTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.transformTimeout:
      case DioExceptionType.connectionError:
        return const NetworkException();
      case DioExceptionType.cancel:
        return const NetworkException('Request cancelled.');
      case DioExceptionType.badCertificate:
        return const NetworkException('Could not verify the server.');
      case DioExceptionType.unknown:
        return ApiException(err.message ?? 'Unexpected error.');
      case DioExceptionType.badResponse:
        return _fromResponse(err.response);
    }
  }

  /// The API's error envelope is `{error: {code, message, details}}`
  /// (docs/architecture.md §7). `code` is for us; `message` is for the user.
  AppException _fromResponse(Response<dynamic>? response) {
    final status = response?.statusCode ?? 0;
    final body = response?.data;
    final error = body is Map && body['error'] is Map
        ? (body['error'] as Map).cast<String, dynamic>()
        : const <String, dynamic>{};
    final code = error['code'] as String?;
    final message = error['message'] as String? ?? 'Something went wrong.';

    return switch (status) {
      401 || 403 => UnauthorizedException(message),
      404 => NotFoundException(message),
      422 => ValidationException(
          message,
          fieldErrors: _fieldErrors(error['details']),
        ),
      _ => ApiException(message, code: code, statusCode: status),
    };
  }

  Map<String, String> _fieldErrors(Object? details) {
    if (details is! Map) return const {};
    final map = details.cast<Object?, Object?>();
    return {
      for (final entry in map.entries)
        '${entry.key}': '${entry.value}',
    };
  }
}
