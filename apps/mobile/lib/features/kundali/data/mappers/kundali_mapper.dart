/// DTO -> entity. The firebreak.
///
/// Also where forward-compatibility lives: the API's compatibility policy
/// allows adding enum values within /v1 (docs/architecture.md §7), so an old
/// build **must** treat an unknown dignity as "no dignity" rather than
/// crashing. Every new dosha type shipping a client crash is exactly the
/// failure that policy exists to prevent.
library;

import 'package:kundali/features/kundali/data/models/kundali_dto.dart';
import 'package:kundali/features/kundali/domain/entities/kundali.dart';

extension KundaliDtoMapper on KundaliDto {
  Kundali toEntity() => Kundali(
        lagnaSign: lagnaSign,
        lagnaDegree: lagnaDegree,
        engineVersion: engineVersion,
        planets: [for (final p in planets) p.toEntity()],
        houses: [for (final h in houses) h.toEntity()],
        dashaPeriods: [for (final d in dashaPeriods) d.toEntity()],
      );
}

extension PlanetDtoMapper on PlanetDto {
  Planet toEntity() => Planet(
        name: name,
        sign: sign,
        degreeInSign: degreeInSign,
        house: house,
        nakshatra: Nakshatra(name: nakshatra, pada: pada, lord: nakshatraLord),
        isRetrograde: retrograde,
        isCombust: combust,
        dignity: _dignity(dignity),
      );
}

extension HouseDtoMapper on HouseDto {
  House toEntity() =>
      House(number: number, sign: sign, lord: lord, occupants: occupants);
}

extension DashaPeriodDtoMapper on DashaPeriodDto {
  DashaPeriod toEntity() => DashaPeriod(
        lord: lord,
        start: DateTime.parse(start),
        end: DateTime.parse(end),
        level: level,
        children: [for (final c in children) c.toEntity()],
      );
}

/// Unknown value -> null, never an exception. Forward compatibility is a
/// requirement, not a nicety: an App Store build lives for months.
Dignity? _dignity(String? raw) => switch (raw) {
      'exalted' => Dignity.exalted,
      'debilitated' => Dignity.debilitated,
      'moolatrikona' => Dignity.moolatrikona,
      'own' => Dignity.own,
      'friend' => Dignity.friend,
      'neutral' => Dignity.neutral,
      'enemy' => Dignity.enemy,
      _ => null,
    };
