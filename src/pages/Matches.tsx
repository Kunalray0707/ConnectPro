import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProfessionalCard, { type Professional } from '../components/ProfessionalCard';
import { professionals, allSkills } from '../data/professionals';
import { Search, Filter, X } from 'lucide-react';

interface MatchesProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const Matches: React.FC<MatchesProps> = ({ theme, toggleTheme }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<string>('All');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('All');
  const [showFilters, setShowFilters] = useState(false);

  const categories = ['All', 'Healthcare', 'Technology', 'Culinary', 'Education', 'Creative', 'Business'];

  const filteredProfessionals = useMemo(() => {
    return professionals.filter((prof) => {
      const matchesSearch = 
        prof.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prof.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prof.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === 'All' || prof.category === selectedCategory;

      const matchesSkills = selectedSkills.length === 0 || 
        selectedSkills.every(skill => prof.skills.includes(skill));

      const matchesPrice = priceRange === 'All' || 
        (priceRange === 'low' && parseInt(prof.rate?.replace(/[^\d]/g, '') || '0') < 1000) ||
        (priceRange === 'medium' && parseInt(prof.rate?.replace(/[^\d]/g, '') || '0') >= 1000 && parseInt(prof.rate?.replace(/[^\d]/g, '') || '0') < 2000) ||
        (priceRange === 'high' && parseInt(prof.rate?.replace(/[^\d]/g, '') || '0') >= 2000);

      const matchesAvailability = availabilityFilter === 'All' || 
        (availabilityFilter === 'available' && prof.available) ||
        (availabilityFilter === 'unavailable' && !prof.available);

      return matchesSearch && matchesCategory && matchesSkills && matchesPrice && matchesAvailability;
    });
  }, [searchQuery, selectedCategory, selectedSkills, priceRange, availabilityFilter]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedSkills([]);
    setPriceRange('All');
    setAvailabilityFilter('All');
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <Header theme={theme} toggleTheme={toggleTheme} />
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="font-heading text-3xl font-bold text-[hsl(var(--foreground))] mb-2">
                  Find Matches
                </h1>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  Discover and connect with professionals tailored to your needs
                </p>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[hsl(var(--border))] text-sm font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-all duration-200"
              >
                <Filter size={18} />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" size={20} />
                <input
                  type="text"
                  placeholder="Search by name, role, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--cp-indigo))] transition-all"
                />
              </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6 mb-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-[hsl(var(--foreground))]">Filters</h3>
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                  >
                    <X size={16} />
                    Clear All
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--cp-indigo))] transition-all"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Price Range Filter */}
                  <div>
                    <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">Price Range</label>
                    <select
                      value={priceRange}
                      onChange={(e) => setPriceRange(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--cp-indigo))] transition-all"
                    >
                      <option value="All">All Prices</option>
                      <option value="low">Under ₹1,000/hr</option>
                      <option value="medium">₹1,000 - ₹2,000/hr</option>
                      <option value="high">₹2,000+/hr</option>
                    </select>
                  </div>

                  {/* Availability Filter */}
                  <div>
                    <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">Availability</label>
                    <select
                      value={availabilityFilter}
                      onChange={(e) => setAvailabilityFilter(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--cp-indigo))] transition-all"
                    >
                      <option value="All">All</option>
                      <option value="available">Available Now</option>
                      <option value="unavailable">Unavailable</option>
                    </select>
                  </div>
                </div>

                {/* Skills Filter */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">Skills</label>
                  <div className="flex flex-wrap gap-2">
                    {allSkills.slice(0, 12).map(skill => (
                      <button
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          selectedSkills.includes(skill)
                            ? 'bg-[hsl(var(--cp-indigo))] text-white'
                            : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]/80'
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Results Count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Showing {filteredProfessionals.length} {filteredProfessionals.length === 1 ? 'professional' : 'professionals'}
              </p>
            </div>

            {/* Professionals Grid */}
            {filteredProfessionals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProfessionals.map((professional, index) => (
                  <ProfessionalCard key={professional.id} professional={professional} index={index} />
                ))}
              </div>
            ) : (
              <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center">
                  <Search className="text-[hsl(var(--muted-foreground))]" size={32} />
                </div>
                <h3 className="font-semibold text-[hsl(var(--foreground))] mb-2">No professionals found</h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">
                  Try adjusting your filters or search query
                </p>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 rounded-lg bg-[hsl(var(--cp-indigo))] text-white text-sm font-medium hover:bg-[hsl(var(--cp-indigo))]/90 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Matches;
