/// The repository is where offline behaviour and the exception -> Failure
/// translation live, so it is worth testing against fakes rather than mocks —
/// the fakes double as the "what does the cache actually do" documentation.
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:nakhatra/core/error/exceptions.dart';
import 'package:nakhatra/core/error/failure.dart';
import 'package:nakhatra/core/result.dart';
import 'package:nakhatra/features/kundali/data/datasources/kundali_local_datasource.dart';
import 'package:nakhatra/features/kundali/data/datasources/kundali_remote_datasource.dart';
import 'package:nakhatra/features/kundali/data/models/kundali_dto.dart';
import 'package:nakhatra/features/kundali/data/repositories/kundali_repository_impl.dart';
import 'package:nakhatra/features/kundali/domain/entities/birth_details.dart';
import 'package:nakhatra/features/kundali/domain/entities/kundali.dart';

KundaliDto _dto(String lagna) => KundaliDto(
      lagnaSign: lagna,
      lagnaDegree: 1,
      engineVersion: '0.1.0',
      planets: const [],
      houses: const [],
      dashaPeriods: const [],
    );

final class _FakeLocal implements KundaliLocalDataSource {
  KundaliDto? stored;
  int writes = 0;

  @override
  Future<KundaliDto?> read() async => stored;
  @override
  Future<void> write(KundaliDto dto) async {
    stored = dto;
    writes++;
  }

  @override
  Future<void> clear() async => stored = null;
}

final class _FakeRemote implements KundaliRemoteDataSource {
  _FakeRemote({this.result, this.error});
  KundaliDto? result;
  AppException? error;
  int fetches = 0;

  @override
  Future<KundaliDto> fetch() async {
    fetches++;
    if (error != null) throw error!;
    return result!;
  }

  @override
  Future<KundaliDto> create(BirthDetails details) async {
    if (error != null) throw error!;
    return result!;
  }
}

void main() {
  group('getKundali', () {
    test('serves the cache without touching the network', () async {
      final local = _FakeLocal()..stored = _dto('Cancer');
      final remote = _FakeRemote(result: _dto('Leo'));
      final repo = KundaliRepositoryImpl(remote, local);

      final result = await repo.getKundali();

      expect((result as Ok<Kundali>).value.lagnaSign, 'Cancer');
      expect(remote.fetches, 0, reason: 'a cached chart must not hit the API');
    });

    test('forceRefresh bypasses the cache and writes back', () async {
      final local = _FakeLocal()..stored = _dto('Cancer');
      final remote = _FakeRemote(result: _dto('Leo'));
      final repo = KundaliRepositoryImpl(remote, local);

      final result = await repo.getKundali(forceRefresh: true);

      expect((result as Ok<Kundali>).value.lagnaSign, 'Leo');
      expect(remote.fetches, 1);
      expect(local.writes, 1);
    });

    test('a failed refresh falls back to the stale chart, not an error', () async {
      // The whole point: the cached chart is still correct, just not fresh.
      // Showing an error screen instead would be a downgrade.
      final local = _FakeLocal()..stored = _dto('Cancer');
      final remote = _FakeRemote(error: const NetworkException());
      final repo = KundaliRepositoryImpl(remote, local);

      final result = await repo.getKundali(forceRefresh: true);

      expect(result, isA<Ok<Kundali>>());
      expect((result as Ok<Kundali>).value.lagnaSign, 'Cancer');
    });

    test('with no cache and no network it surfaces a Failure', () async {
      final repo = KundaliRepositoryImpl(
        _FakeRemote(error: const NetworkException()),
        _FakeLocal(),
      );

      final result = await repo.getKundali();

      expect((result as Err<Kundali>).failure, isA<NetworkFailure>());
    });

    test('translates exceptions into domain failures', () async {
      final repo = KundaliRepositoryImpl(
        _FakeRemote(error: const UnauthorizedException()),
        _FakeLocal(),
      );

      final result = await repo.getKundali();

      // AuthFailure, not UnauthorizedException: exceptions are data-layer
      // vocabulary and must not reach the Cubit.
      expect((result as Err<Kundali>).failure, isA<AuthFailure>());
    });
  });
}
