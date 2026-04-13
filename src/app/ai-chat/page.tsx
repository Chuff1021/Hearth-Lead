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
  { icon: <BarChart3 className="w-3.5 h-3.5" />, label: 'Weekly summary', prompt: 'Give me a summary of how my business marketing did this week' },
  { icon: <Star className="w-3.5 h-3.5" />, label: 'Draft GBP post', prompt: 'Write a Google Business post about our current fireplace selection' },
  { icon: <Megaphone className="w-3.5 h-3.5" />, label: 'Ad recommendations', prompt: 'What should I do to improve my Google Ads performance?' },
  { icon: <Search className="w-3.5 h-3.5" />, label: 'SEO priorities', prompt: 'What are the top 3 SEO things I should work on this week?' },
  { icon: <Star className="w-3.5 h-3.5" />, label: 'Review response', prompt: 'Help me respond to my latest Google reviews' },
  { icon: <PenTool className="w-3.5 h-3.5" />, label: 'Blog post idea', prompt: 'Suggest a blog post topic that would help my SEO right now' },
  { icon: <Megaphone className="w-3.5 h-3.5" />, label: 'New ad copy', prompt: 'Write new ad copy for my gas fireplace installation campaign' },
  { icon: <Flame className="w-3.5 h-3.5" />, label: 'Permit + marketing', prompt: 'Are there any new subdivisions from permit data that I should target with ads or content?' },
];

export default function AiChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      content: `Hey Aaron! I'm your AI marketing assistant. I can help you with:

**Google Business** — Draft review responses, create posts, analyze your profile performance
**Google Ads** — Review campaign performance, suggest optimizations, write ad copy
**SEO** — Analyze your website, suggest content, track keyword rankings
**Content** — Write blog posts, plan your content calendar, optimize for search
**Strategy** — Connect permit data with marketing opportunities, seasonal planning

What would you like to work on?`,
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
