import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Copy, Check, Save } from 'lucide-react';
import { SharedHistoryProps } from '../types';

export default function VatCalculator({ layoutMode = 'scroll', onAddHistory }: { layoutMode?: 'scroll' | 'fit' } & SharedHistoryProps) {
  const [totalSales, setTotalSales] = useState<string>('');
  const [vatableSales, setVatableSales] = useState<number | null>(null);
  const [vat, setVat] = useState<number | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [historySaved, setHistorySaved] = useState<boolean>(false);

  useEffect(() => {
    const salesNum = parseFloat(totalSales);
    if (!isNaN(salesNum) && salesNum > 0) {
      const vs = salesNum / 1.12;
      const v = salesNum - vs;
      setVatableSales(vs);
      setVat(v);
    } else {
      setVatableSales(null);
      setVat(null);
    }
    setHistorySaved(false);
  }, [totalSales]);

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    
    // Auto-add to history log on copy
    if (vatableSales !== null && vat !== null) {
      const parsedSales = parseFloat(totalSales) || 0;
      onAddHistory?.(
        'VAT',
        'VAT Calculation',
        `Priced ₱${parsedSales.toLocaleString('en-PH', { minimumFractionDigits: 2 })} Input total`,
        key === 'vs' 
          ? `Vatable Sales: ${formatCurrency(vatableSales)}` 
          : `VAT (12%): ${formatCurrency(vat)}`
      );
    }

    setTimeout(() => {
      setCopiedKey(null);
    }, 1500);
  };

  const saveToHistoryLog = () => {
    if (vatableSales === null || vat === null) return;
    const parsedSales = parseFloat(totalSales) || 0;
    onAddHistory?.(
      'VAT',
      'VAT Calculation',
      `Total: ₱${parsedSales.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`,
      `Vatable: ${formatCurrency(vatableSales)} | VAT: ${formatCurrency(vat)}`
    );
    setHistorySaved(true);
    setTimeout(() => setHistorySaved(false), 2000);
  };

  return (
    <div className={`bg-white dark:bg-stone-900 rounded-3xl shadow-lg border border-gray-250/90 dark:border-stone-800 transition-all ${
      layoutMode === 'scroll' ? 'p-5 xs:p-6 mb-2' : 'p-3.5 xs:p-5'
    }`}>
      <div className={layoutMode === 'scroll' ? 'mb-4.5' : 'mb-3.5'}>
        <label className={`block font-bold text-gray-400 uppercase tracking-widest px-1 ${
          layoutMode === 'scroll' ? 'text-xs mb-2' : 'text-[10px] mb-1.5'
        }`}>
          Total Sales Amount
        </label>
        <div className="relative">
          <span className={`absolute top-1/2 -translate-y-1/2 text-yellow-600 font-bold transition-all ${
            layoutMode === 'scroll' ? 'left-4 text-xl' : 'left-3'
          }`}>₱</span>
          <input
            type="number"
            inputMode="decimal"
            value={totalSales}
            onChange={(e) => setTotalSales(e.target.value)}
            placeholder="0.00"
            className={`w-full bg-yellow-50 dark:bg-stone-850 text-gray-800 dark:text-stone-100 border-2 border-transparent focus:border-yellow-400 focus:bg-white dark:focus:bg-stone-800 transition-all outline-none ${
              layoutMode === 'scroll'
                ? 'rounded-2xl py-3.5 pl-10 pr-4 text-2xl font-black'
                : 'rounded-xl py-2.5 pl-8 pr-3 text-xl font-bold'
            }`}
          />
        </div>
      </div>

      <div className={layoutMode === 'scroll' ? 'space-y-3' : 'space-y-2'}>
        {/* Vatable Sales */}
        <div className={`bg-gray-50 dark:bg-stone-850/60 rounded-2xl flex justify-between items-center group transition-all hover:bg-yellow-50 dark:hover:bg-yellow-950/20 ${
          layoutMode === 'scroll' ? 'p-4' : 'p-3'
        }`}>
          <div className="flex-1 min-w-0 pr-2">
            <p className={`font-bold text-gray-400 uppercase tracking-widest ${
              layoutMode === 'scroll' ? 'text-xs' : 'text-[10px]'
            }`}>Vatable Sales (V.S.)</p>
            <div className="flex items-center gap-1.5 mt-0.5 sm:mt-0 flex-wrap">
              <span className={`font-black text-gray-750 dark:text-stone-200 truncate tracking-tight transition-all ${
                layoutMode === 'scroll' ? 'text-xl xs:text-2xl py-0.5' : 'text-lg font-bold'
              }`}>
                {vatableSales !== null ? formatCurrency(vatableSales) : '₱0.00'}
              </span>
              {vatableSales !== null && (
                <button
                  onClick={() => handleCopy(vatableSales.toFixed(2), 'vs')}
                  className={`font-semibold text-yellow-905 dark:text-yellow-400 bg-yellow-105 dark:bg-stone-800/70 hover:bg-yellow-200/80 dark:hover:bg-stone-750 rounded-md flex items-center gap-1 transition-all active:scale-95 border border-yellow-250/30 dark:border-stone-750/50 ${
                    layoutMode === 'scroll' ? 'p-1 px-2.5 text-xs' : 'p-0.5 px-1.5 text-[9px]'
                  }`}
                  title="Copy numeric value"
                >
                  {copiedKey === 'vs' ? (
                    <>
                      <Check size={layoutMode === 'scroll' ? 12 : 10} className="text-green-600 dark:text-green-400" />
                      <span className={`text-green-600 dark:text-green-400 font-bold ${layoutMode === 'scroll' ? 'text-xs' : 'text-[8px]'}`}>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={layoutMode === 'scroll' ? 12 : 10} className="text-yellow-800 dark:text-yellow-400" />
                      <span className={layoutMode === 'scroll' ? 'text-xs font-bold' : 'text-[8px]'}>Copy</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
          <div className={`shrink-0 rounded-full bg-gray-200 dark:bg-stone-800/80 group-hover:bg-yellow-200 dark:group-hover:bg-yellow-450/20 flex items-center justify-center transition-all ${
            layoutMode === 'scroll' ? 'w-10 h-10 text-xs font-black' : 'w-8 h-8 text-[9px] font-bold'
          }`}>
            <span className="text-gray-500 dark:text-stone-450 font-bold">1.12</span>
          </div>
        </div>

        {/* VAT Amount */}
        <div className={`bg-gray-50 dark:bg-stone-850/60 rounded-2xl flex justify-between items-center group transition-all hover:bg-yellow-50 dark:hover:bg-yellow-950/20 ${
          layoutMode === 'scroll' ? 'p-4' : 'p-3'
        }`}>
          <div className="flex-1 min-w-0 pr-2">
            <p className={`font-bold text-gray-400 uppercase tracking-widest ${
              layoutMode === 'scroll' ? 'text-xs' : 'text-[10px]'
            }`}>VAT Amount</p>
            <div className="flex items-center gap-1.5 mt-0.5 sm:mt-0 flex-wrap">
              <span className={`font-black text-yellow-600 dark:text-yellow-400 truncate tracking-tight transition-all ${
                layoutMode === 'scroll' ? 'text-xl xs:text-2xl py-0.5' : 'text-lg font-bold'
              }`}>
                {vat !== null ? formatCurrency(vat) : '₱0.00'}
              </span>
              {vat !== null && (
                <button
                  onClick={() => handleCopy(vat.toFixed(2), 'vat')}
                  className={`font-semibold text-yellow-905 dark:text-yellow-400 bg-yellow-105 dark:bg-stone-800/70 hover:bg-yellow-200/80 dark:hover:bg-stone-750 rounded-md flex items-center gap-1 transition-all active:scale-95 border border-yellow-250/30 dark:border-stone-750/50 ${
                    layoutMode === 'scroll' ? 'p-1 px-2.5 text-xs' : 'p-0.5 px-1.5 text-[9px]'
                  }`}
                  title="Copy numeric value"
                >
                  {copiedKey === 'vat' ? (
                    <>
                      <Check size={layoutMode === 'scroll' ? 12 : 10} className="text-green-600 dark:text-green-400" />
                      <span className={`text-green-600 dark:text-green-400 font-bold ${layoutMode === 'scroll' ? 'text-xs' : 'text-[8px]'}`}>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={layoutMode === 'scroll' ? 12 : 10} className="text-yellow-800 dark:text-yellow-400" />
                      <span className={layoutMode === 'scroll' ? 'text-xs font-bold' : 'text-[8px]'}>Copy</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
          <div className={`shrink-0 rounded-full bg-gray-200 dark:bg-stone-800/80 group-hover:bg-yellow-200 dark:group-hover:bg-yellow-450/20 flex items-center justify-center transition-all ${
            layoutMode === 'scroll' ? 'w-10 h-10 text-xs font-black' : 'w-8 h-8 text-[9px] font-bold'
          }`}>
            <span className="text-gray-500 dark:text-stone-450 font-bold">12%</span>
          </div>
        </div>
      </div>

      <div className={`flex flex-col gap-2 ${layoutMode === 'scroll' ? 'mt-4' : 'mt-3'}`}>
        <div className={`bg-yellow-400 dark:bg-yellow-405 text-white dark:text-stone-900 rounded-xl ${
          layoutMode === 'scroll' ? 'p-4' : 'p-3'
        } flex justify-between items-center gap-3`}>
          <div>
            <p className={`font-bold uppercase tracking-widest opacity-80 ${
              layoutMode === 'scroll' ? 'text-[10px] mb-1' : 'text-[8.5px] mb-0.5'
            }`}>Formula</p>
            <div className={`font-bold opacity-95 flex gap-2 sm:gap-4 flex-wrap ${
              layoutMode === 'scroll' ? 'text-xs' : 'text-[10px]'
            }`}>
              <span>TOTAL ÷ 1.12 = V.S.</span>
              <span>TOTAL − V.S. = VAT</span>
            </div>
          </div>
          
          {vatableSales !== null && (
            <button
              onClick={saveToHistoryLog}
              className={`font-black flex items-center justify-center gap-1 bg-white/20 hover:bg-white/35 active:scale-95 transition-all text-white border border-white/10 shrink-0 ${
                layoutMode === 'scroll' ? 'py-1.5 px-3 rounded-lg text-[10px]' : 'py-1 px-2.5 rounded-md text-[9px]'
              }`}
              title="Save current estimate details to calculation history"
            >
              {historySaved ? (
                <>
                  <Check size={layoutMode === 'scroll' ? 12 : 10} />
                  <span>LOGGED!</span>
                </>
              ) : (
                <>
                  <Save size={layoutMode === 'scroll' ? 12 : 10} />
                  <span>SAVE TO LOG</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
