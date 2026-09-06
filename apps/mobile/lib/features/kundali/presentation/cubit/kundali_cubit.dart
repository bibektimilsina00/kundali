library;

import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:nakhatra/core/result.dart';
import 'package:nakhatra/features/kundali/domain/entities/birth_details.dart';
import 'package:nakhatra/features/kundali/domain/usecases/create_kundali.dart';
import 'package:nakhatra/features/kundali/domain/usecases/get_kundali.dart';
import 'package:nakhatra/features/kundali/presentation/cubit/kundali_state.dart';

/// Cubit, not Bloc: load and refresh, no event concurrency worth naming.
/// `ai_astrologer` gets a Bloc because there the ordering of overlapping
/// events is a real decision (docs/mobile.md §6).
///
/// Note what is absent: no try/catch, no dio, no JSON. If any of those appear
/// here, a layer leaked.
final class KundaliCubit extends Cubit<KundaliState> {
  KundaliCubit(this._getKundali, this._createKundali)
      : super(const KundaliInitial());

  final GetKundali _getKundali;
  final CreateKundali _createKundali;

  /// Generate a chart from freshly entered birth details.
  Future<void> create(BirthDetails details) async {
    emit(const KundaliLoading());
    final result = await _createKundali(details);
    emit(switch (result) {
      Ok(value: final kundali) => KundaliLoaded(kundali),
      Err(failure: final failure) => KundaliFailed(failure),
    });
  }

  /// Back to the form. Distinct from a failed load: the user chose this.
  void reset() => emit(const KundaliInitial());

  Future<void> load() async {
    if (state is KundaliLoading) return;
    emit(const KundaliLoading());
    await _fetch(forceRefresh: false);
  }

  /// Pull-to-refresh. Keeps the current chart on screen while it runs, and
  /// keeps it on screen if the refresh fails — the displayed chart is still
  /// correct, so replacing it with an error would be a downgrade.
  Future<void> refresh() async {
    final current = state;
    if (current is! KundaliLoaded) return load();
    if (current.isRefreshing) return;
    emit(current.copyWith(isRefreshing: true));

    final result = await _getKundali(forceRefresh: true);
    emit(switch (result) {
      Ok(value: final kundali) => KundaliLoaded(kundali),
      Err() => current.copyWith(isRefreshing: false),
    });
  }

  Future<void> _fetch({required bool forceRefresh}) async {
    final result = await _getKundali(forceRefresh: forceRefresh);
    emit(switch (result) {
      Ok(value: final kundali) => KundaliLoaded(kundali),
      Err(failure: final failure) => KundaliFailed(failure),
    });
  }
}
