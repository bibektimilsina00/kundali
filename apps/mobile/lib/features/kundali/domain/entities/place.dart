/// A birthplace with the three things the engine actually needs.
///
/// Stand-in for real place search. Phase 1 replaces the preset list with a
/// geocoder that resolves a typed place name to lat/lon **and its IANA zone**;
/// the shape here is what that must return, so the swap is local.
///
/// The zone is the part that matters and the part a naive geocoder gets wrong:
/// most return a UTC offset for "now", which is exactly the value that
/// silently corrupts a historical chart.
library;

import 'package:equatable/equatable.dart';

class Place extends Equatable {
  const Place({
    required this.label,
    required this.latitude,
    required this.longitude,
    required this.timeZoneName,
  });

  final String label;
  final double latitude;
  final double longitude;
  final String timeZoneName;

  @override
  List<Object?> get props => [label, latitude, longitude, timeZoneName];
}

const presetPlaces = <Place>[
  Place(label: 'Kathmandu, Nepal', latitude: 27.7172, longitude: 85.3240, timeZoneName: 'Asia/Kathmandu'),
  Place(label: 'Pokhara, Nepal', latitude: 28.2096, longitude: 83.9856, timeZoneName: 'Asia/Kathmandu'),
  Place(label: 'Biratnagar, Nepal', latitude: 26.4525, longitude: 87.2718, timeZoneName: 'Asia/Kathmandu'),
  Place(label: 'New Delhi, India', latitude: 28.6139, longitude: 77.2090, timeZoneName: 'Asia/Kolkata'),
  Place(label: 'Mumbai, India', latitude: 19.0760, longitude: 72.8777, timeZoneName: 'Asia/Kolkata'),
  Place(label: 'Kolkata, India', latitude: 22.5726, longitude: 88.3639, timeZoneName: 'Asia/Kolkata'),
  Place(label: 'Bengaluru, India', latitude: 12.9716, longitude: 77.5946, timeZoneName: 'Asia/Kolkata'),
  Place(label: 'London, UK', latitude: 51.5074, longitude: -0.1278, timeZoneName: 'Europe/London'),
  Place(label: 'New York, USA', latitude: 40.7128, longitude: -74.0060, timeZoneName: 'America/New_York'),
  Place(label: 'Sydney, Australia', latitude: -33.8688, longitude: 151.2093, timeZoneName: 'Australia/Sydney'),
];
