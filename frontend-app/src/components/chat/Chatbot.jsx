import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  RefreshCw,
  Lightbulb,
  Cpu,
  ChevronDown,
} from 'lucide-react';
import { sendChatMessage } from '../../services/api';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Hello! I am CivicPulse AI, your civic infrastructure assistant. Ask me about reporting an issue, priority scoring, duplicate consolidation, or dispatch status.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef(null);

  const suggestedPrompts = [
    'How does 15m duplicate merging work?',
    'How does YOLO score pothole priority?',
    'What happens after I report an issue?',
    'How is repair completion verified?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const messageText = (textToSend || input).trim();
    if (!messageText || sending) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setSending(true);

    try {
      const response = await sendChatMessage(messageText);
      const botReply = response.reply || 'Thank you for reaching out. Please check the command center for live dispatch updates.';

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: botReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isFallback: response.fallback,
        },
      ]);
    } catch (err) {
      console.warn('[Chat Error]', err.message);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: 'bot',
          text: 'The AI assistant is temporarily unavailable. Please try again in a moment or visit the Command Center.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isError: true,
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Floating Action Pill */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2.5 px-4 py-3 rounded-full bg-navy-800 dark:bg-brand-600 text-white shadow-elevation dark:shadow-darkElevation hover:bg-navy-900 dark:hover:bg-brand-500 hover:scale-105 active:scale-95 transition-all border border-navy-700 dark:border-brand-500 group"
        aria-label="Open CivicPulse AI Assistant"
      >
        <div className="relative">
          <Sparkles className="w-5 h-5 text-cyan-400 dark:text-white animate-pulse-glow" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400" />
        </div>
        <span className="text-xs font-bold tracking-wide">Ask CivicPulse AI</span>
      </button>

      {/* Chat Drawer / Popover */}
      {isOpen && (
        <div className="fixed inset-x-4 bottom-20 sm:inset-auto sm:bottom-20 sm:right-5 z-50 w-auto sm:w-[380px] max-h-[580px] h-[520px] rounded-2xl bg-white dark:bg-[#111C2F] border border-slate-200/95 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-fade-in transition-colors">
          {/* Header */}
          <div className="p-4 bg-navy-800 dark:bg-[#17243A] text-white flex items-center justify-between border-b border-navy-700 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-navy-900 dark:bg-[#111C2F] border border-cyan-500/40 text-cyan-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>CivicPulse Assistant</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                    GEMINI
                  </span>
                </h3>
                <p className="text-[10px] text-slate-300 dark:text-slate-400">Live AI Civic Help &amp; Triage Advisor</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-navy-700 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close assistant"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages scroll area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50 dark:bg-[#0B1220]">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs mt-0.5 ${
                      isUser ? 'bg-brand-600 dark:bg-brand-500 text-white' : 'bg-navy-800 dark:bg-[#17243A] text-cyan-400'
                    }`}
                  >
                    {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  <div className={`max-w-[82%] space-y-1`}>
                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed shadow-subtle ${
                        isUser
                          ? 'bg-brand-600 dark:bg-brand-500 text-white rounded-tr-none'
                          : msg.isError
                          ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-tl-none'
                          : 'bg-white dark:bg-[#17243A] text-navy-900 dark:text-white border border-slate-200/90 dark:border-slate-700 rounded-tl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 block px-1">
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {sending && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-navy-800 dark:bg-[#17243A] text-cyan-400 flex items-center justify-center text-xs">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white dark:bg-[#17243A] border border-slate-200 dark:border-slate-700 p-2.5 rounded-2xl rounded-tl-none text-xs text-slate-500 dark:text-slate-300 shadow-subtle flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500 dark:bg-cyan-400 animate-ping" />
                  <span>Consulting intelligence engine...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Prompts (when few messages) */}
          {messages.length <= 3 && !sending && (
            <div className="px-3 py-2 bg-white dark:bg-[#111C2F] border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[11px]">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-400 shrink-0">Try:</span>
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleSend(prompt)}
                  className="shrink-0 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#17243A] hover:bg-brand-50 dark:hover:bg-[#1E2D4F] hover:text-brand-700 dark:hover:text-cyan-300 text-slate-600 dark:text-slate-300 text-[11px] transition-colors border border-slate-200 dark:border-slate-700"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white dark:bg-[#111C2F] border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about civic triage, priority..."
              disabled={sending}
              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-navy-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50 dark:bg-[#17243A]"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="p-2 rounded-xl bg-brand-600 dark:bg-brand-500 text-white hover:bg-brand-700 dark:hover:bg-brand-400 transition-colors disabled:opacity-40 disabled:pointer-events-none shadow-subtle"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
