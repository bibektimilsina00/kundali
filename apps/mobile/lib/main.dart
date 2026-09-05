library;

import 'package:kundali/app/app.dart';
import 'package:kundali/bootstrap.dart';

/// Run against a non-default backend with:
///   flutter run --dart-define=API_BASE_URL=https://api.example.com
Future<void> main() => bootstrap(KundaliApp.new);
