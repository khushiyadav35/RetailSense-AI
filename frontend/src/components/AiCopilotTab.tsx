import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  User,
  Copy,
  Check,
  Download,
  HelpCircle,
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import { sendChatMessage } from '../api';
import { ChatMessage } from '../types';

interface AiCopilotTabProps {
  initialPrompt?: string;
}

export const AiCopilotTab: React.FC<AiCopilotTabProps> = ({ initialPrompt }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `### 🤖 Welcome to RetailSense AI Copilot

I am your Chief Retail Analytics & Merchandising Consultant. I have live access to your sales transactions, demand forecasts, customer RFM clusters, and anomaly scans.

**How can I assist your business today?**
* Generate a comprehensive C-Suite Executive Action Brief
* Identify top churning customer segments and recommend retention playbooks
* Analyze demand forecast trajectory and optimal pricing elasticity
* Audit negative-margin transactions and coupon stacking leaks`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    'Generate an Executive Summary Brief for leadership',
    'Which customer segment has the highest churn risk and how do we save them?',
    'Explain the 30-day demand forecast and pricing elasticity advice',
    'Audit critical negative-margin orders and anomaly root causes',
    'What inventory reordering strategy should we adopt for top categories?'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await sendChatMessage(textToSend);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: `⚠️ **Error communicating with AI engine:** ${err.message || 'Please verify backend status.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadReport = () => {
    const aiMessages = messages
      .filter((m) => m.sender === 'ai')
      .map((m) => m.text)
      .join('\n\n---\n\n');
    const blob = new Blob([`# RetailSense AI Consultation Report\n\n${aiMessages}`], {
      type: 'text/markdown;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RetailSense_Executive_Report_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-semibold text-white">RetailSense AI Copilot</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-medium">
                Grounded ML Reasoning
              </span>
            </div>
            <p className="text-xs text-slate-400">Context-aware natural language explanations for retail decision makers</p>
          </div>
        </div>

        <button
          onClick={handleDownloadReport}
          title="Download chat session as Markdown executive report"
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-slate-400" />
          <span>Export Report</span>
        </button>
      </div>

      {/* Suggested Prompts Carousel */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center space-x-1 text-slate-500 text-xs flex-shrink-0">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
          <span>Suggested:</span>
        </div>
        {suggestedPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            disabled={loading}
            className="flex-shrink-0 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-indigo-950/60 border border-slate-800 hover:border-indigo-500/40 text-slate-300 hover:text-white text-xs transition cursor-pointer disabled:opacity-50"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div className="h-[480px] rounded-2xl bg-slate-900/60 border border-slate-800 p-4 sm:p-6 overflow-y-auto space-y-4">
        {messages.map((m) => {
          const isAi = m.sender === 'ai';
          return (
            <div
              key={m.id}
              className={`flex items-start space-x-3 ${isAi ? '' : 'flex-row-reverse space-x-reverse'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isAi
                    ? 'bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white'
                    : 'bg-indigo-600 text-white'
                }`}
              >
                {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-2xl rounded-2xl p-4 shadow-md text-xs leading-relaxed relative group ${
                  isAi
                    ? 'bg-slate-950/80 border border-slate-800 text-slate-200'
                    : 'bg-indigo-600 text-white'
                }`}
              >
                {/* Copy button */}
                <button
                  onClick={() => handleCopy(m.id, m.text)}
                  className={`absolute top-2 right-2 p-1 rounded-md opacity-0 group-hover:opacity-100 transition cursor-pointer ${
                    isAi ? 'bg-slate-800 hover:bg-slate-700 text-slate-400' : 'bg-indigo-700 text-white'
                  }`}
                  title="Copy message"
                >
                  {copiedId === m.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>

                {/* Content Render */}
                <div className="prose prose-invert prose-xs max-w-none space-y-2">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: formatMarkdown(m.text)
                    }}
                  />
                </div>

                <div className={`text-[10px] mt-2 font-mono ${isAi ? 'text-slate-500' : 'text-indigo-200'}`}>
                  {m.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
              <span>RetailSense reasoning engine is evaluating transactions & models...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="relative">
        <textarea
          rows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Ask RetailSense anything about sales, forecasts, churn risks, or anomalies (Press Enter)..."
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 pr-14 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition resize-none"
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || loading}
          className="absolute right-3.5 bottom-4 p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white shadow-md shadow-indigo-600/30 transition cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Simple clean markdown formatter for chat bubbles
function formatMarkdown(text: string): string {
  let html = text
    .replace(/^### (.*$)/gim, '<h3 class="text-sm font-bold text-white mt-2 mb-1">$1</h3>')
    .replace(/^#### (.*$)/gim, '<h4 class="text-xs font-bold text-indigo-300 mt-2 mb-1">$1</h4>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong class="text-white font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em class="text-slate-300">$1</em>')
    .replace(/^\* (.*$)/gim, '<li class="ml-4 list-disc text-slate-300">$1</li>')
    .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 list-decimal text-slate-300">$1</li>')
    .replace(/\n\n/gim, '<br/>');

  return html;
}
