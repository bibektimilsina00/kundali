library;

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:nakhatra/app/router.dart';
import 'package:nakhatra/app/theme/app_theme.dart';

class NakhatraApp extends StatefulWidget {
  const NakhatraApp({super.key});

  @override
  State<NakhatraApp> createState() => _NakhatraAppState();
}

class _NakhatraAppState extends State<NakhatraApp> {
  // Built once: rebuilding a GoRouter drops navigation state.
  late final GoRouter _router = buildRouter();

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Kundali',
      theme: buildTheme(),
      routerConfig: _router,
      debugShowCheckedModeBanner: false,
    );
  }
}
