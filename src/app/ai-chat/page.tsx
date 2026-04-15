'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Loader2, Zap, User, Flame, Megaphone, Search, Star, PenTool, BarChart3 } from 'lucide-react';

interface Message {
  role: 'user' | 'ai';
  content: string;
  category?: string;
  timestamp: Date;
}

const QUICK_PROMPTS = [
  { icon: <BarChart3 className="w-3.5 h-3.5" />, label: 'Weekly strategy', prompt: 'Give me my weekly marketing strategy. What should I focus on this week across Google Ads, SEO, Google Business, content, and lead outreach? Prioritize by impact and ROI.' },
  { icon: <User className="w-3.5 h-3.5" />, label: 'Beat competitors', prompt: 'Analyze my competitors and give me a detailed competitive strategy. What are they doing that I\'m not? What am I doing better? How do I win against each one specifically?' },
  { icon: <Megaphone className="w-3.5 h-3.5" />, label: 'Optimize ads', prompt: 'Analyze all of my Google Ads campaigns. Which ones are performing well? Which need work? Give me specific changes to make — keywords to add, budgets to adjust, ad copy to test.' },
  { icon: <Search className="w-3.5 h-3.5" />, label: 'SEO roadmap', prompt: 'Give me a comprehensive SEO strategy. Analyze my rankings, page health, and content gaps. What keywords should I prioritize? What content do I need to create? What technical fixes are most urgent?' },
  { icon: <Star className="w-3.5 h-3.5" />, label: 'GBP strategy', prompt: 'How do I dominate local search with my Google Business Profile? Analyze my reviews, posts, and compare me to competitors. What should I post this week? How do I get more reviews?' },
  { icon: <PenTool className="w-3.5 h-3.5" />, label: '30-day content plan', prompt: 'Create a 30-day content plan. Give me blog post topics with keywords, Google Business posts, and social media ideas. Each tied to a business goal.' },
  { icon: <Star className="w-3.5 h-3.5" />, label: 'Respond to reviews', prompt: 'Help me respond to my Google reviews that need responses. Draft personalized replies for each one.' },
  { icon: <Flame className="w-3.5 h-3.5" />, label: 'Permit opportunities', prompt: 'Analyze my permit data and tell me which subdivisions and builders I should target with marketing. Should I create any new Google Ads campaigns, blog posts, or outreach based on construction trends?' },
  { icon: <Megaphone className="w-3.5 h-3.5" />, label: 'Write ad copy', prompt: 'Write new responsive search ad copy for my gas fireplace installation campaign. Give me 10 headlines and 4 descriptions optimized for Springfield MO.' },
  { icon: <BarChart3 className="w-3.5 h-3.5" />, label: 'ROI report', prompt: 'Give me an ROI analysis. Which marketing channels are generating the most revenue? Google Ads vs organic search vs permit outreach vs Google Business — where should I put more money?' },
];

export default function AiChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      content: `Hey Aaron. I'm your AI marketing strategist — think of me as your virtual CMO.

I have access to all your business data: **479 building permits**, your **lead pipeline**, **Google Ads campaigns**, **SEO rankings**, **Google Business reviews**, and **competitor intelligence**.

Ask me anything, or hit one of the buttons below. Here are the big ones:

**"Beat competitors"** — I'll analyze every competitor and tell you exactly how to win
**"Weekly strategy"** — Your prioritized action plan for this week
**"Optimize ads"** — Specific changes to improve your Google Ads ROI
**"SEO roadmap"** — What to fix on your website and what content to create

I analyze your actual data and give you specific, actionable moves — not generic advice. What do you want to tackle?`,
      category: 'general',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(text?: string) {
    const msg = text || input.trim();
    if (!msg) return;

    setInput('');
    const userMsg: Message = { role: 'user', content: msg, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg }),
      });

      const data = await res.json();
      const aiMsg: Message = {
        role: 'ai',
        content: data.response || 'Sorry, I had trouble processing that. Try again.',
        category: data.category,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'ai',
        content: 'Sorry, something went wrong. Make sure the app is running and try again.',
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="page-header flex-shrink-0">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Zap className="w-6 h-6 text-indigo-600" /> AI Marketing Assistant
          </h1>
          <p className="page-subtitle">Ask me anything about your marketing — I&apos;ll analyze data and draft content for your approval.</p>
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="flex flex-wrap gap-2 mb-4 flex-shrink-0">
        {QUICK_PROMPTS.map(qp => (
          <button
            key={qp.label}
            onClick={() => sendMessage(qp.prompt)}
            disabled={loading}
            className="btn-ghost btn-xs border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
          >
            {qp.icon} {qp.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto card p-4 mb-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'ai' && (
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4 text-indigo-600" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-xl px-4 py-3 ${msg.role === 'user' ? 'bg-orange-600 text-white' : 'bg-gray-50 text-gray-800'}`}>
              <div className="text-sm whitespace-pre-wrap leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: msg.content
                    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\n/g, '<br />')
                }}
              />
              {msg.category && msg.role === 'ai' && (
                <span className="inline-block mt-2 badge-gray text-[9px]">{msg.category}</span>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-orange-600" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="bg-gray-50 rounded-xl px-4 py-3">
              <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2 flex-shrink-0">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your ads, SEO, reviews, or say 'what should I focus on this week?'"
          className="input flex-1"
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()} className="btn-primary">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
}
