"use client";

import { use } from "react";
import { useParams } from "next/navigation";

/**
 * Safely get the `id` param from a `[id]` dynamic route.
 *
 * Next.js 15.5+ changed `useParams()` to return a Promise.
 * Using `use()` from React handles both sync (15.0–15.4) and async (15.5+) params.
 */
export function useParamId(): string {
  const params = use(useParams());
  return String(params.id);
}
