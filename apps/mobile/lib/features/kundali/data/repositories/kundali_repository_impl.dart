library;

import 'package:nakhatra/core/error/exceptions.dart';
import 'package:nakhatra/core/result.dart';
import 'package:nakhatra/features/kundali/data/datasources/kundali_local_datasource.dart';
import 'package:nakhatra/features/kundali/data/datasources/kundali_remote_datasource.dart';
import 'package:nakhatra/features/kundali/data/mappers/kundali_mapper.dart';
import 'package:nakhatra/features/kundali/domain/entities/birth_details.dart';
import 'package:nakhatra/features/kundali/domain/entities/kundali.dart';
import 'package:nakhatra/features/kundali/domain/repositories/kundali_repository.dart';

final class KundaliRepositoryImpl implements KundaliRepository {
  const KundaliRepositoryImpl(this._remote, this._local);

  final KundaliRemoteDataSource _remote;
  final KundaliLocalDataSource _local;

  @override
  Future<Result<Kundali>> getKundali({bool forceRefresh = false}) async {
    if (!forceRefresh) {
      final cached = await _local.read();
      if (cached != null) return Ok(cached.toEntity());
    }
    try {
      final dto = await _remote.fetch();
      await _local.write(dto);
      return Ok(dto.toEntity());
    } on AppException catch (e) {
      // Falling back to a stale chart beats an error screen: the data is
      // still correct, it just is not freshly fetched.
      final cached = await _local.read();
      if (cached != null) return Ok(cached.toEntity());
      return Err(e.toFailure());
    }
  }

  @override
  Future<Result<Kundali>> createKundali(BirthDetails details) async {
    try {
      final dto = await _remote.create(details);
      await _local.write(dto);
      return Ok(dto.toEntity());
    } on AppException catch (e) {
      return Err(e.toFailure());
    }
  }
}
