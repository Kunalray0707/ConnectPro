import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Zap, Users, Globe, Award, Heart, Plus, Trash2, Edit2, X, Check } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { toast } from 'react-toastify';

interface AboutProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const values = [
  { icon: Shield, title: 'Trust & Safety', desc: 'Every professional is verified through our rigorous document verification system.' },
  { icon: Zap, title: 'AI-Powered', desc: 'Our matching algorithm learns from millions of connections to find your perfect match.' },
  { icon: Users, title: 'Community First', desc: 'We build tools that empower professionals to grow together.' },
  { icon: Globe, title: 'Inclusive Platform', desc: 'Supporting professionals across every industry, language, and location.' },
  { icon: Award, title: 'Excellence', desc: 'We hold ourselves to the highest standards in everything we build.' },
  { icon: Heart, title: 'Human Connection', desc: 'Technology is the bridge, but human relationships are the destination.' },
];

type TeamMember = {
  id: string;
  name: string;
  role: string;
  avatar: string;
};

const initialTeam: TeamMember[] = [
  { id: 't1', name: 'Aditya Sharma', role: 'CEO & Co-founder', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face' },
  { id: 't2', name: 'Priya Nair', role: 'CTO & Co-founder', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face' },
  { id: 't3', name: 'Rohan Mehta', role: 'Head of Product', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face' },
  { id: 't4', name: 'Sneha Kapoor', role: 'Head of Design', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=face' },
];

const defaultAvatars = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
];

const About: React.FC<AboutProps> = ({ theme, toggleTheme }) => {
  const [team, setTeam] = useState<TeamMember[]>(() => {
    const saved = localStorage.getItem('cp_team_members');
    return saved ? JSON.parse(saved) : initialTeam;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  const [memberName, setMemberName] = useState('');
  const [memberRole, setMemberRole] = useState('');
  const [memberAvatar, setMemberAvatar] = useState(defaultAvatars[0]);

  useEffect(() => {
    localStorage.setItem('cp_team_members', JSON.stringify(team));
  }, [team]);

  const handleOpenAddModal = () => {
    setEditingMember(null);
    setMemberName('');
    setMemberRole('');
    setMemberAvatar(defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)]);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (member: TeamMember) => {
    setEditingMember(member);
    setMemberName(member.name);
    setMemberRole(member.role);
    setMemberAvatar(member.avatar);
    setIsModalOpen(true);
  };

  const handleDeleteMember = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove ${name} from the team?`)) {
      setTeam(prev => prev.filter(m => m.id !== id));
      toast.success(`${name} has been successfully removed.`);
    }
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName.trim() || !memberRole.trim()) {
      toast.warn('Please enter both name and role.');
      return;
    }

    if (editingMember) {
      setTeam(prev =>
        prev.map(m =>
          m.id === editingMember.id
            ? { ...m, name: memberName.trim(), role: memberRole.trim(), avatar: memberAvatar }
            : m
        )
      );
      toast.success('Team member successfully updated!');
    } else {
      const newMember: TeamMember = {
        id: `team-${Date.now()}`,
        name: memberName.trim(),
        role: memberRole.trim(),
        avatar: memberAvatar,
      };
      setTeam(prev => [...prev, newMember]);
      toast.success('New team member added successfully!');
    }
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <Header theme={theme} toggleTheme={toggleTheme} />

      <div className="pt-16">
        {/* Hero */}
        <section className="py-24 bg-gradient-to-br from-[hsl(var(--cp-dark))] to-[hsl(260,25%,12%)]">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-heading text-5xl font-bold text-white mb-6">
              About ConnectPro
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-white/60 text-lg leading-relaxed max-w-2xl mx-auto">
              We're on a mission to eliminate the friction in professional discovery. Whether you're a student looking for a tutor, a hospital seeking nurses, or a restaurant hiring chefs — ConnectPro makes the right connection happen instantly.
            </motion.p>
          </div>
        </section>

        {/* Mission */}
        <section className="py-20 bg-[hsl(var(--background))]">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="font-heading text-3xl font-bold text-[hsl(var(--foreground))] mb-6">Our Mission</h2>
              <p className="text-[hsl(var(--muted-foreground))] text-lg leading-relaxed">
                ConnectPro was founded in 2024 with a simple belief: the right professional connection can change lives. We've built a platform that uses AI, location intelligence, and verified profiles to make professional matchmaking as natural as a conversation.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 bg-[hsl(var(--muted))]/30">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-heading text-3xl font-bold text-[hsl(var(--foreground))] text-center mb-12">
              Our Values
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {values.map(({ icon: Icon, title, desc }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(var(--cp-indigo))] to-[hsl(var(--cp-violet))] flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-heading font-semibold text-[hsl(var(--foreground))] mb-2">{title}</h3>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">{desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section (Fully Editable) */}
        <section className="py-20 bg-[hsl(var(--background))]">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-12 border-b border-[hsl(var(--border))]/50 pb-6">
              <div>
                <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-heading text-3xl font-bold text-[hsl(var(--foreground))]">
                  Meet Our Team
                </motion.h2>
                <p className="text-xs sm:text-sm text-[hsl(var(--muted-foreground))] mt-1">
                  Click on any member to edit details or add new experts to your organization.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-[hsl(var(--cp-indigo))] to-[hsl(var(--cp-violet))] text-white text-xs sm:text-sm font-bold shadow-lg hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Team Member
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <AnimatePresence>
                {team.map((m) => (
                  <motion.div
                    key={m.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6 flex flex-col items-center text-center shadow-sm hover:shadow-xl transition-all duration-300 group relative"
                  >
                    {/* Hover actions */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 z-10 bg-[hsl(var(--card))]/90 backdrop-blur-sm px-2 py-1 rounded-lg border border-[hsl(var(--border))]">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(m)}
                        className="p-1.5 rounded-md text-blue-400 hover:bg-blue-500/10 transition-colors"
                        title="Edit Member"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteMember(m.id, m.name)}
                        className="p-1.5 rounded-md text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Remove Member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="relative mb-4">
                      <img
                        src={m.avatar}
                        alt={m.name}
                        className="w-24 h-24 rounded-2xl object-cover border-2 border-[hsl(var(--cp-indigo))]/30 shadow-md group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-[hsl(var(--cp-indigo))]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    <h3 className="font-bold text-base text-[hsl(var(--foreground))] mb-1 group-hover:text-[hsl(var(--cp-indigo))] transition-colors">
                      {m.name}
                    </h3>
                    <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] px-3 py-1 rounded-full bg-[hsl(var(--muted))]/50">
                      {m.role}
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </section>
      </div>

      <Footer />

      {/* Edit / Add Member Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-3xl p-7 max-w-md w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[hsl(var(--cp-indigo))] to-[hsl(var(--cp-violet))]" />

              <div className="flex items-center justify-between mb-6 pb-3 border-b border-[hsl(var(--border))]/50">
                <h3 className="font-heading text-lg font-bold text-[hsl(var(--foreground))] flex items-center gap-2">
                  <Users className="w-5 h-5 text-[hsl(var(--cp-indigo))]" />
                  {editingMember ? 'Edit Team Member' : 'Add New Team Member'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-xl bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveMember} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-[hsl(var(--foreground))] mb-1.5 uppercase tracking-wider">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ananya Sharma"
                    value={memberName}
                    onChange={(e) => setMemberName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--cp-indigo))]/50 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[hsl(var(--foreground))] mb-1.5 uppercase tracking-wider">
                    Professional Role / Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Machine Learning Architect"
                    value={memberRole}
                    onChange={(e) => setMemberRole(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--cp-indigo))]/50 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[hsl(var(--foreground))] mb-1.5 uppercase tracking-wider">
                    Avatar URL or Pick preset
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://images.unsplash.com/..."
                    value={memberAvatar}
                    onChange={(e) => setMemberAvatar(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--cp-indigo))]/50 font-mono"
                  />
                  <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
                    {defaultAvatars.map((url, idx) => (
                      <button
                        key={url}
                        type="button"
                        onClick={() => setMemberAvatar(url)}
                        className={`w-10 h-10 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-transform ${
                          memberAvatar === url ? 'border-[hsl(var(--cp-indigo))] scale-110 shadow-md' : 'border-transparent hover:scale-105'
                        }`}
                      >
                        <img src={url} alt={`preset ${idx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-[hsl(var(--border))]/50">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs font-bold hover:bg-[hsl(var(--muted))] transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[hsl(var(--cp-indigo))] to-[hsl(var(--cp-violet))] text-white text-xs font-bold shadow-lg hover:opacity-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" /> Save Member
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default About;