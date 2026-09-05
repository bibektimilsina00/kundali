library;

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:kundali/app/router.dart';
import 'package:kundali/app/theme/app_theme.dart';

class KundaliApp extends StatefulWidget {
  const KundaliApp({super.key});

  @override
  State<KundaliApp> createState() => _KundaliAppState();
}

class _KundaliAppState extends State<KundaliApp> {
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
