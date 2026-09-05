library;

import 'package:equatable/equatable.dart';

enum TimeAccuracy { exact, approximate, unknown }

class BirthDetails extends Equatable {
  const BirthDetails({
    required this.name,
    required this.localDateTime,
    required this.timeZoneName,
    required this.latitude,
    required this.longitude,
    required this.placeLabel,
    this.timeAccuracy = TimeAccuracy.exact,
  });

  final String name;

  /// Local wall-clock time at the birthplace. Must be constructed *without* a
  /// zone offset — the server resolves the offset from [timeZoneName] and the
  /// date, because the offset for a place changes over time.
  final DateTime localDateTime;

  /// IANA zone name, e.g. "Asia/Kathmandu". Never a UTC offset: Kathmandu ran
  /// +5:41:16, then +5:30, then +5:45 from 1986, and sending a fixed offset
  /// puts a 1975 birth fifteen minutes out — about 3.75 degrees of ascendant.
  /// See docs/astrology-methodology.md.
  final String timeZoneName;

  final double latitude;
  final double longitude;
  final String placeLabel;
  final TimeAccuracy timeAccuracy;

  @override
  List<Object?> get props => [
        name,
        localDateTime,
        timeZoneName,
        latitude,
        longitude,
        placeLabel,
        timeAccuracy,
      ];
}
