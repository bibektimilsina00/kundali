library;

import 'package:nakhatra/core/result.dart';
import 'package:nakhatra/features/kundali/domain/entities/birth_details.dart';
import 'package:nakhatra/features/kundali/domain/entities/kundali.dart';
import 'package:nakhatra/features/kundali/domain/repositories/kundali_repository.dart';

final class CreateKundali {
  const CreateKundali(this._repository);
  final KundaliRepository _repository;

  Future<Result<Kundali>> call(BirthDetails details) =>
      _repository.createKundali(details);
}
