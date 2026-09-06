library;

import 'package:nakhatra/core/result.dart';
import 'package:nakhatra/features/kundali/domain/entities/kundali.dart';
import 'package:nakhatra/features/kundali/domain/repositories/kundali_repository.dart';

/// Honest note (docs/mobile.md §10): this is currently pass-through. It is kept
/// because it is where orchestration will land — "load the chart, and if it is
/// missing, route to onboarding" is a domain decision, not a Cubit one.
/// If it is still pass-through when Phase 1 ends, inline it and record that in
/// mobile.md §10 rather than keeping ceremony out of habit.
final class GetKundali {
  const GetKundali(this._repository);
  final KundaliRepository _repository;

  Future<Result<Kundali>> call({bool forceRefresh = false}) =>
      _repository.getKundali(forceRefresh: forceRefresh);
}
