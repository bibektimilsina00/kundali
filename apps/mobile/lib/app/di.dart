/// The composition root.
///
/// It lives in `app/`, not `core/`, because it is the one place that
/// legitimately knows every layer of every feature — that is what a
/// composition root *is*. `core/` is shared infrastructure that features
/// import; if it imported them back you would have a cycle, which is why
/// `tool/check_layers.dart` forbids it. This file being in `core/` was the
/// first thing that check caught.
///
/// Hand-written: `injectable` is a code-generation step to avoid typing thirty
/// lines, which is not a trade worth a build phase (docs/mobile.md §9).
/// Revisit past ~100 registrations.
library;

import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:get_it/get_it.dart';
import 'package:nakhatra/core/network/api_client.dart';
import 'package:nakhatra/core/network/auth_interceptor.dart';
import 'package:nakhatra/core/storage/secure_store.dart';
import 'package:nakhatra/features/kundali/data/datasources/kundali_local_datasource.dart';
import 'package:nakhatra/features/kundali/data/datasources/kundali_remote_datasource.dart';
import 'package:nakhatra/features/kundali/data/repositories/kundali_repository_impl.dart';
import 'package:nakhatra/features/kundali/domain/repositories/kundali_repository.dart';
import 'package:nakhatra/features/kundali/domain/usecases/create_kundali.dart';
import 'package:nakhatra/features/kundali/domain/usecases/get_kundali.dart';
import 'package:nakhatra/features/kundali/presentation/cubit/kundali_cubit.dart';

final getIt = GetIt.instance;

Future<void> configureDependencies({required String apiBaseUrl}) async {
  // --- storage -------------------------------------------------------------
  const storage = FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
    iOptions: IOSOptions(accessibility: KeychainAccessibility.first_unlock),
  );
  getIt
    ..registerSingleton<FlutterSecureStorage>(storage)
    ..registerSingleton<SecureStore>(const FlutterSecureStore(storage));

  // --- network -------------------------------------------------------------
  final authInterceptor = AuthInterceptor(
    store: getIt<SecureStore>(),
    // Wired to the auth feature in Phase 1; until then a refresh always fails,
    // which correctly routes to sign-in rather than looping.
    refresh: (_) async => null,
    onSignedOut: () async => getIt<SecureStore>().clear(),
  );
  getIt
    ..registerSingleton<AuthInterceptor>(authInterceptor)
    ..registerSingleton(
      buildApiClient(baseUrl: apiBaseUrl, interceptors: [authInterceptor]),
    );

  // --- kundali -------------------------------------------------------------
  getIt
    ..registerLazySingleton<KundaliRemoteDataSource>(
      () => KundaliRemoteDataSourceImpl(getIt()),
    )
    ..registerLazySingleton<KundaliLocalDataSource>(
      () => KundaliLocalDataSourceImpl(getIt<FlutterSecureStorage>()),
    )
    ..registerLazySingleton<KundaliRepository>(
      () => KundaliRepositoryImpl(getIt(), getIt()),
    )
    ..registerLazySingleton(() => GetKundali(getIt()))
    ..registerLazySingleton(() => CreateKundali(getIt()))
    // Cubits are factories: one instance per screen, disposed with it.
    ..registerFactory(() => KundaliCubit(getIt(), getIt()));
}
