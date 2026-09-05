/// Bearer auth with single-flight refresh.
///
/// The trap this avoids: several requests 401 at once, each fires its own
/// refresh, and the last one to land invalidates the tokens the others just
/// stored. Concurrent 401s must await one shared refresh future.
library;

import 'dart:async';

import 'package:dio/dio.dart';
import 'package:kundali/core/storage/secure_store.dart';

class AuthInterceptor extends Interceptor {
  AuthInterceptor({
    required SecureStore store,
    required Future<String?> Function(String refreshToken) refresh,
    required Future<void> Function() onSignedOut,
  })  : _store = store,
        _refresh = refresh,
        _onSignedOut = onSignedOut;

  final SecureStore _store;
  final Future<String?> Function(String refreshToken) _refresh;
  final Future<void> Function() _onSignedOut;

  String? _accessToken;              // memory only; never written to disk
  Future<String?>? _inFlightRefresh; // the single-flight guard

  set accessToken(String? value) => _accessToken = value;

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    if (_accessToken != null) {
      options.headers['Authorization'] = 'Bearer $_accessToken';
    }
    handler.next(options);
  }

  @override
  Future<void> onError(DioException err, ErrorInterceptorHandler handler) async {
    final isAuthError = err.response?.statusCode == 401;
    final alreadyRetried = err.requestOptions.extra['__retried__'] == true;

    if (!isAuthError || alreadyRetried) {
      handler.next(err);
      return;
    }

    final token = await _refreshOnce();
    if (token == null) {
      await _onSignedOut();
      handler.next(err);
      return;
    }

    // Retry exactly once. The flag is what stops a refresh loop when the new
    // token is also rejected.
    final options = err.requestOptions
      ..headers['Authorization'] = 'Bearer $token'
      ..extra['__retried__'] = true;

    try {
      final dio = Dio(BaseOptions(baseUrl: options.baseUrl));
      handler.resolve(await dio.fetch<dynamic>(options));
    } on DioException catch (e) {
      handler.next(e);
    }
  }

  Future<String?> _refreshOnce() {
    // Every caller awaits the same future, so one refresh serves all of them.
    return _inFlightRefresh ??= _doRefresh().whenComplete(() {
      _inFlightRefresh = null;
    });
  }

  Future<String?> _doRefresh() async {
    final refreshToken = await _store.readRefreshToken();
    if (refreshToken == null) return null;
    final fresh = await _refresh(refreshToken);
    _accessToken = fresh;
    return fresh;
  }
}
