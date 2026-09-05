library;

import 'package:flutter/material.dart';

/// Placeholder. The real direction is dark/premium with restrained celestial
/// accents (spec §81) and belongs with the first real screens, not here.
ThemeData buildTheme() => ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: const Color(0xFF3B2E5A),
        brightness: Brightness.dark,
      ),
    );
