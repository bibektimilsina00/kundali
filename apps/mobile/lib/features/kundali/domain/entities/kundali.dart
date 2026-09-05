/// Plain Dart. No JSON, no Flutter, no dio.
///
/// This is what a Kundali *is*, independent of how the API happens to
/// serialise it this month. The DTO -> entity mapper is the firebreak that
/// keeps a regenerated client from rippling into the UI (docs/mobile.md §1).
library;

import 'package:equatable/equatable.dart';

enum Dignity { exalted, debilitated, moolatrikona, own, friend, neutral, enemy }

class Nakshatra extends Equatable {
  const Nakshatra({
    required this.name,
    required this.pada,
    required this.lord,
  });

  final String name;
  final int pada;
  final String lord;

  @override
  List<Object?> get props => [name, pada, lord];
}

class Planet extends Equatable {
  const Planet({
    required this.name,
    required this.sign,
    required this.degreeInSign,
    required this.house,
    required this.nakshatra,
    required this.isRetrograde,
    required this.isCombust,
    this.dignity,
  });

  final String name;
  final String sign;
  final double degreeInSign;
  final int house;
  final Nakshatra nakshatra;
  final bool isRetrograde;
  final bool isCombust;

  /// Null for Rahu and Ketu — classical sources disagree, so the engine
  /// declines to invent one. The UI must render the absence, not a default.
  final Dignity? dignity;

  @override
  List<Object?> get props =>
      [name, sign, degreeInSign, house, nakshatra, isRetrograde, isCombust, dignity];
}

class House extends Equatable {
  const House({
    required this.number,
    required this.sign,
    required this.lord,
    required this.occupants,
  });

  final int number;
  final String sign;
  final String lord;
  final List<String> occupants;

  @override
  List<Object?> get props => [number, sign, lord, occupants];
}

class DashaPeriod extends Equatable {
  const DashaPeriod({
    required this.lord,
    required this.start,
    required this.end,
    required this.level,
    this.children = const [],
  });

  final String lord;
  final DateTime start;
  final DateTime end;
  final int level; // 1 maha, 2 antar, 3 pratyantar
  final List<DashaPeriod> children;

  bool contains(DateTime when) => !when.isBefore(start) && when.isBefore(end);

  /// Chain from mahadasha down to the deepest period covering [when].
  List<DashaPeriod> chainAt(DateTime when) {
    if (!contains(when)) return const [];
    for (final child in children) {
      final deeper = child.chainAt(when);
      if (deeper.isNotEmpty) return [this, ...deeper];
    }
    return [this];
  }

  @override
  List<Object?> get props => [lord, start, end, level, children];
}

class Kundali extends Equatable {
  const Kundali({
    required this.lagnaSign,
    required this.lagnaDegree,
    required this.planets,
    required this.houses,
    required this.dashaPeriods,
    required this.engineVersion,
  });

  final String lagnaSign;
  final double lagnaDegree;
  final List<Planet> planets;
  final List<House> houses;
  final List<DashaPeriod> dashaPeriods;

  /// Bumped by the backend whenever a calculation rule changes. Surfacing it
  /// makes "why did my chart change?" answerable.
  final String engineVersion;

  Planet? planetNamed(String name) {
    for (final planet in planets) {
      if (planet.name == name) return planet;
    }
    return null;
  }

  List<DashaPeriod> currentDashaChain(DateTime now) {
    for (final maha in dashaPeriods) {
      final chain = maha.chainAt(now);
      if (chain.isNotEmpty) return chain;
    }
    return const [];
  }

  @override
  List<Object?> get props =>
      [lagnaSign, lagnaDegree, planets, houses, dashaPeriods, engineVersion];
}
