import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CircleDot } from 'lucide-react';
import type { Professional } from './ProfileCard';

interface ChatMessage {
  id: string;
  sender: 'user' | 'professional';
  text: string;
  status: 'sent' | 'delivered' | 'read';
}

interface ProfileChatProps {
  professional: Professional;
}

const professionNotes: Record<string, { personality: string; tone: string; helpful: string }> = {
  Healthcare: {
    personality: 'empathetic',
    tone: 'clear and calming',
    helpful: 'I can help you understand symptoms, consultations, and care plans.',
  },
  Technology: {
    personality: 'practical',
    tone: 'direct and supportive',
    helpful: 'I can assist with scoping projects, implementation details, and career guidance.',
  },
  Design: {
    personality: 'creative',
    tone: 'warm and inspiring',
    helpful: 'I can suggest workflow improvements, portfolio tips, and user-first design thinking.',
  },
  Education: {
    personality: 'encouraging',
    tone: 'patient and positive',
    helpful: 'I can recommend study plans, exam strategies, and progress tracking tips.',
  },
  Business: {
    personality: 'strategic',
    tone: 'confident and insightful',
    helpful: 'I can help you connect with talent, optimize workflows, and build your service offering.',
  },
};

const getProfileReply = (professional: Professional, message: string) => {
  const keywords = message.toLowerCase();
  const profile = professionNotes[professional.category] || professionNotes.Technology;

  if (keywords.includes('book') || keywords.includes('appointment') || keywords.includes('schedule')) {
    return `Hi! ${professional.name} is available for a ${professional.role.toLowerCase()} session. Please share your preferred time slot and I will confirm availability.`;
  }

  if (keywords.includes('price') || keywords.includes('cost') || keywords.includes('fee')) {
    return `The standard rate is ${professional.hourlyRate || 'custom pricing'}. I can also help you choose the best package based on your needs.`;
  }

  if (keywords.includes('experience') || keywords.includes('background')) {
    return `${professional.name} has a strong track record in ${professional.skills.slice(0, 3).join(', ')}. ${profile.helpful}`;
  }

  if (keywords.includes('review') || keywords.includes('feedback')) {
    return `Clients love working with ${professional.name} because of their ${profile.personality} approach and reliable delivery. Ask for one specific example and I will share it.`;
  }

  return `I specialize in ${professional.skills.slice(0, 3).join(', ')}. ${profile.helpful} Feel free to tell me what outcome you want and I will respond with personalized next steps.`;
};

const ProfileChat: React.FC<ProfileChatProps> = ({ professional }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'professional',
      text: `Hi, I’m ${professional.name}. I’m online and ready to help you with ${professional.role.toLowerCase()}.`,
      status: 'read',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [, setReceipt] = useState<'sent' | 'delivered' | 'read'>('read');

  const onlineState = professional.available ? 'Online now' : 'Offline - response may be delayed';

  useEffect(() => {
    if (messages.length > 1 && messages[messages.length - 1].sender === 'user') {
      setReceipt('sent');
      setTimeout(() => setReceipt('delivered'), 800);
      setTimeout(() => setReceipt('read'), 1500);
    }
  }, [messages]);

  const handleSend = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    const outgoing: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      status: 'sent',
    };

    setMessages((prev) => [...prev, outgoing]);
    setInput('');
    setIsTyping(true);

    window.setTimeout(() => {
      const reply: ChatMessage = {
        id: `pro-${Date.now()}`,
        sender: 'professional',
        text: getProfileReply(professional, trimmed),
        status: 'read',
      };
      setMessages((prev) => [...prev, reply]);
      setIsTyping(false);
    }, 1200);
  };

  const quickReplies = useMemo(
    () => [
      `Can you confirm your availability this week?`,
      `What should I prepare for the first consultation?`,
      `Can you recommend a follow-up plan after booking?`,
    ],
    []
  );

  return (
    <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-3xl overflow-hidden shadow-sm">
      <div className="flex items-center justify-between gap-4 px-6 py-5 border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]">
        <div>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Live chat with demo profile</p>
          <h3 className="font-heading text-lg font-semibold text-[hsl(var(--foreground))]">{professional.name}</h3>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-white">
          <span className={`h-2.5 w-2.5 rounded-full ${professional.available ? 'bg-emerald-500' : 'bg-amber-400'}`} />
          {onlineState}
        </div>
      </div>

      <div className="p-6 space-y-4 max-h-[420px] overflow-y-auto">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`max-w-[90%] ${message.sender === 'user' ? 'ml-auto bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]' : 'bg-[hsl(var(--cp-blue))] text-white'} rounded-3xl px-4 py-3`}
          >
            <p className="text-sm leading-6">{message.text}</p>
            {message.sender === 'user' && (
              <p className="mt-2 text-[11px] text-[hsl(var(--muted-foreground))] text-right">{message.status}</p>
            )}
          </motion.div>
        ))}
        {isTyping && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-3xl bg-[hsl(var(--muted))] text-sm text-[hsl(var(--muted-foreground))]">
            <CircleDot size={14} className="text-[hsl(var(--cp-blue))] animate-pulse" /> Typing...
          </div>
        )}
      </div>

      <div className="border-t border-[hsl(var(--border))] bg-[hsl(var(--background))] p-5">
        <form onSubmit={handleSend} className="flex items-center gap-3">
          <input
            aria-label="Message demo professional"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 text-sm text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--cp-blue))]/30"
          />
          <button type="submit" className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-[hsl(var(--cp-blue))] text-white hover:bg-[hsl(var(--cp-blue))]/90 transition-all duration-200">
            <Send size={18} />
          </button>
        </form>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {quickReplies.map((reply) => (
            <button
              key={reply}
              type="button"
              onClick={() => setInput(reply)}
              className="rounded-3xl border border-[hsl(var(--border))] px-4 py-3 text-xs text-[hsl(var(--foreground))] text-left hover:bg-[hsl(var(--muted))] transition-all duration-200"
            >
              {reply}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileChat;
