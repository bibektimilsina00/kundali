/// Tokens only, and only here.
///
/// flutter_secure_storage, never SharedPreferences: the latter is plaintext on
/// disk and readable from a rooted device or an iTunes backup. Birth data is
/// sensitive too, but it lives in the API and the offline cache, not here.
library;

import 'package:flutter_secure_storage/flutter_secure_storage.dart';

abstract interface class SecureStore {
  Future<String?> readRefreshToken();
  Future<void> writeRefreshToken(String token);
  Future<void> clear();
}

final class FlutterSecureStore implements SecureStore {
  const FlutterSecureStore(this._storage);

  final FlutterSecureStorage _storage;

  static const _refreshKey = 'refresh_token';

  @override
  Future<String?> readRefreshToken() => _storage.read(key: _refreshKey);

  @override
  Future<void> writeRefreshToken(String token) =>
      _storage.write(key: _refreshKey, value: token);

  @override
  Future<void> clear() => _storage.deleteAll();
}
