// Enforces the dependency rule from docs/mobile.md §2.
//
// Deliberately a plain dart:io script with no package dependency: it is the
// build's guard, so it must not itself be able to break the build. Same
// principle as apps/api's import-linter contracts — a boundary nothing checks
// is a boundary that erodes.
//
//   dart run tool/check_layers.dart
//   dart run tool/check_layers.dart --self-test
//
// The self-test exists because the first version of this file had two rules
// that could never fire: they matched on '/lib/core/' while listSync() yields
// 'lib/core/...'. Both reported OK forever. A guard that cannot fail is worse
// than no guard, because you trust it.

import 'dart:io';

final class _Rule {
  const _Rule(
    this.name, {
    required this.pathContains,
    required this.forbidden,
    required this.why,
  });

  final String name;
  final String pathContains;
  final List<String> forbidden;
  final String why;
}

// Path fragments deliberately carry no leading slash: listSync() returns
// repo-relative paths, and an absolute path contains these fragments too.
const _rules = <_Rule>[
  _Rule(
    'domain_is_pure',
    pathContains: '/domain/',
    forbidden: [
      'package:flutter/',
      'package:flutter_bloc/',
      'package:dio/',
      'package:flutter_secure_storage/',
      'package:get_it/',
      '/data/',
      '/presentation/',
      'package:nakhatra/api/',
    ],
    why: 'domain must run under plain `dart test` with no Flutter binding',
  ),
  _Rule(
    'presentation_never_touches_data',
    pathContains: '/presentation/',
    forbidden: ['/data/', 'package:nakhatra/api/'],
    why: 'a Cubit importing a DTO or datasource is how clean architecture '
        'quietly collapses — it still compiles, it just stops being clean',
  ),
  _Rule(
    'core_knows_no_features',
    pathContains: 'lib/core/',
    forbidden: ['package:nakhatra/features/'],
    why: 'features import core; core must never import one back',
  ),
];

const _featureRoot = 'package:nakhatra/features/';
const _featureDir = 'lib/features/';

/// Pure: the whole point is that --self-test can drive it.
List<String> violationsFor(String path, List<String> imports) {
  final out = <String>[];

  for (final rule in _rules) {
    if (!path.contains(rule.pathContains)) continue;
    for (final line in imports) {
      for (final banned in rule.forbidden) {
        if (line.contains(banned)) {
          out.add('[${rule.name}] $path\n    $line\n    why: ${rule.why}');
        }
      }
    }
  }

  // Derived rather than enumerated, so a new feature is covered the moment it
  // exists instead of when someone remembers to add it here.
  final owner = _featureOf(path);
  if (owner != null) {
    for (final line in imports) {
      final imported = _importedFeature(line);
      if (imported != null && imported != owner) {
        out.add('[features_are_islands] $path\n    $line\n'
            '    why: features are islands; shared concerns go to core/');
      }
    }
  }
  return out;
}

String? _featureOf(String path) {
  final i = path.indexOf(_featureDir);
  if (i == -1) return null;
  final rest = path.substring(i + _featureDir.length);
  final slash = rest.indexOf('/');
  return slash == -1 ? null : rest.substring(0, slash);
}

String? _importedFeature(String importLine) {
  final i = importLine.indexOf(_featureRoot);
  if (i == -1) return null;
  final rest = importLine.substring(i + _featureRoot.length);
  final slash = rest.indexOf('/');
  return slash == -1 ? null : rest.substring(0, slash);
}

void main(List<String> args) {
  if (args.contains('--self-test')) {
    _selfTest();
    return;
  }

  final lib = Directory('lib');
  if (!lib.existsSync()) {
    stderr.writeln('run this from apps/mobile');
    exit(2);
  }

  final violations = <String>[];
  for (final entity in lib.listSync(recursive: true)) {
    if (entity is! File || !entity.path.endsWith('.dart')) continue;
    final path = entity.path.replaceAll(r'\', '/');
    if (path.contains('/api/generated/')) continue; // generated; never hand-edited
    final imports = entity
        .readAsLinesSync()
        .where((l) => l.trimLeft().startsWith('import '))
        .toList();
    violations.addAll(violationsFor(path, imports));
  }

  if (violations.isEmpty) {
    stdout.writeln('layer contracts: OK');
    return;
  }
  stderr.writeln('layer contracts BROKEN (${violations.length}):\n');
  for (final v in violations) {
    stderr.writeln('$v\n');
  }
  exit(1);
}

/// Every rule must be demonstrably able to fire, and to stay quiet on the
/// legitimate case. Paths here are exactly what listSync() produces.
void _selfTest() {
  const cases = <(String, String, List<String>, bool)>[
    (
      'domain_is_pure',
      'lib/features/kundali/domain/entities/kundali.dart',
      ["import 'package:flutter/material.dart';"],
      true,
    ),
    (
      'domain_is_pure allows equatable',
      'lib/features/kundali/domain/entities/kundali.dart',
      ["import 'package:equatable/equatable.dart';"],
      false,
    ),
    (
      'presentation_never_touches_data',
      'lib/features/kundali/presentation/cubit/kundali_cubit.dart',
      ["import 'package:nakhatra/features/kundali/data/models/kundali_dto.dart';"],
      true,
    ),
    (
      'presentation may use domain',
      'lib/features/kundali/presentation/cubit/kundali_cubit.dart',
      ["import 'package:nakhatra/features/kundali/domain/usecases/get_kundali.dart';"],
      false,
    ),
    (
      'core_knows_no_features',
      'lib/core/di.dart',
      ["import 'package:nakhatra/features/kundali/domain/repositories/kundali_repository.dart';"],
      true,
    ),
    (
      'features_are_islands',
      'lib/features/horoscope/data/x.dart',
      ["import 'package:nakhatra/features/kundali/domain/entities/kundali.dart';"],
      true,
    ),
    (
      'a feature may import itself',
      'lib/features/kundali/data/repositories/kundali_repository_impl.dart',
      ["import 'package:nakhatra/features/kundali/domain/entities/kundali.dart';"],
      false,
    ),
  ];

  var failed = 0;
  for (final (name, path, imports, shouldFire) in cases) {
    final fired = violationsFor(path, imports).isNotEmpty;
    if (fired != shouldFire) {
      failed++;
      stderr.writeln(
        'SELF-TEST FAIL: "$name" expected ${shouldFire ? "a violation" : "no violation"}, got the opposite\n'
        '  path: $path\n  imports: $imports',
      );
    }
  }

  if (failed > 0) {
    stderr.writeln('\n$failed/${cases.length} self-tests failed — the guard is lying.');
    exit(1);
  }
  stdout.writeln('self-test: ${cases.length}/${cases.length} rules verified');
}
