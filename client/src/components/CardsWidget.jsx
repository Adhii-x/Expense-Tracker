import React, { useState } from 'react';
import { 
  Plus, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Wifi, 
  CreditCard,
  ExternalLink
} from 'lucide-react';
import { formatCurrency, formatDate } from '../utils';

export default function CardsWidget({ 
  cards, 
  transactions, 
  currency, 
  onTransferClick, 
  onRequestClick, 
  onViewAllClick 
}) {
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  const displayCards = cards && cards.length > 0 ? cards : [
    { id: '1', type: 'VISA', last4: '4892', balance: 12850.00, expiry: '08/28', holder: 'Ethan Reynolds' },
    { id: '2', type: 'Mastercard', last4: '6150', balance: 6150.00, expiry: '11/27', holder: 'Ethan Reynolds' },
    { id: '3', type: 'VISA', last4: '3140', balance: 3140.00, expiry: '03/29', holder: 'Ethan Reynolds' }
  ];

  const activeCard = displayCards[activeCardIndex] || displayCards[0];
  const recentTransactions = transactions.slice(0, 4);

  return (
    <div className="rounded-3xl bg-gradient-to-b from-[#181615] to-[#121110] p-6 border border-[#262220] shadow-xl flex flex-col justify-between h-full transition-all">
      
      {/* Header: My cards + Add new */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-extrabold text-white text-base tracking-tight">
            My cards
          </h3>
          <button
            onClick={() => onTransferClick('card')}
            className="flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full bg-[#24201e] hover:bg-[#2e2a27] text-[#a89d95] hover:text-white border border-[#332e2b] transition-all"
          >
            <Plus className="w-3 h-3" />
            <span>Add new</span>
          </button>
        </div>

        {/* Layered 3D Cards Stack */}
        <div className="relative pt-6 pb-2 mb-4">
          
          {/* Card Tab 1 (Background layer) */}
          <div 
            onClick={() => setActiveCardIndex((activeCardIndex + 1) % displayCards.length)}
            className="absolute top-0 inset-x-4 h-12 rounded-2xl bg-[#2e2926] border border-[#3d3834] opacity-50 cursor-pointer hover:opacity-75 transition-all flex items-center justify-between px-4 text-xs font-semibold text-[#8c827a]"
          >
            <span>VISA</span>
            <span>₹6,150.00</span>
          </div>

          {/* Card Tab 2 (Middle layer) */}
          <div 
            onClick={() => setActiveCardIndex((activeCardIndex + 2) % displayCards.length)}
            className="absolute top-3 inset-x-2 h-12 rounded-2xl bg-[#24201e] border border-[#38332f] opacity-80 cursor-pointer hover:opacity-100 transition-all flex items-center justify-between px-4 text-xs font-semibold text-[#a89d95]"
          >
            <span>Mastercard</span>
            <span>₹3,140.00</span>
          </div>

          {/* Active Foreground Card (Glossy metallic dark carbon) */}
          <div className="relative z-10 rounded-2xl bg-gradient-to-br from-[#262220] via-[#1c1918] to-[#131110] border border-[#3d3733] p-5 shadow-2xl overflow-hidden text-white transition-all transform hover:-translate-y-0.5">
            
            {/* Subtle glow orb */}
            <div className="absolute -right-10 -bottom-10 w-36 h-36 bg-[#ff6b00]/15 rounded-full blur-2xl pointer-events-none" />

            {/* Card Brand & Chip */}
            <div className="flex items-center justify-between mb-6">
              <span className="font-extrabold text-base tracking-widest text-[#e6ded8]">
                {activeCard.type}
              </span>
              
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-[#8c827a] rotate-90" />
                {/* Gold EMV Chip */}
                <div className="w-8 h-6 rounded-md bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 border border-amber-300 shadow-sm flex items-center justify-center">
                  <div className="w-5 h-4 border border-amber-800/40 rounded-sm" />
                </div>
              </div>
            </div>

            {/* Balance Header & Big Amount */}
            <div className="mb-4">
              <span className="text-[11px] font-medium text-[#8c827a]">Balance</span>
              <div className="flex items-center gap-2.5 mt-0.5">
                <h4 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  {formatCurrency(activeCard.balance, currency)}
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-[#163824] border border-[#22c55e]/30 text-[#22c55e] text-[10px] font-bold">
                  ↑ 3.52%
                </span>
              </div>
            </div>

            {/* Masked Card Number & Holder */}
            <div className="flex items-end justify-between pt-2 border-t border-[#332e2b]/60 text-[11px] font-mono text-[#a89d95]">
              <span>•••• •••• •••• {activeCard.last4}</span>
              <span className="uppercase text-[10px] font-sans tracking-wider">{activeCard.expiry}</span>
            </div>

          </div>

        </div>

        {/* Action Buttons: Request (Income) & Transfer (Expense) */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          
          {/* Request Button */}
          <button
            onClick={onRequestClick}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#24201e] hover:bg-[#2e2a27] text-white text-xs sm:text-sm font-bold border border-[#332e2b] shadow-md transition-all group"
          >
            <ArrowDownLeft className="w-4 h-4 text-[#8c827a] group-hover:text-white transition-colors" />
            <span>Request</span>
          </button>

          {/* Transfer Button (Glowing Sunset Orange) */}
          <button
            onClick={() => onTransferClick('expense')}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#ff6b00] to-[#ea580c] hover:from-[#ff771a] hover:to-[#f97316] text-white text-xs sm:text-sm font-bold shadow-lg shadow-[#ff6b00]/25 transition-all group"
          >
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            <span>Transfer</span>
          </button>

        </div>
      </div>

      {/* Recent Transactions List (matching reference image) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-bold text-white text-xs tracking-wider uppercase">
            Recent Transactions
          </h4>
          <button
            onClick={onViewAllClick}
            className="text-xs font-semibold text-[#8c827a] hover:text-[#ff6b00] transition-colors"
          >
            View All
          </button>
        </div>

        <div className="space-y-2.5">
          {recentTransactions.map((tx, idx) => {
            const isIncome = tx.type === 'income';
            
            // Stylized avatars / logos
            const avatarInitials = tx.title ? tx.title.substring(0, 2).toUpperCase() : 'TX';
            const colors = ['bg-indigo-600', 'bg-emerald-600', 'bg-amber-600', 'bg-rose-600'];
            const avatarBg = colors[idx % colors.length];

            return (
              <div
                key={tx.id || idx}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-[#181615] hover:bg-[#201d1b] border border-[#262220] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl ${avatarBg} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm`}>
                    {avatarInitials}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white tracking-tight line-clamp-1">
                      {tx.title}
                    </h5>
                    <p className="text-[10px] text-[#8c827a]">
                      {formatDate(tx.date)}
                    </p>
                  </div>
                </div>

                <span className={`text-xs font-mono font-bold ${
                  isIncome ? 'text-[#22c55e]' : 'text-[#e6ded8]'
                }`}>
                  {isIncome ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
