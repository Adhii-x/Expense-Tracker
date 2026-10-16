import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  X, 
  Check, 
  Zap, 
  TrendingUp, 
  DollarSign, 
  AlertCircle,
  Lightbulb,
  PlusCircle
} from 'lucide-react';
import { askAiAgentApi, parseNaturalLanguageTransactionApi } from '../services/api';

export default function AiCopilotModal({ 
  isOpen, 
  onClose, 
  transactions, 
  budget, 
  totalBalance, 
  totalIncome, 
  totalExpenses, 
  onAddTransaction, 
  currency,
  backendOnline
}) {
  if (!isOpen) return null;

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'm-1',
      sender: 'ai',
      text: `👋 Hello Ethan! I am your **FinAI Financial Agent**.\n\nI have analyzed your **${transactions.length} recorded transactions**. Your financial health score is **${Math.min(100, Math.max(35, Math.round((totalBalance / (totalIncome || 1)) * 100 + 42)))}/100**.\n\nAsk me how to optimize your savings, predict next month's cashflow, or type natural language like *"Spent $45 on groceries today"* to automatically log transactions!`,
      parsedTx: null
    }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const quickPrompts = [
    'How can I save $200 this month?',
    'What is my highest expense category?',
    'Can I afford a $150 textbook right now?',
    'Spent $38.50 on campus groceries'
  ];

  const handleSend = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg = { id: 'm-' + Date.now(), sender: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Check if user is asking to add or record an expense/income via natural language
      const isNaturalLog = /(spent|paid|bought|received|earned|got paid|deposit|purchase)/i.test(query) && /\d+/.test(query);

      let parsed = null;
      if (isNaturalLog) {
        parsed = await parseNaturalLanguageTransactionApi(query, backendOnline);
      }

      // Query AI Agent reasoning
      const aiResponse = await askAiAgentApi(
        query,
        { totalBalance, totalIncome, totalExpenses, transactions, budget },
        backendOnline
      );

      const aiMsg = {
        id: 'm-' + (Date.now() + 1),
        sender: 'ai',
        text: aiResponse.reply || 'Analysis completed.',
        parsedTx: parsed,
        suggestedActions: aiResponse.suggestedActions
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { id: 'm-' + (Date.now() + 1), sender: 'ai', text: 'FinAI Agent encountered an issue. Please try again.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyParsed = async (tx) => {
    await onAddTransaction(tx);
    setMessages(prev => [
      ...prev,
      {
        id: 'm-' + Date.now(),
        sender: 'ai',
        text: `✅ **Logged to Ledger!** Added **${tx.title}** (${tx.type === 'income' ? '+' : '-'}$${tx.amount.toFixed(2)}) under **${tx.category}**.`
      }
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl rounded-3xl bg-[#141211] border border-[#2e2a27] shadow-2xl flex flex-col h-[650px] max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#1a1715] border-b border-[#292523] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#ff6b00] to-amber-500 flex items-center justify-center text-white shadow-lg shadow-[#ff6b00]/25">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-base tracking-tight">
                  FinAI Copilot
                </h3>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#163824] text-[#22c55e] text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                  Active
                </span>
              </div>
              <p className="text-[11px] text-[#8c827a]">
                Autonomous financial reasoning & spending copilot
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#8c827a] hover:text-white hover:bg-[#24201e] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-6 py-2.5 bg-[#171513] border-b border-[#24201e] flex gap-2 overflow-x-auto scrollbar-none">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              className="px-3 py-1.5 rounded-xl bg-[#201d1b] hover:bg-[#2a2624] text-[11px] font-medium text-[#c4b5aa] hover:text-white border border-[#2e2a27] whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0"
            >
              <Sparkles className="w-3 h-3 text-[#ff6b00]" />
              <span>{p}</span>
            </button>
          ))}
        </div>

        {/* Chat Messages Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((m) => {
            const isUser = m.sender === 'user';

            return (
              <div
                key={m.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#ff6b00] to-amber-500 text-white flex items-center justify-center shrink-0 mt-1 shadow-md">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-gradient-to-r from-[#ff6b00] to-[#ea580c] text-white shadow-lg'
                    : 'bg-[#1c1918] text-[#e6ded8] border border-[#2b2725] shadow-md'
                }`}>
                  <div className="whitespace-pre-line font-sans">
                    {m.text}
                  </div>

                  {/* Interactive Parsed Transaction Action Card */}
                  {m.parsedTx && (
                    <div className="mt-3 p-3 rounded-xl bg-[#26211e] border border-[#ff6b00]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#ff8c33]">
                          ⚡ AI Detected Transaction
                        </span>
                        <div className="text-sm font-bold text-white mt-0.5">
                          {m.parsedTx.title} • {m.parsedTx.type === 'income' ? '+' : '-'}${m.parsedTx.amount.toFixed(2)}
                        </div>
                        <span className="text-[11px] text-[#a89d95]">
                          Category: {m.parsedTx.category} • Date: {m.parsedTx.date}
                        </span>
                      </div>

                      <button
                        onClick={() => handleApplyParsed(m.parsedTx)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#22c55e] hover:bg-[#16a34a] text-black font-extrabold text-xs shadow-md transition-all self-start sm:self-auto"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Add to Ledger</span>
                      </button>
                    </div>
                  )}

                  {/* Suggested action buttons */}
                  {m.suggestedActions && m.suggestedActions.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-[#2d2825] flex flex-wrap gap-1.5">
                      {m.suggestedActions.map((act, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(act)}
                          className="px-2.5 py-1 rounded-lg bg-[#262220] hover:bg-[#332e2b] text-[10px] font-semibold text-[#ff8c33] border border-[#3b3531] transition-all"
                        >
                          {act}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-[#24201e] border border-[#38332f] text-white flex items-center justify-center shrink-0 mt-1 font-bold text-xs">
                    ER
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#ff6b00] to-amber-500 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3.5 rounded-2xl bg-[#1c1918] border border-[#2b2725] text-xs text-[#a89d95] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#ff6b00] animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-[#ff6b00] animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-[#ff6b00] animate-bounce [animation-delay:0.4s]" />
                <span>FinAI is reasoning through your spending metrics...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-[#1a1715] border-t border-[#292523]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask FinAI or type: 'Spent $45 on groceries'..."
              className="flex-1 bg-[#201d1b] border border-[#2e2a27] focus:border-[#ff6b00] rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-[#736a63] focus:outline-none transition-all"
            />

            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-3 rounded-2xl bg-gradient-to-r from-[#ff6b00] to-[#ea580c] hover:from-[#ff771a] hover:to-[#f97316] text-white shadow-lg shadow-[#ff6b00]/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
