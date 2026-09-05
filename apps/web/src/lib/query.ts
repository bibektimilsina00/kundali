import { QueryClient } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/errors";

export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // A chart derives from birth data that never changes, so refetching it
        // on every window focus is pure waste. Individual queries can opt out.
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          // Retrying a 422 just sends the same invalid payload again.
          if (error instanceof ApiError && error.status < 500) return false;
          return failureCount < 2;
        },
      },
    },
  });
}
