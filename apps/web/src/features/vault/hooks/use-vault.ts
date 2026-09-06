"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useSession } from "@/features/auth/hooks/use-auth";
import * as vaultApi from "@/features/vault/api/vault.api";
import type { SaveKundaliBody, SavedKundali } from "@/features/vault/types";
import type { ApiError } from "@/lib/api/errors";
import { trackEvent } from "@/providers/posthog-provider";

/**
 * The saved-kundali list is server state, so it lives here and not in a store.
 * It previously sat in `useState` inside the auth context, which meant every
 * caller that added a kundali had to remember to update that array by hand —
 * the exact hand-written cache invalidation rule 6 exists to avoid.
 */
export const vaultKeys = {
  kundalis: ["vault", "kundalis"] as const,
};

export function useSavedKundalis() {
  const { isSignedIn } = useSession();
  return useQuery<SavedKundali[], ApiError>({
    queryKey: vaultKeys.kundalis,
    queryFn: vaultApi.listKundalis,
    enabled: isSignedIn,
    // Signed out there is nothing to show, and the query never runs.
    initialData: isSignedIn ? undefined : [],
  });
}

export function useSaveKundali() {
  const queryClient = useQueryClient();
  return useMutation<SavedKundali, ApiError, SaveKundaliBody>({
    mutationFn: vaultApi.saveKundali,
    onSuccess: () => {
      trackEvent("kundali_saved_to_vault");
      queryClient.invalidateQueries({ queryKey: vaultKeys.kundalis });
    },
  });
}
