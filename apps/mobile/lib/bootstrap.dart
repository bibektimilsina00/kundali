library;

import 'dart:async';

import 'package:flutter/widgets.dart';
import 'package:nakhatra/app/di.dart';

/// Single entry point for startup, wrapped in a guarded zone so an async error
/// during DI surfaces instead of vanishing.
Future<void> bootstrap(Widget Function() builder) async {
  await runZonedGuarded(
    () async {
      WidgetsFlutterBinding.ensureInitialized();

      FlutterError.onError = (details) {
        FlutterError.presentError(details);
        // Phase 3: forward to crash reporting. Never log birth data (rule 9).
      };

      await configureDependencies(
        apiBaseUrl: const String.fromEnvironment(
          'API_BASE_URL',
          defaultValue: 'http://localhost:8000',
        ),
      );

      runApp(builder());
    },
    (error, stack) => debugPrint('Uncaught: $error\n$stack'),
  );
}
