import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Sparkles, Copy, Check } from 'lucide-react';
import { sendChatMessage } from '../api';
import { ChatMessage } from '../types';

interface AiCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiCopilotDrawer: React.FC<AiCopilotDrawerProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'drawer-welcome',
      sender: 'ai',
      text: "👋 Hi! I'm your on-demand RetailSense Copilot. Ask me anything about demand, churn risks, pricing scenarios, or anomalies while browsing your dashboard.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const q = textToSend || input;
    if (!q.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `drawer-u-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await sendChatMessage(q);
      const aiMsg: ChatMessage = {
        id: `drawer-ai-${Date.now()}`,
        sender: 'ai',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `drawer-err-${Date.now()}`,
          sender: 'ai',
          text: `Error: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Drawer Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Retail Copilot</h4>
            <span className="text-[10px] text-cyan-400 font-medium">Live Assistant</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
        {messages.map((m) => {
          const isAi = m.sender === 'ai';
          return (
            <div
              key={m.id}
              className={`flex items-start space-x-2 ${isAi ? '' : 'flex-row-reverse space-x-reverse'}`}
            >
              <div
                className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 text-[10px] ${
                  isAi ? 'bg-cyan-600 text-white' : 'bg-indigo-600 text-white'
                }`}
              >
                {isAi ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
              </div>
              <div
                className={`p-3 rounded-xl max-w-[85%] leading-relaxed ${
                  isAi
                    ? 'bg-slate-950 border border-slate-800 text-slate-200'
                    : 'bg-indigo-600 text-white'
                }`}
              >
                <div
                  dangerouslySetInnerHTML={{
                    __html: formatDrawerMarkdown(m.text)
                  }}
                />
                <div className={`text-[9px] mt-1 font-mono ${isAi ? 'text-slate-500' : 'text-indigo-200'}`}>
                  {m.timestamp}
                </div>
              </div>
            </div>
          );
        })}
        {loading && (
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-xs flex items-center space-x-2">
            <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            <span>Evaluating platform signals...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Pills */}
      <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/40 flex space-x-1.5 overflow-x-auto scrollbar-none">
        <button
          onClick={() => handleSend('Generate executive summary brief')}
          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] whitespace-nowrap cursor-pointer"
        >
          Executive Summary
        </button>
        <button
          onClick={() => handleSend('Explain customer churn risks')}
          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] whitespace-nowrap cursor-pointer"
        >
          Churn Risks
        </button>
        <button
          onClick={() => handleSend('Audit critical negative-margin orders')}
          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] whitespace-nowrap cursor-pointer"
        >
          Audit Anomalies
        </button>
      </div>

      {/* Input */}
      <div className="p-3 border-t border-slate-800 bg-slate-950">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your question..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

function formatDrawerMarkdown(text: string): string {
  return text
    .replace(/^### (.*$)/gim, '<strong class="text-indigo-300 block mb-1">$1</strong>')
    .replace(/^#### (.*$)/gim, '<strong class="text-slate-300 block mb-0.5">$1</strong>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong class="text-white font-semibold">$1</strong>')
    .replace(/^\* (.*$)/gim, '<div class="ml-2">• $1</div>')
    .replace(/\n/gim, '<br/>');
}
