"use client";

import { useMediaQuery } from "./use-media-query";

// Matches Tailwind's `md` breakpoint (768px): mobile is anything below it.
export const MOBILE_BREAKPOINT = 768;

export function useIsMobile(breakpoint = MOBILE_BREAKPOINT): boolean {
  return useMediaQuery(`(max-width: ${breakpoint - 1}px)`);
}
