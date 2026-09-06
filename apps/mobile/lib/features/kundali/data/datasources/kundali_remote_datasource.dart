library;

import 'package:dio/dio.dart';
import 'package:nakhatra/core/error/exceptions.dart';
import 'package:nakhatra/features/kundali/data/models/kundali_dto.dart';
import 'package:nakhatra/features/kundali/domain/entities/birth_details.dart';

abstract interface class KundaliRemoteDataSource {
  Future<KundaliDto> fetch();
  Future<KundaliDto> create(BirthDetails details);
}

final class KundaliRemoteDataSourceImpl implements KundaliRemoteDataSource {
  const KundaliRemoteDataSourceImpl(this._dio);
  final Dio _dio;

  @override
  Future<KundaliDto> fetch() => _request(() => _dio.get<dynamic>('/v1/kundali'));

  @override
  Future<KundaliDto> create(BirthDetails details) => _request(
        () => _dio.post<dynamic>('/v1/kundali', data: _payload(details)),
      );

  Future<KundaliDto> _request(Future<Response<dynamic>> Function() send) async {
    try {
      final response = await send();
      final body = response.data;
      if (body is! Map<String, dynamic>) {
        throw const ApiException('Unexpected response shape.');
      }
      return KundaliDto.fromJson(body);
    } on DioException catch (e) {
      // _ErrorInterceptor already translated this; unwrap it.
      final translated = e.error;
      if (translated is AppException) throw translated;
      throw ApiException(e.message ?? 'Request failed.');
    }
  }

  Map<String, dynamic> _payload(BirthDetails d) => {
        'name': d.name,
        // Wall-clock only. Never toIso8601String() on a UTC-converted value:
        // the server resolves the offset from tz_name and the date, because
        // the offset for a place changes over time.
        'date': _date(d.localDateTime),
        'time': _time(d.localDateTime),
        'tz_name': d.timeZoneName,
        'latitude': d.latitude,
        'longitude': d.longitude,
        'place_label': d.placeLabel,
        'time_accuracy': d.timeAccuracy.name,
      };

  String _date(DateTime dt) => '${dt.year.toString().padLeft(4, '0')}-'
      '${dt.month.toString().padLeft(2, '0')}-'
      '${dt.day.toString().padLeft(2, '0')}';

  String _time(DateTime dt) => '${dt.hour.toString().padLeft(2, '0')}:'
      '${dt.minute.toString().padLeft(2, '0')}';
}
