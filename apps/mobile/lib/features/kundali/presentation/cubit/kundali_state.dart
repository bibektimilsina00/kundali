library;

import 'package:equatable/equatable.dart';
import 'package:nakhatra/core/error/failure.dart';
import 'package:nakhatra/features/kundali/domain/entities/kundali.dart';

/// Sealed, so the widget layer switches exhaustively and a new state produces
/// a compile error rather than a blank screen.
///
/// Deliberately NOT `{bool isLoading, Kundali? data, Failure? error}` — that
/// shape makes `loading && error != null && data == null` representable, and
/// something eventually produces it (docs/mobile.md §6).
sealed class KundaliState extends Equatable {
  const KundaliState();

  @override
  List<Object?> get props => [];
}

final class KundaliInitial extends KundaliState {
  const KundaliInitial();
}

final class KundaliLoading extends KundaliState {
  const KundaliLoading();
}

final class KundaliLoaded extends KundaliState {
  const KundaliLoaded(this.kundali, {this.isRefreshing = false});

  final Kundali kundali;

  /// A refresh in flight over already-displayed data. Distinct from
  /// [KundaliLoading], which means there is nothing to show yet.
  final bool isRefreshing;

  KundaliLoaded copyWith({bool? isRefreshing}) =>
      KundaliLoaded(kundali, isRefreshing: isRefreshing ?? this.isRefreshing);

  @override
  List<Object?> get props => [kundali, isRefreshing];
}

final class KundaliFailed extends KundaliState {
  const KundaliFailed(this.failure);
  final Failure failure;

  @override
  List<Object?> get props => [failure];
}
