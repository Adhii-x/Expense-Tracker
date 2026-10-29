import React, { useState } from 'react';
import { 
  Plus, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Wifi
} from 'lucide-react';
import { formatCurrency } from '../utils';

export default function CardsWidget({ 
  cards, 
  currency, 
  onTransferClick, 
  onRequestClick
}) {
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  const displayCards = cards && cards.length > 0 ? cards : [
    { id: '1', type: 'VISA', last4: '4892', balance: 12850.00, expiry: '08/28', holder: 'Ethan Reynolds' },
    { id: '2', type: 'Mastercard', last4: '6150', balance: 6150.00, expiry: '11/27', holder: 'Ethan Reynolds' },
    { id: '3', type: 'VISA', last4: '3140', balance: 3140.00, expiry: '03/29', holder: 'Ethan Reynolds' }
  ];

  const activeCard = displayCards[activeCardIndex] || displayCards[0];

  return (
    <div className="cards-widget overview-wallet rounded-3xl bg-white p-5 border border-slate-200 shadow-sm flex flex-col justify-between h-full transition-all">
      
      {/* Header: My cards + Add new */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-extrabold text-slate-900 text-base tracking-tight">
            Payment card
          </h3>
          <button
            onClick={() => onTransferClick('card')}
            className="flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full bg-[#e3e7fc] hover:bg-[#d5defb] text-[#0056ff] border border-[#d5defb] transition-all"
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
            className="absolute top-0 inset-x-4 h-12 rounded-2xl bg-[#e3e7fc] border border-[#cbd8ff] opacity-80 cursor-pointer hover:opacity-100 transition-all flex items-center justify-between px-4 text-xs font-semibold text-[#2277ff]"
          >
            <span>VISA</span>
            <span>₹6,150.00</span>
          </div>

          {/* Card Tab 2 (Middle layer) */}
          <div 
            onClick={() => setActiveCardIndex((activeCardIndex + 2) % displayCards.length)}
            className="absolute top-3 inset-x-2 h-12 rounded-2xl bg-[#cbdcff] border border-[#aec8ff] opacity-90 cursor-pointer hover:opacity-100 transition-all flex items-center justify-between px-4 text-xs font-semibold text-[#0056ff]"
          >
            <span>Mastercard</span>
            <span>₹3,140.00</span>
          </div>

          {/* Active Foreground Card (Glossy metallic dark carbon) */}
          <div className="relative z-10 payment-card-face rounded-2xl bg-gradient-to-br from-[#0056ff] via-[#2277ff] to-[#75aaff] border border-blue-300 p-5 shadow-xl shadow-blue-900/20 overflow-hidden text-white transition-all transform hover:-translate-y-0.5">
            
            {/* Subtle glow orb */}
            <div className="absolute -right-10 -bottom-10 w-36 h-36 bg-white/15 rounded-full blur-2xl pointer-events-none" />

            {/* Card Brand & Chip */}
            <div className="flex items-center justify-between mb-6">
              <span className="font-extrabold text-base tracking-widest text-white">
                {activeCard.type}
              </span>
              
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-white/75 rotate-90" />
                {/* Gold EMV Chip */}
                <div className="payment-chip w-8 h-6 rounded-md bg-gradient-to-tr from-[#e3e7fc] via-white to-[#a9c8ff] border border-white/80 shadow-sm flex items-center justify-center">
                  <div className="w-5 h-4 border border-blue-500/30 rounded-sm" />
                </div>
              </div>
            </div>

            {/* Balance Header & Big Amount */}
            <div className="mb-4">
              <span className="text-[11px] font-medium text-white/70">Card balance</span>
              <div className="flex items-center gap-2.5 mt-0.5">
                <h4 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  {formatCurrency(activeCard.balance, currency)}
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-white/15 border border-white/20 text-white text-[10px] font-bold">
                  ↑ 3.52%
                </span>
              </div>
            </div>

            {/* Masked Card Number & Holder */}
            <div className="payment-card-footer flex items-end justify-between pt-2 border-t border-white/20 text-[11px] font-mono text-white/75">
              <span>•••• •••• •••• {activeCard.last4}</span>
              <span className="payment-card-holder">{activeCard.holder || 'Card holder'}</span>
            </div>

          </div>

        </div>

        {/* Action Buttons: Request (Income) & Transfer (Expense) */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          
          {/* Request Button */}
          <button
            onClick={onRequestClick}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#e3e7fc] hover:bg-[#d5defb] text-[#0056ff] text-xs sm:text-sm font-bold border border-[#d5defb] shadow-sm transition-all group"
          >
            <ArrowDownLeft className="w-4 h-4 text-[#2277ff] group-hover:text-[#0056ff] transition-colors" />
            <span>Request</span>
          </button>

          {/* Transfer Button */}
          <button
            onClick={() => onTransferClick('expense')}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#0056ff] to-[#2277ff] hover:from-[#004be0] hover:to-[#1768eb] text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-700/20 transition-all group"
          >
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            <span>Transfer</span>
          </button>

        </div>
      </div>

    </div>
  );
}
