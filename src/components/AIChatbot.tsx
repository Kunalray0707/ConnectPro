import React, { useState, useEffect, useRef } from 'react';
import { Send, Cpu } from 'lucide-react';

const suggestedPrompts = [
  'How can I improve my resume for a senior developer role?',
  'What is the best way to connect with industry mentors?',
  'Give me a message template for a follow-up after a meeting.',
  'Help me optimize my profile headline.',
  'What questions should I ask during an interview?'
];

const getAiResponse = (query: string) => {
  const lower = query.toLowerCase();

  if (!query.trim()) {
    return 'Please ask me anything and I will help you with career advice, profile optimization, scheduling, or matchmaking.';
  }

  if (lower.includes('resume') || lower.includes('cv') || lower.includes('summary')) {
    return 'Focus on your impact: add quantifiable achievements, mention your top technical skills, and keep your summary concise and tailored to the role you want.';
  }

  if (lower.includes('interview') || lower.includes('questions') || lower.includes('prepare')) {
    return 'Prepare with STAR stories, focus on your accomplishments, ask about team culture, and summarize why you are uniquely qualified for the role.';
  }

  if (lower.includes('schedule') || lower.includes('meeting') || lower.includes('availability')) {
    return 'Choose 1-2 preferred time slots, confirm timezone, and offer a short agenda to make scheduling faster and more professional.';
  }

  if (lower.includes('network') || lower.includes('connect') || lower.includes('mentor')) {
    return 'Start with a brief introduction, explain what you are looking for, and mention why you admire their experience. Keep your message polite and to the point.';
  }

  if (lower.includes('profile') || lower.includes('headline') || lower.includes('skills')) {
    return 'Highlight your core strengths in the headline, include keywords from your target role, and make your skills section easy to scan for recruiters.';
  }

  return 'That is a great question! In general, aim for clear goals, strong communication, and thoughtful follow-up. If you share more details, I can give you a more tailored recommendation.';
};

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

const AIChatbot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text: 'Hello! I am your AI Career Assistant. Ask me anything about resumes, networking, interviews, or professional growth.'
    }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMessage = { role: 'user' as const, text: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsThinking(true);

    setTimeout(() => {
      const assistantMessage = { role: 'assistant' as const, text: getAiResponse(trimmed) };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsThinking(false);
    }, 900);
  };

  const applyPrompt = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-3xl overflow-hidden shadow-sm">
      <div className="bg-gradient-to-r from-[hsl(var(--cp-blue))] to-[hsl(var(--cp-violet))] px-6 py-5 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center">
            <Cpu size={24} />
          </div>
          <div>
            <h2 className="font-heading text-lg font-semibold">AI Career Assistant</h2>
            <p className="text-sm text-white/85">Ask anything and get instant guidance for your profile, networking, and growth.</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid gap-4 mb-6 sm:grid-cols-2">
          {[
            { title: 'Smart Profile Tips', text: 'Get AI-backed advice to optimize your headline and summary.' },
            { title: 'Interview Prep', text: 'Receive question frameworks and confidence-building prompts.' },
            { title: 'Scheduler Help', text: 'Ask for quick calendar messages and meeting templates.' },
            { title: 'Resume Boost', text: 'Improve keywords, achievements, and formatting with AI suggestions.' }
          ].map((card) => (
            <div key={card.title} className="rounded-2xl border border-[hsl(var(--border))] p-4 bg-[hsl(var(--background))]">
              <p className="text-sm font-semibold text-[hsl(var(--foreground))] mb-2">{card.title}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">{card.text}</p>
            </div>
          ))}
        </div>

        <div className="space-y-4 max-h-[440px] overflow-y-auto pb-3">
          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={`rounded-3xl px-4 py-3 ${message.role === 'user' ? 'bg-[hsl(var(--muted))] self-end text-[hsl(var(--foreground))]' : 'bg-[hsl(var(--cp-blue))] text-white'}`}>
              <p className="text-sm leading-6">{message.text}</p>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSend} className="mt-4 flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 text-sm text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--cp-blue))]/30"
          />
          <button type="submit" className="inline-flex items-center justify-center rounded-2xl bg-[hsl(var(--cp-blue))] px-4 text-white transition hover:brightness-110">
            <Send size={18} />
          </button>
        </form>

        <div className="mt-5 rounded-3xl bg-[hsl(var(--muted))] p-4 text-sm text-[hsl(var(--muted-foreground))]">
          <div className="font-semibold text-[hsl(var(--foreground))] mb-3">Suggested prompts</div>
          <div className="flex flex-wrap gap-2">
            {suggestedPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => applyPrompt(prompt)}
                className="rounded-full bg-white/90 px-3 py-2 text-xs text-[hsl(var(--foreground))] hover:bg-white"
                type="button"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>
      {isThinking && (
        <div className="border-t border-[hsl(var(--border))] bg-[hsl(var(--background))] px-6 py-4 text-sm text-[hsl(var(--muted-foreground))]">Thinking...</div>
      )}
    </div>
  );
};

export default AIChatbot;
