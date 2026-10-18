import React, { useState } from 'react';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  CheckCircle, 
  X, 
  FileText, 
  Coffee, 
  BookOpen, 
  Laptop,
  Check,
  AlertCircle
} from 'lucide-react';
import { scanReceiptApi } from '../services/api';
import { formatCurrency } from '../utils';

export default function ReceiptScannerModal({ 
  isOpen, 
  onClose, 
  onAddTransaction, 
  currency, 
  backendOnline 
}) {
  if (!isOpen) return null;

  const [scanning, setScanning] = useState(false);
  const [selectedSample, setSelectedSample] = useState(null);
  const [scannedResult, setScannedResult] = useState(null);

  const sampleReceipts = [
    {
      id: 'campus_cafe',
      title: 'Campus Coffee & Bakery',
      amount: '$14.75',
      icon: Coffee,
      badge: 'Food & Dining',
      desc: 'Caramel Oat Latte + Avocado Sourdough'
    },
    {
      id: 'bookstore',
      title: 'Academic Bookstore',
      amount: '$124.99',
      icon: BookOpen,
      badge: 'Education & Books',
      desc: 'Algorithm Textbook + Graph Paper'
    },
    {
      id: 'tech_store',
      title: 'Apex Tech Electronics',
      amount: '$68.50',
      icon: Laptop,
      badge: 'Shopping',
      desc: 'USB-C 100W Hub + Mouse Mat'
    }
  ];

  const handleScan = async (sampleId) => {
    setSelectedSample(sampleId);
    setScanning(true);
    setScannedResult(null);

    // Simulate scanning laser effect
    setTimeout(async () => {
      const result = await scanReceiptApi(sampleId, backendOnline);
      setScannedResult(result);
      setScanning(false);
    }, 1100);
  };

  const handleApprove = async () => {
    if (!scannedResult) return;
    await onAddTransaction({
      title: scannedResult.title,
      amount: scannedResult.amount,
      type: scannedResult.type,
      category: scannedResult.category,
      date: scannedResult.date,
      notes: scannedResult.notes
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-xl rounded-3xl bg-[#141211] border border-[#2e2a27] shadow-2xl p-6 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#292523] mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/30">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-base">
                  FinAI Receipt Vision OCR
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-950/60 text-violet-300 font-bold border border-violet-800/40">
                  AI OCR
                </span>
              </div>
              <p className="text-[11px] text-[#8c827a]">
                Scan paper or electronic receipts into structured expense entries
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#8c827a] hover:text-white hover:bg-[#201d1b] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload / Pick Sample Receipt */}
        <div className="space-y-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#8c827a]">
            Choose a Sample Receipt or Upload Image
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {sampleReceipts.map((s) => {
              const Icon = s.icon;
              const isSelected = selectedSample === s.id;

              return (
                <div
                  key={s.id}
                  onClick={() => handleScan(s.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#20192e] border-violet-500 shadow-lg shadow-violet-500/20'
                      : 'bg-[#181615] hover:bg-[#201d1b] border-[#2b2725]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-xl bg-[#262220] text-violet-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-mono font-extrabold text-white">
                      {s.amount}
                    </span>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-white line-clamp-1">
                      {s.title}
                    </h5>
                    <p className="text-[10px] text-[#8c827a] line-clamp-1 mt-0.5">
                      {s.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Scanning Animation Area */}
          {scanning && (
            <div className="relative p-6 rounded-2xl bg-[#181615] border border-violet-500/50 flex flex-col items-center justify-center text-center overflow-hidden">
              {/* Laser beam */}
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-violet-400 to-transparent animate-pulse" />
              <Sparkles className="w-8 h-8 text-violet-400 mb-2 animate-bounce" />
              <p className="text-xs font-bold text-white">
                FinAI Vision OCR is parsing receipt text & line items...
              </p>
              <p className="text-[10px] text-[#8c827a] mt-1">
                Extracting merchant, subtotal, tax and category mapping
              </p>
            </div>
          )}

          {/* Scanned Result Card */}
          {scannedResult && !scanning && (
            <div className="p-4 rounded-2xl bg-[#1c1918] border border-[#3d3733] space-y-3 animate-slide-up">
              <div className="flex items-center justify-between pb-2 border-b border-[#2d2825]">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#22c55e]" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Receipt Successfully Extracted
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#163824] text-[#22c55e]">
                  Confidence: 98.4%
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[#8c827a] text-[10px]">Merchant</span>
                  <div className="font-bold text-white">{scannedResult.title}</div>
                </div>
                <div>
                  <span className="text-[#8c827a] text-[10px]">Total Amount</span>
                  <div className="font-mono font-bold text-[#22c55e]">
                    {formatCurrency(scannedResult.amount, currency)}
                  </div>
                </div>
                <div>
                  <span className="text-[#8c827a] text-[10px]">Category</span>
                  <div className="font-bold text-white">{scannedResult.category}</div>
                </div>
                <div>
                  <span className="text-[#8c827a] text-[10px]">Date</span>
                  <div className="font-bold text-white">{scannedResult.date}</div>
                </div>
              </div>

              {scannedResult.items && scannedResult.items.length > 0 && (
                <div className="pt-2 border-t border-[#2d2825]">
                  <span className="text-[10px] text-[#8c827a] font-semibold block mb-1">
                    Detected Line Items:
                  </span>
                  <div className="space-y-1">
                    {scannedResult.items.map((item, idx) => (
                      <div key={idx} className="text-[11px] text-[#c4b5aa] flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-violet-400" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Approve & Add button */}
              <div className="pt-2">
                <button
                  onClick={handleApprove}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Approve & Add to Ledger</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
