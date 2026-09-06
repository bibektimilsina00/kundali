library;

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:nakhatra/features/kundali/domain/entities/birth_details.dart';
import 'package:nakhatra/features/kundali/domain/entities/place.dart';
import 'package:nakhatra/features/kundali/presentation/cubit/kundali_cubit.dart';

/// Lives in `kundali/`, not a separate `onboarding/` feature: one form is not
/// a feature. The multi-step welcome flow of spec §6 is what would earn its
/// own folder.
class BirthDetailsForm extends StatefulWidget {
  const BirthDetailsForm({super.key});

  @override
  State<BirthDetailsForm> createState() => _BirthDetailsFormState();
}

class _BirthDetailsFormState extends State<BirthDetailsForm> {
  final _formKey = GlobalKey<FormState>();
  final _name = TextEditingController(text: 'Test');

  DateTime _date = DateTime(1975, 6, 15);
  TimeOfDay _time = const TimeOfDay(hour: 8, minute: 30);
  Place _place = presetPlaces.first;
  TimeAccuracy _accuracy = TimeAccuracy.exact;

  @override
  void dispose() {
    _name.dispose();
    super.dispose();
  }

  void _submit() {
    if (!_formKey.currentState!.validate()) return;
    context.read<KundaliCubit>().create(
          BirthDetails(
            name: _name.text.trim(),
            // Wall-clock at the birthplace. Deliberately naive: the server
            // resolves the offset from tz_name AND the date, because the
            // offset for a place changes over time.
            localDateTime: DateTime(
              _date.year,
              _date.month,
              _date.day,
              _time.hour,
              _time.minute,
            ),
            timeZoneName: _place.timeZoneName,
            latitude: _place.latitude,
            longitude: _place.longitude,
            placeLabel: _place.label,
            timeAccuracy: _accuracy,
          ),
        );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text('Your birth details', style: theme.textTheme.headlineSmall),
            const SizedBox(height: 4),
            Text(
              'Birth time changes the ascendant, which changes every house. '
              'Exact time matters more than you would expect.',
              style: theme.textTheme.bodySmall,
            ),
            const SizedBox(height: 24),

            TextFormField(
              controller: _name,
              decoration: const InputDecoration(
                labelText: 'Name',
                border: OutlineInputBorder(),
              ),
              validator: (v) =>
                  (v == null || v.trim().isEmpty) ? 'Required' : null,
            ),
            const SizedBox(height: 16),

            _Tile(
              icon: Icons.calendar_today,
              label: 'Date of birth',
              value: '${_date.year}-${_two(_date.month)}-${_two(_date.day)}',
              onTap: () async {
                final picked = await showDatePicker(
                  context: context,
                  initialDate: _date,
                  firstDate: DateTime(1900),
                  lastDate: DateTime.now(),
                );
                if (picked != null) setState(() => _date = picked);
              },
            ),
            const SizedBox(height: 12),

            _Tile(
              icon: Icons.access_time,
              label: 'Time of birth',
              value: '${_two(_time.hour)}:${_two(_time.minute)}',
              onTap: () async {
                final picked =
                    await showTimePicker(context: context, initialTime: _time);
                if (picked != null) setState(() => _time = picked);
              },
            ),
            const SizedBox(height: 16),

            DropdownButtonFormField<Place>(
              initialValue: _place,
              isExpanded: true,
              decoration: const InputDecoration(
                labelText: 'Place of birth',
                border: OutlineInputBorder(),
              ),
              items: [
                for (final place in presetPlaces)
                  DropdownMenuItem(value: place, child: Text(place.label)),
              ],
              onChanged: (p) => setState(() => _place = p ?? _place),
            ),
            const SizedBox(height: 6),
            Text(
              'Zone: ${_place.timeZoneName}  ·  '
              '${_place.latitude.toStringAsFixed(4)}, '
              '${_place.longitude.toStringAsFixed(4)}',
              style: theme.textTheme.bodySmall,
            ),
            const SizedBox(height: 20),

            Text('How accurate is the time?', style: theme.textTheme.labelLarge),
            const SizedBox(height: 8),
            SegmentedButton<TimeAccuracy>(
              segments: const [
                ButtonSegment(value: TimeAccuracy.exact, label: Text('Exact')),
                ButtonSegment(
                    value: TimeAccuracy.approximate, label: Text('Approx')),
                ButtonSegment(
                    value: TimeAccuracy.unknown, label: Text('Not sure')),
              ],
              selected: {_accuracy},
              onSelectionChanged: (s) => setState(() => _accuracy = s.first),
            ),
            const SizedBox(height: 28),

            FilledButton(
              onPressed: _submit,
              style: FilledButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
              child: const Text('Create my Kundali'),
            ),
          ],
        ),
      ),
    );
  }

  String _two(int n) => n.toString().padLeft(2, '0');
}

class _Tile extends StatelessWidget {
  const _Tile({
    required this.icon,
    required this.label,
    required this.value,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final String value;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return OutlinedButton(
      onPressed: onTap,
      style: OutlinedButton.styleFrom(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 18),
        alignment: Alignment.centerLeft,
      ),
      child: Row(
        children: [
          Icon(icon, size: 20),
          const SizedBox(width: 12),
          Text(label),
          const Spacer(),
          Text(value, style: Theme.of(context).textTheme.titleMedium),
        ],
      ),
    );
  }
}
