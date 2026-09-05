library;

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:kundali/app/di.dart';
import 'package:kundali/features/kundali/presentation/cubit/kundali_cubit.dart';
import 'package:kundali/features/kundali/presentation/pages/kundali_page.dart';

/// One router config. Splitting navigation per feature is harder to reason
/// about than a single file until that file gets long (docs/mobile.md §10).
GoRouter buildRouter() => GoRouter(
      initialLocation: '/kundali',
      routes: [
        GoRoute(
          path: '/kundali',
          builder: (context, state) => BlocProvider(
            create: (_) => getIt<KundaliCubit>(),
            child: const KundaliPage(),
          ),
        ),
        // Phase 1 adds /onboarding and /auth with a redirect guard;
        // Phase 2 adds /ask. Added with the features, not before.
      ],
      errorBuilder: (context, state) => Scaffold(
        body: Center(child: Text('No route for ${state.uri}')),
      ),
    );
