import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CircleDot } from 'lucide-react';
import type { Professional } from './ProfileCard';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../lib/socketClient';

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

function makeShortAiReply(professional: Professional, userMessage: string, contextSize: number): string {
  const profile = professionNotes[professional.category] || professionNotes.Technology;
  const m = userMessage.toLowerCase();

  const hasBookingIntent = /(book|appointment|schedule|slot|timing|available)/.test(m);
  const hasPriceIntent = /(price|cost|fee|rate|how much|pricing)/.test(m);
  const hasExperienceIntent = /(experience|background|work|years|portfolio|track record)/.test(m);
  const hasReviewIntent = /(review|feedback|testimonial|rating|people|clients)/.test(m);
  const hasSkillsIntent = /(skill|skills|expert|expertise|what can you do)/.test(m);

  const seed = (userMessage.length + contextSize + professional.name.length) % 7;
  const askVariants = [
    'Which option works best for you?',
    'Do you prefer online or in-person?',
    'What timeline are you aiming for?',
    'What is your main goal?',
    'Can you share one detail so I can tailor the plan?',
    'Would you like a quick first step or a detailed roadmap?',
    'What outcome would make this successful?',
  ];

  const ask = askVariants[seed];

  if (hasBookingIntent) {
    const slotSuggestion = seed % 2 === 0 ? 'tomorrow morning' : 'this evening';
    return `Happy to help, ${professional.name}! For your ${professional.role.toLowerCase()} session, share 1–2 preferred slots (e.g., ${slotSuggestion}). ${ask}`;
  }

  if (hasPriceIntent) {
    const rate = professional.hourlyRate || 'custom pricing';
    return `For ${professional.role.toLowerCase()}, the standard rate is ${rate}. If you tell me your requirement, I’ll suggest the best fit. ${ask}`;
  }

  if (hasExperienceIntent) {
    const topSkills = professional.skills.slice(0, 3).join(', ');
    return `${professional.name} has strong experience in ${topSkills}. I’ll guide you with clear, ${profile.tone} next steps. ${ask}`;
  }

  if (hasReviewIntent) {
    const topSkills = professional.skills.slice(0, 2).join(' & ');
    return `Clients value ${professional.name} for a ${profile.tone} approach and reliable delivery. Tell me what you’re looking for, and I’ll share a relevant example. ${ask}`;
  }

  if (hasSkillsIntent) {
    const topSkills = professional.skills.slice(0, 3).join(', ');
    return `I specialize in ${topSkills} (${professional.category}). Share your goal and I’ll recommend the quickest path forward. ${ask}`;
  }

  // Default: short category-based opener + question
  return `${profile.helpful} To help faster: ${ask}`;
}

const getProfileReply = (professional: Professional, message: string) => {
  // Keep backward compatibility with demo-only call sites.
  return makeShortAiReply(professional, message, 1);
};

function chatRoomKey(userId: string, professionalId: string) {
  return `chat:${userId}:${professionalId}`;
}

const ProfileChat: React.FC<ProfileChatProps> = ({ professional }) => {
  const { currentUser } = useAuth();

  // Demo fallback state (kept intact)
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
  const [receipt, setReceipt] = useState<'sent' | 'delivered' | 'read'>('read');

  const onlineState = professional.available ? 'Online now' : 'Offline - response may be delayed';

  const canUseLiveChat = Boolean(currentUser?.id && professional?.id);

  useEffect(() => {
    if (messages.length > 1 && messages[messages.length - 1].sender === 'user') {
      setReceipt('sent');
      const t1 = window.setTimeout(() => setReceipt('delivered'), 800);
      const t2 = window.setTimeout(() => setReceipt('read'), 1500);
      return () => {
        window.clearTimeout(t1);
        window.clearTimeout(t2);
      };
    }
    return;
  }, [messages]);

  // Live chat wiring (socket -> UI). If live chat can't be used, demo behavior stays.
  useEffect(() => {
    if (!canUseLiveChat) return;

    const socket = getSocket();
    const userId = currentUser!.id;
    const professionalId = professional.id;
    const room = chatRoomKey(userId, professionalId);

    // Join room for this user/professional pair
    socket.emit('join', { room });

    const onMessage = (message: { id: string; sender: 'user' | 'professional'; text: string; status?: 'sent' | 'delivered' | 'read' }) => {
      // We only render messages relevant to this chat room.
      setMessages((prev) => [
        ...prev,
        {
          id: message.id,
          sender: message.sender,
          text: message.text,
          status: (message.status ?? 'read') as ChatMessage['status'],
        },
      ]);
    };

    const onTyping = (payload: { userId: string; professionalId: string; typing: boolean }) => {
      if (payload?.professionalId !== professionalId) return;
      // Show typing indicator when professional is typing (i.e., other side)
      const typing = Boolean(payload?.typing);
      setIsTyping(typing);
    };

    socket.on('chat:message', onMessage as any);
    socket.on('chat:typing', onTyping as any);

    return () => {
      socket.off('chat:message', onMessage as any);
      socket.off('chat:typing', onTyping as any);
    };
  }, [canUseLiveChat, currentUser?.id, professional.id]);

  const handleSend = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    // Optimistic UI message
    const outgoing: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      status: 'sent',
    };

    setMessages((prev) => [...prev, outgoing]);
    setInput('');
    setIsTyping(true);

    if (canUseLiveChat) {
      // Live mode: send to backend; professional typing will be emitted by backend later
      const socket = getSocket();
      const userId = currentUser!.id;
      const professionalId = professional.id;

      socket.emit('chat:typing', { userId, professionalId, typing: false });
      socket.emit('chat:send', { userId, professionalId, text: trimmed });

      // We keep isTyping false quickly; backend will drive real typing later when implemented.
      window.setTimeout(() => setIsTyping(false), 300);
      return;
    }

    // Demo mode: auto reply
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
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Live chat {canUseLiveChat ? '' : '(demo)'} with {professional.available ? 'online' : 'offline'} profile</p>
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
            className={`max-w-[90%] ${
              message.sender === 'user'
                ? 'ml-auto bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]'
                : 'bg-[hsl(var(--cp-blue))] text-white'
            } rounded-3xl px-4 py-3`}
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
            aria-label="Message professional"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 text-sm text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--cp-blue))]/30"
          />
          <button
            type="submit"
            className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-[hsl(var(--cp-blue))] text-white hover:bg-[hsl(var(--cp-blue))]/90 transition-all duration-200"
          >
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
