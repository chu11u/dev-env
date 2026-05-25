"use client";

import { useParams } from "next/navigation";

/**
 * Safely get the `id` param from a `[id]` dynamic route.
 * Wraps useParams() with null-check to avoid crashes during SSR/hydration.
 */
export function useParamId(): string | undefined {
  const params = useParams();
  return params ? String(params.id) : undefined;
}
