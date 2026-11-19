export const REVIEW_PAGE_SIZE = 5;
export const REVIEW_TITLE_MAX = 80;
export const REVIEW_BODY_MIN = 10;
export const REVIEW_BODY_MAX = 2000;

export const REVIEW_SORTS = ["newest", "highest", "lowest"] as const;
export type ReviewSort = (typeof REVIEW_SORTS)[number];
export const REVIEW_SORT_LABEL: Record<ReviewSort, string> = {
  newest: "Newest",
  highest: "Highest rated",
  lowest: "Lowest rated",
};

/** Index = star count */
export const RATING_LABEL = [
  "",
  "Poor",
  "Fair",
  "Good",
  "Very good",
  "Excellent",
] as const;

export interface ReviewDTO {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  authorName: string;
  verifiedPurchase: boolean;
  createdAt: string; // ISO
  edited: boolean;
  isMine: boolean;
}

export interface MyReview {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  updatedAt: string;
}

export interface ReviewSummaryData {
  count: number;
  sum: number;
  average: number;
  distribution: { rating: number; count: number }[]; // 5 → 1
}

/** "Ama Mensah" → "Ama M." Never exposes an email address. */
export function displayName(name: string | null | undefined) {
  const clean = (name ?? "").trim();
  if (!clean || clean.includes("@")) return "Customer";
  const parts = clean.split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1].charAt(0).toUpperCase()}.`;
}

/** Fixed to UTC so the server and the browser always render the same date. */
export function formatReviewDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}
