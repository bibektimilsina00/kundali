library;

import 'package:nakhatra/app/app.dart';
import 'package:nakhatra/bootstrap.dart';

/// Run against a non-default backend with:
///   flutter run --dart-define=API_BASE_URL=https://api.example.com
Future<void> main() => bootstrap(KundaliApp.new);
