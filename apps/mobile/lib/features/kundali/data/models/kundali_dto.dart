/// Wire shape. Mirrors the API's chart JSON exactly, including its naming.
///
/// **Hand-written for now, generated later.** Once `contracts/openapi.json`
/// exists (Phase 1, see docs/architecture.md §7), this file is replaced by
/// generator output and deleted. The mapper next door is what makes that swap
/// cheap: nothing outside `data/` knows these classes exist.
library;

class KundaliDto {
  const KundaliDto({
    required this.lagnaSign,
    required this.lagnaDegree,
    required this.engineVersion,
    required this.planets,
    required this.houses,
    required this.dashaPeriods,
  });

  final String lagnaSign;
  final double lagnaDegree;
  final String engineVersion;
  final List<PlanetDto> planets;
  final List<HouseDto> houses;
  final List<DashaPeriodDto> dashaPeriods;

  factory KundaliDto.fromJson(Map<String, dynamic> json) => KundaliDto(
        lagnaSign: json['lagna_sign'] as String,
        lagnaDegree: (json['lagna_degree'] as num).toDouble(),
        engineVersion: json['engine_version'] as String,
        planets: _list(json['planets'], PlanetDto.fromJson),
        houses: _list(json['houses'], HouseDto.fromJson),
        dashaPeriods: _list(
          (json['dasha'] as Map<String, dynamic>?)?['periods'],
          DashaPeriodDto.fromJson,
        ),
      );

  Map<String, dynamic> toJson() => {
        'lagna_sign': lagnaSign,
        'lagna_degree': lagnaDegree,
        'engine_version': engineVersion,
        'planets': [for (final p in planets) p.toJson()],
        'houses': [for (final h in houses) h.toJson()],
        'dasha': {'periods': [for (final d in dashaPeriods) d.toJson()]},
      };
}

class PlanetDto {
  const PlanetDto({
    required this.name,
    required this.sign,
    required this.degreeInSign,
    required this.house,
    required this.nakshatra,
    required this.pada,
    required this.nakshatraLord,
    required this.retrograde,
    required this.combust,
    required this.dignity,
  });

  final String name;
  final String sign;
  final double degreeInSign;
  final int house;
  final String nakshatra;
  final int pada;
  final String nakshatraLord;
  final bool retrograde;
  final bool combust;

  /// Null for the nodes. Also null if the server sends a dignity this build has
  /// never heard of — see the mapper.
  final String? dignity;

  factory PlanetDto.fromJson(Map<String, dynamic> json) {
    final nak = (json['nakshatra'] as Map<String, dynamic>?) ?? const {};
    return PlanetDto(
      name: json['name'] as String,
      sign: json['sign'] as String,
      degreeInSign: (json['degree_in_sign'] as num).toDouble(),
      house: json['house'] as int,
      nakshatra: nak['name'] as String? ?? '',
      pada: nak['pada'] as int? ?? 0,
      nakshatraLord: nak['lord'] as String? ?? '',
      retrograde: json['retrograde'] as bool? ?? false,
      combust: json['combust'] as bool? ?? false,
      dignity: json['dignity'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'name': name,
        'sign': sign,
        'degree_in_sign': degreeInSign,
        'house': house,
        'nakshatra': {'name': nakshatra, 'pada': pada, 'lord': nakshatraLord},
        'retrograde': retrograde,
        'combust': combust,
        'dignity': dignity,
      };
}

class HouseDto {
  const HouseDto({
    required this.number,
    required this.sign,
    required this.lord,
    required this.occupants,
  });

  final int number;
  final String sign;
  final String lord;
  final List<String> occupants;

  factory HouseDto.fromJson(Map<String, dynamic> json) => HouseDto(
        number: json['number'] as int,
        sign: json['sign'] as String,
        lord: json['lord'] as String,
        occupants: [
          for (final o in (json['occupants'] as List<dynamic>? ?? const []))
            o as String,
        ],
      );

  Map<String, dynamic> toJson() => {
        'number': number,
        'sign': sign,
        'lord': lord,
        'occupants': occupants,
      };
}

class DashaPeriodDto {
  const DashaPeriodDto({
    required this.lord,
    required this.start,
    required this.end,
    required this.level,
    required this.children,
  });

  final String lord;
  final String start; // ISO date
  final String end;
  final int level;
  final List<DashaPeriodDto> children;

  factory DashaPeriodDto.fromJson(Map<String, dynamic> json) => DashaPeriodDto(
        lord: json['lord'] as String,
        start: json['start'] as String,
        end: json['end'] as String,
        level: json['level'] as int,
        children: _list(json['children'], DashaPeriodDto.fromJson),
      );

  Map<String, dynamic> toJson() => {
        'lord': lord,
        'start': start,
        'end': end,
        'level': level,
        'children': [for (final c in children) c.toJson()],
      };
}

List<T> _list<T>(Object? raw, T Function(Map<String, dynamic>) parse) {
  if (raw is! List) return const [];
  return [
    for (final item in raw)
      if (item is Map<String, dynamic>) parse(item),
  ];
}
