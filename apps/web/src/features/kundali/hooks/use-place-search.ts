"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { searchPlaces } from "@/features/kundali/api/places.api";

/** Delay the term so a fast typist issues one request, not eight. */
function useDebounced(value: string, ms: number): string {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setSettled(value), ms);
    return () => clearTimeout(timer);
  }, [value, ms]);
  return settled;
}

/**
 * Place search is server state, so it lives in TanStack Query rather than in a
 * hand-rolled effect (docs/architecture.md §8). That also buys request
 * cancellation via `signal` and caching of repeated searches for free — the
 * two things a hand-rolled version gets wrong first.
 */
export function usePlaceSearch(query: string) {
  const term = useDebounced(query.trim(), 180);
  const enabled = term.length >= 2;

  const { data, isFetching, isError } = useQuery({
    queryKey: ["places", term],
    queryFn: ({ signal }) => searchPlaces(term, signal),
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  return {
    results: data ?? [],
    searchable: enabled,
    loading: enabled && isFetching,
    failed: isError,
  };
}
