import React, { useState } from 'react';
import { 
  Sparkles, Send, Bot, Shield, User, ChevronRight, 
  ArrowRight, PieChart as PieChartIcon, Lock, CheckCircle2 
} from 'lucide-react';
import { useFamily } from '../context/FamilyContext';
import { useAuth } from '../context/AuthContext';
import { AIAssistantService } from '../services/aiAssistantService';
import { ChatMessage } from '../types';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

interface AIAssistantPageProps {
  onNavigate: (page: string) => void;
}

export const AIAssistantPage: React.FC<AIAssistantPageProps> = ({ onNavigate }) => {
  const { family, members, budget, transactions, loans, savingsGoals } = useFamily();
  const { currentUser } = useAuth();

  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello ${currentUser.name.split(' ')[0]}! I am **PennyAI**, your family's personal financial intelligence partner. I analyze verified transactions, forecast month-end spending, and find tailored savings opportunities while strictly preserving individual privacy.\n\nHow can I help you today?`,
      timestamp: 'Just now',
      dataScope: 'PennyWise AI Financial Intelligence Core',
      suggestedActions: [
        { label: 'Family Monthly Budget', route: '/budget' },
        { label: 'Savings Goals', route: '/savings' }
      ]
    }
  ]);

  const suggestedQuestions = [
    "How much did our family spend on groceries?",
    "Which category exceeded its budget?",
    "How much EMI do we have next month?",
    "Can we afford a vacation?",
    "Where can our family reduce expenses?",
    "How much did I spend this month?",
  ];

  const handleSendPrompt = async (promptText: string) => {
    if (!promptText.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputPrompt('');
    setIsTyping(true);

    // Simulate smart thinking delay
    setTimeout(async () => {
      const response = await AIAssistantService.processPrompt(
        promptText,
        currentUser,
        members,
        transactions,
        budget,
        loans,
        savingsGoals
      );
      setMessages(prev => [...prev, response]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col bg-white dark:bg-[#14253A] rounded-3xl border border-gray-100 dark:border-[#1E3553] shadow-sm overflow-hidden">
      {/* Assistant Header */}
      <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-[#1E3553] flex items-center justify-between bg-gray-50/50 dark:bg-[#0B1522]/50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#142B45] to-[#16A36A] text-white flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#142B45] dark:text-white flex items-center space-x-1.5">
              <span>PennyAI Financial Assistant</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-[#16A36A]">
                Online
              </span>
            </h3>
            <p className="text-[11px] text-gray-400">
              Session Persona: {currentUser.name} ({currentUser.role}) • Strict Privacy Guard Active
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-1.5 text-xs text-gray-500 bg-white dark:bg-[#14253A] px-3 py-1.5 rounded-xl border border-gray-200 dark:border-[#1E3553]">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span>Cross-Member Private Data Masked</span>
        </div>
      </div>

      {/* Chat Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-2xl rounded-2xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-[#142B45] text-white rounded-br-none shadow-md'
                  : 'bg-gray-50 dark:bg-[#0B1522] text-[#142B45] dark:text-gray-100 border border-gray-100 dark:border-[#1E3553] rounded-bl-none shadow-sm'
              }`}
            >
              {/* Message text with basic markdown rendering */}
              <div className="whitespace-pre-line space-y-2">
                {msg.text.split('\n\n').map((paragraph, pIdx) => (
                  <p key={pIdx}>
                    {paragraph.split('**').map((part, idx) => (idx % 2 === 1 ? <strong key={idx} className="font-bold text-[#16A36A] dark:text-emerald-400">{part}</strong> : part))}
                  </p>
                ))}
              </div>

              {/* Data Scope & Calculation Period citation */}
              {msg.dataScope && (
                <div className="mt-3 pt-2 border-t border-gray-200 dark:border-[#1E3553] flex items-center justify-between text-[10px] text-gray-400">
                  <span>Scope: {msg.dataScope}</span>
                  <span>Deterministic calculation</span>
                </div>
              )}

              {/* Charts visualization */}
              {msg.charts && msg.charts.data && (
                <div className="mt-4 p-3 rounded-xl bg-white dark:bg-[#14253A] border border-gray-200 dark:border-[#1E3553]">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block mb-2">Visual Breakdown:</span>
                  <div className="h-40 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={msg.charts.data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                        <YAxis tick={{ fontSize: 9 }} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#16A36A" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Recommendations list */}
              {msg.recommendations && msg.recommendations.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-[#1E3553] space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-emerald-600 block">AI Strategic Recommendations:</span>
                  {msg.recommendations.map((rec, rIdx) => (
                    <div key={rIdx} className="flex items-start space-x-1.5 text-xs text-gray-600 dark:text-gray-300">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Action buttons */}
              {msg.suggestedActions && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {msg.suggestedActions.map((action, aIdx) => (
                    <button
                      key={aIdx}
                      onClick={() => onNavigate(action.route.replace('/', ''))}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition"
                    >
                      <span>{action.label}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <span className="text-[10px] text-gray-400 mt-1 px-1">
              {msg.timestamp}
            </span>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center space-x-2 text-xs text-gray-400">
            <div className="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-[#16A36A] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
            </div>
            <span>PennyAI is analyzing family financial ledgers...</span>
          </div>
        )}
      </div>

      {/* Suggested Questions Pills */}
      <div className="px-4 py-2 border-t border-gray-100 dark:border-[#1E3553] bg-gray-50/40 dark:bg-[#0B1522]/40 overflow-x-auto flex space-x-2">
        {suggestedQuestions.map(q => (
          <button
            key={q}
            onClick={() => handleSendPrompt(q)}
            className="text-xs font-medium px-3 py-1.5 rounded-full bg-white dark:bg-[#14253A] border border-gray-200 dark:border-[#1E3553] text-[#142B45] dark:text-gray-300 hover:border-[#16A36A] hover:text-[#16A36A] whitespace-nowrap transition shadow-2xs"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Prompt Input Box */}
      <div className="p-4 border-t border-gray-100 dark:border-[#1E3553] bg-white dark:bg-[#14253A]">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSendPrompt(inputPrompt);
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            placeholder="Ask PennyAI about spending, budgets, EMI or vacation affordability..."
            value={inputPrompt}
            onChange={e => setInputPrompt(e.target.value)}
            className="flex-1 px-4 py-3 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-2xl text-xs sm:text-sm text-[#142B45] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#16A36A]"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isTyping}
            className="p-3 bg-[#16A36A] hover:bg-[#138959] disabled:opacity-40 text-white rounded-2xl shadow-md transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

