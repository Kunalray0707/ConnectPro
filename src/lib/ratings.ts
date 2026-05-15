import { loadLocalBookings, type LocalBooking } from './localBookings';

export type RatingTier = 'new' | 'bronze' | 'silver' | 'gold' | 'platinum';

export type VerifiedReview = {
  id: string;
  professionalId: string;
  reviewerId: string;
  reviewerName: string;
  bookingId: string;
  rating: number;
  text: string;
  createdAt: string;
  verifiedPurchase: true;
};

export type ProfessionalRatingStats = {
  averageRating: number;
  verifiedReviewCount: number;
  tier: RatingTier;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
};

const REVIEWS_KEY = 'cp-verified-reviews';

function loadReviews(): VerifiedReview[] {
  try {
    const raw = localStorage.getItem(REVIEWS_KEY);
    return raw ? (JSON.parse(raw) as VerifiedReview[]) : [];
  } catch {
    return [];
  }
}

function saveReviews(reviews: VerifiedReview[]): void {
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews.slice(0, 500)));
}

export const RATING_TIER_META: Record<
  RatingTier,
  { label: string; minReviews: number; color: string }
> = {
  new: { label: 'New', minReviews: 0, color: 'text-[hsl(var(--muted-foreground))]' },
  bronze: { label: 'Bronze', minReviews: 1, color: 'text-amber-700 dark:text-amber-400' },
  silver: { label: 'Silver', minReviews: 5, color: 'text-slate-500 dark:text-slate-300' },
  gold: { label: 'Gold', minReviews: 15, color: 'text-amber-500' },
  platinum: { label: 'Platinum', minReviews: 50, color: 'text-violet-600 dark:text-violet-400' },
};

export function computeRatingTier(count: number): RatingTier {
  if (count >= 50) return 'platinum';
  if (count >= 15) return 'gold';
  if (count >= 5) return 'silver';
  if (count >= 1) return 'bronze';
  return 'new';
}

export function getReviewsForProfessional(professionalId: string): VerifiedReview[] {
  return loadReviews()
    .filter(r => r.professionalId === professionalId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getProfessionalRatingStats(
  professionalId: string,
  fallbackRating = 0,
  fallbackCount = 0,
): ProfessionalRatingStats {
  const reviews = getReviewsForProfessional(professionalId);
  const count = reviews.length;

  if (count === 0) {
    return {
      averageRating: fallbackRating,
      verifiedReviewCount: fallbackCount,
      tier: computeRatingTier(fallbackCount),
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  }

  const distribution: ProfessionalRatingStats['distribution'] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;
  for (const r of reviews) {
    const star = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
    distribution[star] += 1;
    sum += r.rating;
  }

  return {
    averageRating: Math.round((sum / count) * 10) / 10,
    verifiedReviewCount: count,
    tier: computeRatingTier(count),
    distribution,
  };
}

export function getEligibleBookingsForReview(
  userId: string,
  professionalId: string,
): LocalBooking[] {
  const paid = loadLocalBookings().filter(
    b =>
      (b.professionalId === professionalId || b.serviceId === professionalId) &&
      b.status === 'paid',
  );
  const reviewedBookingIds = new Set(
    loadReviews()
      .filter(r => r.reviewerId === userId && r.professionalId === professionalId)
      .map(r => r.bookingId),
  );
  return paid.filter(b => !reviewedBookingIds.has(b.id));
}

export function canSubmitVerifiedReview(
  userId: string,
  professionalId: string,
  bookingId: string,
): boolean {
  return getEligibleBookingsForReview(userId, professionalId).some(b => b.id === bookingId);
}

export function submitVerifiedReview(params: {
  professionalId: string;
  reviewerId: string;
  reviewerName: string;
  bookingId: string;
  rating: number;
  text: string;
}): VerifiedReview | null {
  if (!canSubmitVerifiedReview(params.reviewerId, params.professionalId, params.bookingId)) {
    return null;
  }
  if (params.rating < 1 || params.rating > 5 || !params.text.trim()) {
    return null;
  }

  const review: VerifiedReview = {
    id: `rev-${Date.now()}`,
    professionalId: params.professionalId,
    reviewerId: params.reviewerId,
    reviewerName: params.reviewerName,
    bookingId: params.bookingId,
    rating: params.rating,
    text: params.text.trim(),
    createdAt: new Date().toISOString(),
    verifiedPurchase: true,
  };

  const reviews = loadReviews();
  reviews.unshift(review);
  saveReviews(reviews);
  return review;
}

export function seedDemoReviews(): void {
  if (loadReviews().length > 0) return;
  const demos: VerifiedReview[] = [
    {
      id: 'rev-demo-1',
      professionalId: 'p1',
      reviewerId: 'demo-user',
      reviewerName: 'Rohan Das',
      bookingId: 'bk-demo-1',
      rating: 5,
      text: 'Absolutely brilliant! Helped me crack JEE with flying colors. Highly recommended.',
      createdAt: '2025-12-01T10:00:00.000Z',
      verifiedPurchase: true,
    },
    {
      id: 'rev-demo-2',
      professionalId: 'p1',
      reviewerId: 'demo-user-2',
      reviewerName: 'Sneha Gupta',
      bookingId: 'bk-demo-2',
      rating: 5,
      text: 'Very patient and knowledgeable. My daughter improved significantly in 3 months.',
      createdAt: '2025-11-15T10:00:00.000Z',
      verifiedPurchase: true,
    },
  ];
  saveReviews(demos);
}
