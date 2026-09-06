library;

import 'package:flutter/material.dart';
import 'package:nakhatra/features/kundali/domain/entities/kundali.dart';

/// Deliberately plain. The North Indian chart is a CustomPainter and is real
/// standalone work; this list proves the layer contract end to end without it.
class PlanetList extends StatelessWidget {
  const PlanetList({required this.kundali, super.key});

  final Kundali kundali;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return ListView.separated(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.symmetric(vertical: 8),
      itemCount: kundali.planets.length + 1,
      separatorBuilder: (_, __) => const Divider(height: 1),
      itemBuilder: (context, index) {
        if (index == 0) {
          return ListTile(
            title: Text('Lagna: ${kundali.lagnaSign}', style: theme.textTheme.titleMedium),
            subtitle: Text('${kundali.lagnaDegree.toStringAsFixed(2)}°'),
          );
        }
        final planet = kundali.planets[index - 1];
        return ListTile(
          title: Text(planet.name),
          subtitle: Text(
            '${planet.sign} ${planet.degreeInSign.toStringAsFixed(2)}°  ·  '
            'House ${planet.house}  ·  ${planet.nakshatra.name} '
            '(pada ${planet.nakshatra.pada})',
          ),
          trailing: Wrap(
            spacing: 4,
            children: [
              if (planet.isRetrograde) const _Chip('R'),
              if (planet.isCombust) const _Chip('C'),
              // dignity is null for Rahu/Ketu by design — render the absence.
              if (planet.dignity != null) _Chip(planet.dignity!.name),
            ],
          ),
        );
      },
    );
  }
}

class _Chip extends StatelessWidget {
  const _Chip(this.label);
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.secondaryContainer,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(label, style: Theme.of(context).textTheme.labelSmall),
    );
  }
}
