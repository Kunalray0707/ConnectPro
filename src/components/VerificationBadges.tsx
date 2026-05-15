import React from 'react';
import { BadgeCheck, Building2, FileCheck, Shield } from 'lucide-react';
import type { ProfessionalVerification } from '../lib/verification';
import type { RatingTier } from '../lib/ratings';
import { RATING_TIER_META } from '../lib/ratings';

interface VerificationBadgesProps {
  verification: ProfessionalVerification | null;
  ratingTier?: RatingTier;
  compact?: boolean;
  showRatingTier?: boolean;
}

const VerificationBadges: React.FC<VerificationBadgesProps> = ({
  verification,
  ratingTier = 'new',
  compact = false,
  showRatingTier = true,
}) => {
  if (!verification && ratingTier === 'new') return null;

  const items: { key: string; label: string; icon: React.ReactNode; show: boolean }[] = [
    {
      key: 'verified',
      label: verification?.badgeLevel === 'elite' ? 'Elite Pro' : verification?.badgeLevel === 'pro' ? 'Verified Pro' : 'Verified',
      icon: <BadgeCheck className="w-3.5 h-3.5" />,
      show: Boolean(verification && verification.badgeLevel !== 'none'),
    },
    {
      key: 'company',
      label: verification?.companyName ? `${verification.companyName}` : 'Company',
      icon: <Building2 className="w-3.5 h-3.5" />,
      show: Boolean(verification?.companyVerified),
    },
    {
      key: 'experience',
      label: 'Exp. Verified',
      icon: <FileCheck className="w-3.5 h-3.5" />,
      show: Boolean(verification?.experienceVerified),
    },
    {
      key: 'identity',
      label: 'ID Verified',
      icon: <Shield className="w-3.5 h-3.5" />,
      show: Boolean(verification?.identityVerified && !verification?.companyVerified),
    },
  ];

  const visible = items.filter(i => i.show);
  const tierMeta = RATING_TIER_META[ratingTier];

  return (
    <div className={`flex flex-wrap gap-1.5 ${compact ? '' : 'mt-2'}`}>
      {showRatingTier && ratingTier !== 'new' && (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[hsl(var(--muted))] border border-[hsl(var(--border))] ${tierMeta.color}`}
          title={`${tierMeta.label} tier — verified reviews only`}
        >
          {tierMeta.label} Rated
        </span>
      )}
      {visible.map(item => (
        <span
          key={item.key}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[hsl(var(--cp-indigo))]/10 text-[hsl(var(--cp-indigo))] border border-[hsl(var(--cp-indigo))]/25"
          title={item.label}
        >
          {item.icon}
          {!compact && <span>{item.label}</span>}
        </span>
      ))}
    </div>
  );
};

export default VerificationBadges;
