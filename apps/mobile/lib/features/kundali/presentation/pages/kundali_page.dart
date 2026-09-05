library;

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:kundali/features/kundali/presentation/cubit/kundali_cubit.dart';
import 'package:kundali/features/kundali/presentation/pages/birth_details_page.dart';
import 'package:kundali/features/kundali/presentation/cubit/kundali_state.dart';
import 'package:kundali/features/kundali/presentation/widgets/planet_list.dart';

class KundaliPage extends StatelessWidget {
  const KundaliPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Kundali'),
        actions: [
          BlocBuilder<KundaliCubit, KundaliState>(
            builder: (context, state) => state is KundaliLoaded
                ? IconButton(
                    tooltip: 'New chart',
                    icon: const Icon(Icons.refresh),
                    onPressed: context.read<KundaliCubit>().reset,
                  )
                : const SizedBox.shrink(),
          ),
        ],
      ),
      body: BlocBuilder<KundaliCubit, KundaliState>(
        builder: (context, state) {
          // Exhaustive: adding a state without handling it will not compile.
          return switch (state) {
            KundaliInitial() => const BirthDetailsForm(),
            KundaliLoading() => const Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    CircularProgressIndicator(),
                    SizedBox(height: 16),
                    Text('Calculating your birth chart...'),
                  ],
                ),
              ),
            KundaliFailed(failure: final failure) => _ErrorView(
                message: failure.message,
                onRetry: context.read<KundaliCubit>().reset,
              ),
            KundaliLoaded(kundali: final kundali, isRefreshing: final refreshing) =>
              RefreshIndicator(
                onRefresh: context.read<KundaliCubit>().refresh,
                child: Stack(
                  children: [
                    PlanetList(kundali: kundali),
                    if (refreshing)
                      const LinearProgressIndicator(minHeight: 2),
                  ],
                ),
              ),
          };
        },
      ),
    );
  }
}

class _ErrorView extends StatelessWidget {
  const _ErrorView({required this.message, required this.onRetry});

  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(message, textAlign: TextAlign.center),
            const SizedBox(height: 16),
            FilledButton(onPressed: onRetry, child: const Text('Back')),
          ],
        ),
      ),
    );
  }
}
