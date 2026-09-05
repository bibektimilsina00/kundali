/// Mapper tests matter more than they look: this is where a regenerated DTO
/// silently changes meaning.
///
/// The fixture is a **real captured response** from the running API
/// (`apps/api`, POST /v1/kundali, 1975-06-15 08:30 Asia/Kathmandu), not a
/// hand-built DTO. A hand-built one encodes our assumption about the server;
/// a captured one encodes the server's actual behaviour (docs/mobile.md §10).
///
/// Recapture after any API change:
///   cd apps/api && make serve
///   curl -s -X POST localhost:8000/v1/kundali -H 'Content-Type: application/json' \
///     -d @../mobile/test/fixtures/chart_request.json \
///     > ../mobile/test/fixtures/chart_response.json
library;

import 'dart:convert';
import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:kundali/features/kundali/data/mappers/kundali_mapper.dart';
import 'package:kundali/features/kundali/data/models/kundali_dto.dart';
import 'package:kundali/features/kundali/domain/entities/kundali.dart';

Map<String, dynamic> _fixture() => jsonDecode(
      File('test/fixtures/chart_response.json').readAsStringSync(),
    ) as Map<String, dynamic>;

void main() {
  group('captured API response -> Kundali', () {
    late Map<String, dynamic> json;
    late Kundali kundali;

    setUp(() {
      json = _fixture();
      kundali = KundaliDto.fromJson(json).toEntity();
    });

    test('parses the real payload end to end', () {
      expect(kundali.lagnaSign, 'Cancer');
      expect(kundali.planets, hasLength(9));
      expect(kundali.engineVersion, isNotEmpty);
    });

    test('flattens the nested nakshatra object', () {
      final moon = kundali.planetNamed('Moon')!;
      expect(moon.nakshatra.name, isNotEmpty);
      expect(moon.nakshatra.pada, inInclusiveRange(1, 4));
      expect(moon.nakshatra.lord, isNotEmpty);
    });

    test('preserves retrograde and combust flags', () {
      // Mercury is retrograde and combust in this chart — 6.5 deg from the Sun,
      // inside its 12 deg retrograde orb.
      final mercury = kundali.planetNamed('Mercury')!;
      expect(mercury.isRetrograde, isTrue);
      expect(mercury.isCombust, isTrue);
    });

    test('a node has no dignity, and that is not an error', () {
      expect(kundali.planetNamed('Rahu')!.dignity, isNull);
      expect(kundali.planetNamed('Ketu')!.dignity, isNull);
      expect(kundali.planetNamed('Sun')!.dignity, isNotNull);
    });

    test('every dignity the server sends is one this build understands', () {
      // Guards against the mapper silently swallowing a real value as "unknown".
      for (final planet in kundali.planets) {
        final raw = (json['planets'] as List)
            .cast<Map<String, dynamic>>()
            .firstWhere((p) => p['name'] == planet.name)['dignity'];
        if (raw != null) {
          expect(planet.dignity, isNotNull,
              reason: 'server sent dignity "$raw" and the mapper dropped it');
        }
      }
    });

    test('parses the dasha tree with its levels', () {
      final maha = kundali.dashaPeriods.first;
      expect(maha.level, 1);
      expect(maha.children, isNotEmpty);
      expect(maha.children.first.level, 2);
    });

    test('the API default is two dasha levels', () {
      // Measured: three levels is 819 periods / ~78KB, two is 90 / ~10KB.
      expect(kundali.dashaPeriods.first.children.first.children, isEmpty);
    });

    test('dasha periods are contiguous', () {
      final periods = kundali.dashaPeriods;
      for (var i = 0; i < periods.length - 1; i++) {
        expect(periods[i].end, periods[i + 1].start);
      }
    });

    test('current dasha chain resolves to the deepest covering period', () {
      final chain = kundali.currentDashaChain(DateTime(1980));
      expect(chain.map((p) => p.level), [1, 2]);
    });
  });

  group('forward compatibility', () {
    /// The API's policy allows adding enum values within /v1
    /// (docs/architecture.md §7). An App Store build lives for months, so an
    /// unknown value must degrade, never throw.
    test('an unknown dignity maps to null instead of throwing', () {
      final json = _fixture();
      final planets = (json['planets'] as List).cast<Map<String, dynamic>>();
      planets[0]['dignity'] = 'adhimitra'; // a value this build never heard of

      final planet = KundaliDto.fromJson(json).toEntity().planets.first;
      expect(planet.dignity, isNull);
      expect(planet.name, planets[0]['name']); // the rest still maps
    });

    test('an added response field does not break parsing', () {
      final json = _fixture()..['some_future_field'] = {'a': 1};
      expect(() => KundaliDto.fromJson(json).toEntity(), returnsNormally);
    });

    test('a missing optional list does not throw', () {
      final json = _fixture()..remove('houses');
      expect(KundaliDto.fromJson(json).toEntity().houses, isEmpty);
    });
  });
}
