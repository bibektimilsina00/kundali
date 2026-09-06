/// The seam. Knows nothing about HTTP, JSON, or the cache.
library;

import 'package:nakhatra/core/result.dart';
import 'package:nakhatra/features/kundali/domain/entities/birth_details.dart';
import 'package:nakhatra/features/kundali/domain/entities/kundali.dart';

abstract interface class KundaliRepository {
  /// Cache-first unless [forceRefresh]. A chart derives from birth data that
  /// does not change, so a stale read is correct rather than a compromise.
  Future<Result<Kundali>> getKundali({bool forceRefresh = false});

  Future<Result<Kundali>> createKundali(BirthDetails details);
}
