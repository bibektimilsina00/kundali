library;

import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:kundali/core/error/failure.dart';
import 'package:kundali/core/result.dart';
import 'package:kundali/features/kundali/domain/entities/kundali.dart';
import 'package:kundali/features/kundali/domain/repositories/kundali_repository.dart';
import 'package:kundali/features/kundali/domain/entities/birth_details.dart';
import 'package:kundali/features/kundali/domain/usecases/create_kundali.dart';
import 'package:kundali/features/kundali/domain/usecases/get_kundali.dart';
import 'package:kundali/features/kundali/presentation/cubit/kundali_cubit.dart';
import 'package:kundali/features/kundali/presentation/cubit/kundali_state.dart';

const _chart = Kundali(
  lagnaSign: 'Cancer',
  lagnaDegree: 16.77,
  planets: [],
  houses: [],
  dashaPeriods: [],
  engineVersion: '0.1.0',
);

const _other = Kundali(
  lagnaSign: 'Leo',
  lagnaDegree: 2,
  planets: [],
  houses: [],
  dashaPeriods: [],
  engineVersion: '0.1.0',
);

final class _FakeRepo implements KundaliRepository {
  _FakeRepo(this.responses);
  final List<Result<Kundali>> responses;
  int calls = 0;

  @override
  Future<Result<Kundali>> getKundali({bool forceRefresh = false}) async =>
      responses[calls++ % responses.length];

  @override
  Future<Result<Kundali>> createKundali(BirthDetails details) async =>
      responses.first;
}

KundaliCubit _cubit(List<Result<Kundali>> responses) {
  final repo = _FakeRepo(responses);
  return KundaliCubit(GetKundali(repo), CreateKundali(repo));
}

final _birth = BirthDetails(
  name: 'Test',
  localDateTime: DateTime(1975, 6, 15, 8, 30),
  timeZoneName: 'Asia/Kathmandu',
  latitude: 27.7172,
  longitude: 85.3240,
  placeLabel: 'Kathmandu, Nepal',
);

void main() {
  blocTest<KundaliCubit, KundaliState>(
    'load emits loading then loaded',
    build: () => _cubit([const Ok(_chart)]),
    act: (cubit) => cubit.load(),
    expect: () => [const KundaliLoading(), const KundaliLoaded(_chart)],
  );

  blocTest<KundaliCubit, KundaliState>(
    'load emits loading then failed',
    build: () => _cubit([const Err(NetworkFailure())]),
    act: (cubit) => cubit.load(),
    expect: () => [
      const KundaliLoading(),
      const KundaliFailed(NetworkFailure()),
    ],
  );

  blocTest<KundaliCubit, KundaliState>(
    'refresh keeps the chart on screen while it runs',
    build: () => _cubit([const Ok(_chart), const Ok(_other)]),
    act: (cubit) async {
      await cubit.load();
      await cubit.refresh();
    },
    expect: () => [
      const KundaliLoading(),
      const KundaliLoaded(_chart),
      const KundaliLoaded(_chart, isRefreshing: true),
      const KundaliLoaded(_other),
    ],
  );

  blocTest<KundaliCubit, KundaliState>(
    'a failed refresh never replaces a good chart with an error',
    build: () => _cubit([const Ok(_chart), const Err(NetworkFailure())]),
    act: (cubit) async {
      await cubit.load();
      await cubit.refresh();
    },
    expect: () => [
      const KundaliLoading(),
      const KundaliLoaded(_chart),
      const KundaliLoaded(_chart, isRefreshing: true),
      const KundaliLoaded(_chart),
    ],
    verify: (cubit) => expect(cubit.state, isA<KundaliLoaded>()),
  );

  blocTest<KundaliCubit, KundaliState>(
    'create emits loading then the generated chart',
    build: () => _cubit([const Ok(_chart)]),
    act: (cubit) => cubit.create(_birth),
    expect: () => [const KundaliLoading(), const KundaliLoaded(_chart)],
  );

  blocTest<KundaliCubit, KundaliState>(
    'a failed create surfaces the failure, not a blank screen',
    build: () => _cubit([const Err(ServerFailure('Bad birth time.'))]),
    act: (cubit) => cubit.create(_birth),
    expect: () => [
      const KundaliLoading(),
      const KundaliFailed(ServerFailure('Bad birth time.')),
    ],
  );

  blocTest<KundaliCubit, KundaliState>(
    'reset returns to the form so another chart can be entered',
    build: () => _cubit([const Ok(_chart)]),
    act: (cubit) async {
      await cubit.create(_birth);
      cubit.reset();
    },
    expect: () => [
      const KundaliLoading(),
      const KundaliLoaded(_chart),
      const KundaliInitial(),
    ],
  );

  blocTest<KundaliCubit, KundaliState>(
    'refresh before any load falls back to load',
    build: () => _cubit([const Ok(_chart)]),
    act: (cubit) => cubit.refresh(),
    expect: () => [const KundaliLoading(), const KundaliLoaded(_chart)],
  );
}
