import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Star, BadgeCheck, Zap } from 'lucide-react';
import { getProfessionalVerification, isPubliclyVerified } from '../lib/verification';
import { getProfessionalRatingStats } from '../lib/ratings';

export interface Professional {
  id: string;
  name: string;
  role: string;
  category: string;
  location: string;
  distance: string;
  rating: number;
  reviews: number;
  matchScore: number;
  verified: boolean;
  available: boolean;
  status?: 'online' | 'busy' | 'offline';
  skills: string[];
  avatar: string;
  rate?: string;
  experience: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  state?: string;
  country?: string;
}


interface ProfessionalCardProps {
  professional: Professional;
  index?: number;
}

const categoryColors: Record<string, string> = {
  Education: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  Healthcare: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  Culinary: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  Technology: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  Business: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  Creative: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
};

const ProfessionalCard: React.FC<ProfessionalCardProps> = ({ professional, index = 0 }) => {
  const verification = getProfessionalVerification(professional.id);
  const ratingStats = getProfessionalRatingStats(professional.id, professional.rating, professional.reviews);
  const verified = isPubliclyVerified(professional.id, professional.verified);
  const displayRating = ratingStats.verifiedReviewCount ? ratingStats.averageRating : professional.rating;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -4 }}
      className="group bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6 hover:shadow-xl transition-all duration-300 flex flex-col gap-4"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={professional.avatar}
              alt={professional.name}
              width={52}
              height={52}
className="w-[52px] h-[52px] rounded-xl object-cover"
            />
            <span
              className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 border-2 border-[hsl(var(--card))] rounded-full ${
                professional.status === 'online' || (professional.available && !professional.status)
                  ? 'bg-emerald-500'
                  : professional.status === 'busy'
                  ? 'bg-amber-500'
                  : 'bg-gray-400'
              }`}
              title={`Status: ${professional.status || (professional.available ? 'online' : 'offline')}`}
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-[hsl(var(--foreground))] text-sm leading-tight">{professional.name}</h3>
              {verified && (
                <span title="Verified professional"><BadgeCheck className="w-4 h-4 text-[hsl(var(--cp-indigo))] flex-shrink-0" /></span>
              )}
            </div>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{professional.role}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-xs font-bold text-[hsl(var(--cp-indigo))] bg-[hsl(var(--cp-indigo))]/10 px-2 py-0.5 rounded-full">
            {professional.matchScore}% match
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${categoryColors[professional.category] || 'bg-gray-100 text-gray-700'}`}>
          {professional.category}
        </span>
        <div className="flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))]">
          <MapPin className="w-3.5 h-3.5" />
          <span>{professional.distance}</span>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="font-medium text-[hsl(var(--foreground))]">{displayRating}</span>
          <span className="text-[hsl(var(--muted-foreground))]">({professional.reviews})</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {professional.skills.slice(0, 3).map((skill) => (
          <span key={skill} className="text-xs bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] px-2 py-0.5 rounded-md">
            {skill}
          </span>
        ))}
        {professional.skills.length > 3 && (
          <span className="text-xs text-[hsl(var(--muted-foreground))] px-2 py-0.5">
            +{professional.skills.length - 3} more
          </span>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-[hsl(var(--border))]">
        <div>
          {professional.rate && (
            <p className="text-sm font-semibold text-[hsl(var(--foreground))]">{professional.rate}</p>
          )}
          <p className="text-xs text-[hsl(var(--muted-foreground))]">{professional.experience}</p>
        </div>
        <Link
          to={`/profile/${professional.id}`}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-[hsl(var(--cp-indigo))] to-[hsl(var(--cp-violet))] text-white text-xs font-semibold hover:scale-105 hover:shadow-md transition-all duration-200"
        >
          <Zap className="w-3.5 h-3.5" />
          Connect
        </Link>
      </div>
    </motion.div>
  );
};

export default ProfessionalCard;