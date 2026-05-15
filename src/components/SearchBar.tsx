import React, { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

interface SearchBarProps {
  onSearch?: (query: string, location: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, placeholder = 'Search professionals, skills, services...' }) => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [locating, setLocating] = useState(false);

  const handleLocate = () => {
    setLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setLocation('Current Location');
          setLocating(false);
        },
        () => {
          setLocation('Location unavailable');
          setLocating(false);
        }
      );
    } else {
      setLocation('Not supported');
      setLocating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(query, location);
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="w-full max-w-3xl mx-auto"
    >
      <div className="flex flex-col sm:flex-row gap-2 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-2 shadow-xl">
        <div className="flex items-center gap-3 flex-1 px-3">
          <Search size={18} className="text-[hsl(var(--muted-foreground))] flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] outline-none py-2"
          />
        </div>
        <div className="hidden sm:block w-px bg-[hsl(var(--border))] my-2" />
        <div className="flex items-center gap-2 px-3 sm:w-48">
          <MapPin size={18} className="text-[hsl(var(--muted-foreground))] flex-shrink-0" />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location"
            className="flex-1 bg-transparent text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] outline-none py-2"
          />
          <button
            type="button"
            onClick={handleLocate}
            aria-label="Use current location"
            className="p-1.5 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors duration-200"
          >
            <motion.div animate={locating ? { rotate: 360 } : {}} transition={{ duration: 1, repeat: locating ? Infinity : 0 }}>
              <MapPin size={14} className="text-[hsl(var(--cp-blue))]" />
            </motion.div>
          </button>
        </div>
        <button
          type="submit"
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-[hsl(var(--cp-blue))] to-[hsl(var(--cp-violet))] text-white text-sm font-semibold hover:scale-105 transition-all duration-200 flex items-center gap-2"
        >
          <Search size={16} />
          <span>Search</span>
        </button>
      </div>
    </motion.form>
  );
};

export default SearchBar;