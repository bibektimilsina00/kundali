/// Offline cache for the chart.
///
/// A chart derives from birth data that never changes, so a stale read is
/// *correct*, not a degradation — the chart opens instantly and works on a
/// train. Only `engine_version` can invalidate it, and the server owns that.
///
/// Backed by secure storage for now: one JSON blob derived from sensitive birth
/// data, and no new dependency.
///
/// Known ceiling: keychain and encryptedSharedPreferences are built for small
/// secrets, not ~30KB documents. This holds for one chart and will not hold for
/// horoscope history. Move to drift — app-private, sandboxed, queryable — at
/// whichever comes first: Phase 3's offline horoscopes, or a second cached
/// document. Not before; one blob does not justify a database
/// (docs/mobile.md §10).
library;

import 'dart:convert';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:nakhatra/features/kundali/data/models/kundali_dto.dart';

abstract interface class KundaliLocalDataSource {
  Future<KundaliDto?> read();
  Future<void> write(KundaliDto dto);
  Future<void> clear();
}

final class KundaliLocalDataSourceImpl implements KundaliLocalDataSource {
  const KundaliLocalDataSourceImpl(this._storage);
  final FlutterSecureStorage _storage;

  static const _key = 'kundali_chart_v1';

  @override
  Future<KundaliDto?> read() async {
    final raw = await _storage.read(key: _key);
    if (raw == null) return null;
    try {
      return KundaliDto.fromJson(jsonDecode(raw) as Map<String, dynamic>);
    } on Object {
      // A cache written by an older build can fail to parse. Drop it and
      // refetch — never let a stale cache brick the screen.
      await clear();
      return null;
    }
  }

  @override
  Future<void> write(KundaliDto dto) =>
      _storage.write(key: _key, value: jsonEncode(dto.toJson()));

  @override
  Future<void> clear() => _storage.delete(key: _key);
}
