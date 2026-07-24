import React, { useState, useMemo } from 'react';
import { 
  Banknote, 
  Copy, 
  Check, 
  Save, 
  RotateCcw, 
  SlidersHorizontal, 
  Info, 
  ChevronDown,
  ChevronUp,
  X,
  Maximize2,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SharedHistoryProps } from '../types';

interface ComponentProps extends SharedHistoryProps {
  layoutMode?: 'scroll' | 'fit';
}

export interface DenominationSpec {
  value: number;
  label: string;
  type: 'bill' | 'coin';
  colorBg: string;
  colorText: string;
  borderColor: string;
  accentBadge: string;
}

export const PHP_DENOMINATIONS: DenominationSpec[] = [
  { value: 1000, label: '1000', type: 'bill', colorBg: 'bg-blue-50 dark:bg-blue-950/30', colorText: 'text-blue-700 dark:text-blue-400', borderColor: 'border-blue-200 dark:border-blue-800/60', accentBadge: 'bg-blue-600 text-white' },
  { value: 500, label: '500', type: 'bill', colorBg: 'bg-amber-50 dark:bg-amber-950/30', colorText: 'text-amber-800 dark:text-amber-400', borderColor: 'border-amber-200 dark:border-amber-800/60', accentBadge: 'bg-amber-500 text-white' },
  { value: 200, label: '200', type: 'bill', colorBg: 'bg-emerald-50 dark:bg-emerald-950/30', colorText: 'text-emerald-700 dark:text-emerald-400', borderColor: 'border-emerald-200 dark:border-emerald-800/60', accentBadge: 'bg-emerald-600 text-white' },
  { value: 100, label: '100', type: 'bill', colorBg: 'bg-purple-50 dark:bg-purple-950/30', colorText: 'text-purple-700 dark:text-purple-400', borderColor: 'border-purple-200 dark:border-purple-800/60', accentBadge: 'bg-purple-600 text-white' },
  { value: 50, label: '50', type: 'bill', colorBg: 'bg-rose-50 dark:bg-rose-950/30', colorText: 'text-rose-700 dark:text-rose-400', borderColor: 'border-rose-200 dark:border-rose-800/60', accentBadge: 'bg-rose-600 text-white' },
  { value: 20, label: '20', type: 'bill', colorBg: 'bg-orange-50 dark:bg-orange-950/30', colorText: 'text-orange-800 dark:text-orange-400', borderColor: 'border-orange-200 dark:border-orange-800/60', accentBadge: 'bg-orange-600 text-white' },
  { value: 10, label: '10', type: 'coin', colorBg: 'bg-yellow-50 dark:bg-stone-900', colorText: 'text-yellow-900 dark:text-yellow-400', borderColor: 'border-yellow-250 dark:border-stone-800', accentBadge: 'bg-yellow-500 text-stone-950' },
  { value: 5, label: '5', type: 'coin', colorBg: 'bg-gray-100 dark:bg-stone-900', colorText: 'text-gray-700 dark:text-stone-300', borderColor: 'border-gray-250 dark:border-stone-800', accentBadge: 'bg-gray-600 text-white' },
  { value: 1, label: '1', type: 'coin', colorBg: 'bg-gray-50 dark:bg-stone-900', colorText: 'text-gray-600 dark:text-stone-400', borderColor: 'border-gray-200 dark:border-stone-800', accentBadge: 'bg-stone-500 text-white' },
  { value: 0.25, label: '0.25', type: 'coin', colorBg: 'bg-amber-100/40 dark:bg-stone-900', colorText: 'text-amber-900 dark:text-amber-500', borderColor: 'border-amber-300/40 dark:border-stone-800', accentBadge: 'bg-amber-700 text-white' }
];

export type BreakdownMode = 'FEWEST_BILLS' | 'SMALLER_BILLS';
export type SmallerBillCap = 'MAX_1000_1' | 'MAX_1000_0' | 'PREFER_100_50';

/**
 * Safe client-side math evaluator for standard calculator expressions
 */
function evaluateArithmetic(expr: string): number {
  if (!expr || !expr.trim()) return 0;
  try {
    const cleaned = expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/x/gi, '*')
      .replace(/[^0-9.+-/*()]/g, '');

    if (!cleaned) return 0;

    // eslint-disable-next-line no-new-func
    const result = new Function(`"use strict"; return (${cleaned});`)();
    if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
      return Math.max(0, Math.round(result * 100) / 100);
    }
  } catch {
    const tokenParts = expr.split(/[+/*-]/).filter(Boolean);
    if (tokenParts.length > 0) {
      const lastVal = parseFloat(tokenParts[tokenParts.length - 1]);
      if (!isNaN(lastVal)) return Math.max(0, lastVal);
    }
  }
  return 0;
}

export default function CashBreakdownCalculator({ layoutMode = 'scroll', onAddHistory }: ComponentProps) {
  // Input Expression State
  const [expression, setExpression] = useState<string>('2000 + 25000 + 4');
  const [evalResult, setEvalResult] = useState<number | null>(null);

  // Popup Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Toggleable Strategy & Options State
  const [showStrategyOptions, setShowStrategyOptions] = useState<boolean>(false);
  const [breakdownMode, setBreakdownMode] = useState<BreakdownMode>('FEWEST_BILLS');
  const [smallerCap, setSmallerCap] = useState<SmallerBillCap>('MAX_1000_1');
  const [showZeroCounts, setShowZeroCounts] = useState<boolean>(false);
  const [disabledValues, setDisabledValues] = useState<number[]>([]);

  // UI status feedback
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [historySaved, setHistorySaved] = useState<boolean>(false);

  // Live running total from arithmetic expression or explicit equal evaluation
  const runningTotal = useMemo(() => {
    if (evalResult !== null) return evalResult;
    return evaluateArithmetic(expression);
  }, [expression, evalResult]);

  // Toggle single denomination enable/disable state
  const toggleDenomination = (val: number) => {
    setDisabledValues((prev) => {
      if (prev.includes(val)) {
        return prev.filter((v) => v !== val);
      } else {
        return [...prev, val];
      }
    });
  };

  const enableAllDenominations = () => setDisabledValues([]);

  // Calculate Breakdown based on runningTotal, enabled denominations, and breakdownMode
  const breakdownResult = useMemo(() => {
    const totalToBreak = runningTotal;
    if (totalToBreak <= 0) {
      return {
        counts: {},
        allocatedTotal: 0,
        leftover: 0,
        totalItems: 0,
        totalBills: 0,
        totalCoins: 0
      };
    }

    const activeDenoms = PHP_DENOMINATIONS
      .filter((d) => !disabledValues.includes(d.value))
      .map((d) => d.value)
      .sort((a, b) => b - a);

    const counts: { [val: number]: number } = {};
    let remaining = totalToBreak;

    if (breakdownMode === 'FEWEST_BILLS') {
      for (const val of activeDenoms) {
        if (remaining <= 0) break;
        if (val <= remaining) {
          const count = Math.floor(remaining / val);
          counts[val] = count;
          remaining = Math.round((remaining - count * val) * 100) / 100;
        }
      }
    } else {
      let max1000Cap = Infinity;
      if (smallerCap === 'MAX_1000_1') max1000Cap = 1;
      else if (smallerCap === 'MAX_1000_0') max1000Cap = 0;
      else if (smallerCap === 'PREFER_100_50') max1000Cap = 0;

      for (const val of activeDenoms) {
        if (remaining <= 0) break;

        let maxAllowedForThisVal = Infinity;
        if (val === 1000) {
          maxAllowedForThisVal = max1000Cap;
        } else if (smallerCap === 'PREFER_100_50' && val === 500) {
          maxAllowedForThisVal = 2;
        }

        if (val <= remaining && maxAllowedForThisVal > 0) {
          const calculatedCount = Math.floor(remaining / val);
          const finalCount = Math.min(calculatedCount, maxAllowedForThisVal);
          
          if (finalCount > 0) {
            counts[val] = finalCount;
            remaining = Math.round((remaining - finalCount * val) * 100) / 100;
          }
        }
      }

      if (remaining > 0) {
        for (const val of activeDenoms) {
          if (remaining <= 0) break;
          if (val === 1000 && max1000Cap === 0) continue;

          const currentCount = counts[val] || 0;
          if (val <= remaining) {
            const addCount = Math.floor(remaining / val);
            counts[val] = currentCount + addCount;
            remaining = Math.round((remaining - addCount * val) * 100) / 100;
          }
        }
      }
    }

    let allocatedTotal = 0;
    let totalItems = 0;
    let totalBills = 0;
    let totalCoins = 0;

    PHP_DENOMINATIONS.forEach((d) => {
      const c = counts[d.value] || 0;
      allocatedTotal += c * d.value;
      totalItems += c;
      if (d.type === 'bill') totalBills += c;
      else totalCoins += c;
    });

    return {
      counts,
      allocatedTotal: Math.round(allocatedTotal * 100) / 100,
      leftover: Math.max(0, Math.round(remaining * 100) / 100),
      totalItems,
      totalBills,
      totalCoins
    };
  }, [runningTotal, disabledValues, breakdownMode, smallerCap]);

  // Keypad button handler for Ordinary Calculator
  const handleKeypadPress = (val: string) => {
    setHistorySaved(false);
    
    if (val === 'AC') {
      setExpression('0');
      setEvalResult(null);
    } else if (val === '⌫') {
      setEvalResult(null);
      setExpression((prev) => {
        if (prev.length <= 1 || prev === '0') return '0';
        return prev.slice(0, -1);
      });
    } else if (val === '=') {
      const calculated = evaluateArithmetic(expression);
      setEvalResult(calculated);
      setExpression(calculated.toString());
    } else {
      setEvalResult(null);
      setExpression((prev) => {
        if (prev === '0' && !['+', '-', '×', '÷', '.'].includes(val)) {
          return val;
        }
        // Replace last operator if another operator is pressed
        const lastChar = prev.slice(-1);
        const operators = ['+', '-', '×', '÷'];
        if (operators.includes(lastChar) && operators.includes(val)) {
          return prev.slice(0, -1) + val;
        }
        return prev + val;
      });
    }
  };

  // Copy short breakdown list
  const handleCopyBreakdown = () => {
    if (runningTotal <= 0) return;
    
    const lines: string[] = [];
    PHP_DENOMINATIONS.forEach((d) => {
      const count = breakdownResult.counts[d.value] || 0;
      if (count > 0 || showZeroCounts) {
        lines.push(`${d.label} x ${count} pcs`);
      }
    });

    const summaryText = `Cash Breakdown (₱${runningTotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}):\n` +
      lines.join('\n') +
      (breakdownResult.leftover > 0 ? `\nUnallocated: ₱${breakdownResult.leftover.toFixed(2)}` : '');

    navigator.clipboard.writeText(summaryText);
    setCopiedKey('breakdown-summary');
    setTimeout(() => setCopiedKey(null), 1800);
  };

  // Save calculation to shared history log
  const handleSaveToHistory = () => {
    if (runningTotal <= 0) return;
    
    const parts: string[] = [];
    PHP_DENOMINATIONS.forEach((d) => {
      const count = breakdownResult.counts[d.value] || 0;
      if (count > 0) {
        parts.push(`${d.label} x ${count} pcs`);
      }
    });

    const formulaStr = `Expr: ${expression || '0'} | Mode: ${breakdownMode === 'FEWEST_BILLS' ? 'Fewest' : 'Smaller Bills'}`;
    const resultStr = `₱${runningTotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })} = [ ${parts.join(', ')} ]`;

    if (onAddHistory) {
      onAddHistory('CASH_BREAKDOWN', 'Cash Breakdown', formulaStr, resultStr);
    }
    setHistorySaved(true);
    setTimeout(() => setHistorySaved(false), 2000);
  };

  // Active items for short breakdown
  const activeBreakdownItems = useMemo(() => {
    return PHP_DENOMINATIONS.filter((d) => {
      const count = breakdownResult.counts[d.value] || 0;
      if (showZeroCounts) return !disabledValues.includes(d.value);
      return count > 0;
    });
  }, [breakdownResult.counts, showZeroCounts, disabledValues]);

  return (
    <div className={`space-y-3 ${layoutMode === 'fit' ? 'text-xs' : 'text-sm'}`}>
      
      {/* 1. ORDINARY CALCULATOR CARD */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-4 sm:p-5 border-2 border-yellow-250 dark:border-stone-800 shadow-md space-y-3">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-yellow-101 dark:border-stone-800 pb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-yellow-400 dark:bg-yellow-405 text-stone-950 font-black shadow-xs">
              <Banknote size={16} />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black uppercase text-yellow-950 dark:text-yellow-400 tracking-wide leading-none">
                Cash Calculator
              </h3>
              <span className="text-[8.5px] font-bold text-gray-400 dark:text-stone-500 uppercase tracking-wider block mt-0.5">
                Philippine Peso (PHP)
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setExpression('0');
              setEvalResult(null);
            }}
            className="p-1.5 px-2.5 rounded-xl bg-yellow-50 dark:bg-stone-800 text-yellow-900 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-stone-750 transition-all text-[9px] font-black flex items-center gap-1 border border-yellow-200 dark:border-stone-750"
            title="Clear Display"
          >
            <RotateCcw size={12} />
            <span>AC</span>
          </button>
        </div>

        {/* Ordinary Display Screen */}
        <div className="bg-stone-950 dark:bg-black text-white rounded-2xl p-4 border border-yellow-450/40 dark:border-stone-800 relative overflow-hidden shadow-inner space-y-1">
          <div className="flex justify-between items-center text-[9px] font-mono text-gray-400 uppercase tracking-wider">
            <span>INPUT EXPRESSION</span>
            <span className="text-yellow-400 font-bold">PHP ₱</span>
          </div>

          {/* Formula Line */}
          <div className="text-right text-xs sm:text-sm font-mono text-yellow-200/80 truncate min-h-[1.25rem]">
            {expression || '0'}
          </div>

          {/* Large Evaluated Total Line */}
          <div className="flex items-baseline justify-between gap-2 pt-1 border-t border-white/10">
            <span className="text-xs font-bold text-yellow-500 font-mono">=</span>
            <div className="flex items-baseline gap-1 font-mono font-black text-2xl xs:text-3xl sm:text-4xl text-yellow-400 tracking-tight text-right overflow-x-auto scrollbar-none">
              <span className="text-lg sm:text-2xl text-yellow-500">₱</span>
              <span>{runningTotal.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Ordinary Keypad with Equal Sign */}
        <div className="grid grid-cols-4 gap-1.5 pt-1">
          {[
            { label: 'AC', cls: 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40' },
            { label: '⌫', cls: 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40' },
            { label: '÷', cls: 'bg-yellow-400 text-stone-950 dark:bg-yellow-405 dark:text-stone-950' },
            { label: '×', cls: 'bg-yellow-400 text-stone-950 dark:bg-yellow-405 dark:text-stone-950' },
            
            { label: '7', cls: 'bg-gray-100 dark:bg-stone-800 text-gray-800 dark:text-stone-100' },
            { label: '8', cls: 'bg-gray-100 dark:bg-stone-800 text-gray-800 dark:text-stone-100' },
            { label: '9', cls: 'bg-gray-100 dark:bg-stone-800 text-gray-800 dark:text-stone-100' },
            { label: '-', cls: 'bg-yellow-400 text-stone-950 dark:bg-yellow-405 dark:text-stone-950' },
            
            { label: '4', cls: 'bg-gray-100 dark:bg-stone-800 text-gray-800 dark:text-stone-100' },
            { label: '5', cls: 'bg-gray-100 dark:bg-stone-800 text-gray-800 dark:text-stone-100' },
            { label: '6', cls: 'bg-gray-100 dark:bg-stone-800 text-gray-800 dark:text-stone-100' },
            { label: '+', cls: 'bg-yellow-400 text-stone-950 dark:bg-yellow-405 dark:text-stone-950' },
            
            { label: '1', cls: 'bg-gray-100 dark:bg-stone-800 text-gray-800 dark:text-stone-100' },
            { label: '2', cls: 'bg-gray-100 dark:bg-stone-800 text-gray-800 dark:text-stone-100' },
            { label: '3', cls: 'bg-gray-100 dark:bg-stone-800 text-gray-800 dark:text-stone-100' },
            { label: '=', cls: 'bg-stone-950 text-yellow-400 dark:bg-yellow-400 dark:text-stone-950 font-black shadow-md border-2 border-yellow-400 dark:border-yellow-300 row-span-2' },
            
            { label: '0', cls: 'bg-gray-100 dark:bg-stone-800 text-gray-800 dark:text-stone-100' },
            { label: '00', cls: 'bg-gray-100 dark:bg-stone-800 text-gray-800 dark:text-stone-100' },
            { label: '.', cls: 'bg-gray-100 dark:bg-stone-800 text-gray-800 dark:text-stone-100' }
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => handleKeypadPress(item.label)}
              className={`py-3 rounded-2xl text-sm sm:text-base font-black font-mono transition-all active:scale-95 outline-none flex items-center justify-center ${item.cls}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. MINIMIZED / COMPACT OPTIMAL CASH BREAKDOWN CARD */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-3 sm:p-4 border-2 border-yellow-250 dark:border-stone-800 shadow-md space-y-2">
        {/* Main Header & Pop Up Trigger Button */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="p-1.5 rounded-lg bg-yellow-400 dark:bg-yellow-405 text-stone-950 shrink-0 font-black">
              <Sparkles size={14} />
            </span>
            <div className="truncate">
              <h4 className="text-xs font-black uppercase text-yellow-950 dark:text-yellow-400 tracking-wider truncate">
                Optimal Cash Breakdown
              </h4>
              <p className="text-[9px] font-bold text-gray-400 dark:text-stone-500 uppercase tracking-wider truncate">
                {runningTotal > 0 ? `${breakdownResult.totalItems} Pcs Total` : 'Enter amount above'}
              </p>
            </div>
          </div>

          {/* POP UP BUTTON */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="py-1.5 px-3 rounded-xl bg-stone-950 hover:bg-stone-900 dark:bg-yellow-400 dark:hover:bg-yellow-405 text-white dark:text-stone-950 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shrink-0 shadow-sm transition-all active:scale-95"
          >
            <span>Pop Up Report</span>
            <Maximize2 size={12} />
          </button>
        </div>

        {/* MINIMAL INLINE REPORT PREVIEW (COMPACT LIST / CHIPS) */}
        {runningTotal > 0 ? (
          <div className="bg-stone-50 dark:bg-stone-950 rounded-xl p-2.5 border border-yellow-101/80 dark:border-stone-800 space-y-2">
            {/* Inline Badges Summary */}
            <div className="flex flex-wrap gap-1.5 font-mono text-[11px] font-black">
              {activeBreakdownItems.map((d) => {
                const count = breakdownResult.counts[d.value] || 0;
                return (
                  <span
                    key={d.value}
                    className="px-2 py-0.5 rounded-lg bg-white dark:bg-stone-900 text-stone-900 dark:text-yellow-400 border border-gray-200 dark:border-stone-800 shadow-xs flex items-center gap-1"
                  >
                    <span className="text-gray-500 dark:text-stone-400 font-normal">{d.label} x</span>
                    <span className="text-amber-800 dark:text-yellow-400 font-extrabold">{count} pcs</span>
                  </span>
                );
              })}
            </div>

            {/* Quick Action Strip */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-150 dark:border-stone-850">
              <span className="text-[9px] font-bold text-gray-400 dark:text-stone-500 uppercase font-mono">
                Mode: {breakdownMode === 'FEWEST_BILLS' ? 'Fewest' : 'Smaller Bills'}
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCopyBreakdown}
                  className="px-2 py-1 rounded-lg bg-yellow-50 dark:bg-stone-800 hover:bg-yellow-100 text-yellow-950 dark:text-yellow-400 text-[9.5px] font-black uppercase tracking-wider flex items-center gap-1 border border-yellow-200 dark:border-stone-750 transition-all"
                >
                  {copiedKey === 'breakdown-summary' ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                  <span>Copy</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveToHistory}
                  className="px-2 py-1 rounded-lg bg-yellow-400 hover:bg-yellow-405 dark:bg-yellow-405 text-stone-950 text-[9.5px] font-black uppercase tracking-wider flex items-center gap-1 transition-all"
                >
                  {historySaved ? <Check size={11} className="text-stone-950" /> : <Save size={11} />}
                  <span>Save</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-3 bg-stone-50 dark:bg-stone-950 rounded-xl text-gray-400 dark:text-stone-500 text-[10px] font-mono border border-dashed border-gray-200 dark:border-stone-800">
            Enter cash numbers to generate optimal breakdown
          </div>
        )}
      </div>

      {/* 3. OPTIMAL CASH BREAKDOWN POPUP MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.15 }}
              className="bg-white dark:bg-stone-900 rounded-3xl w-full max-w-lg p-4 sm:p-6 border-2 border-yellow-400 dark:border-yellow-400/80 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-yellow-101 dark:border-stone-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-yellow-400 dark:bg-yellow-405 text-stone-950 font-black shadow-xs">
                    <Banknote size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black uppercase text-yellow-950 dark:text-yellow-400 tracking-wide leading-none">
                      Optimal Cash Breakdown
                    </h3>
                    <span className="text-[9.5px] font-bold text-gray-400 dark:text-stone-500 uppercase tracking-wider block mt-0.5 font-mono">
                      Total: ₱{runningTotal.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-stone-800 dark:hover:bg-stone-750 text-gray-700 dark:text-stone-300 transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Strategy Options Toggle Header inside Popup */}
              <div className="flex items-center justify-between bg-yellow-50/70 dark:bg-stone-850 p-2.5 rounded-2xl border border-yellow-200 dark:border-stone-750">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase text-yellow-950 dark:text-yellow-400 font-mono">
                    {breakdownResult.totalItems} Pcs ({breakdownResult.totalBills} Bills, {breakdownResult.totalCoins} Coins)
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowStrategyOptions(!showStrategyOptions)}
                  className="py-1 px-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 bg-yellow-400 text-stone-950 hover:bg-yellow-405 shadow-xs"
                >
                  <SlidersHorizontal size={12} />
                  <span>{showStrategyOptions ? 'Hide Options' : 'Strategy Options'}</span>
                  {showStrategyOptions ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
              </div>

              {/* COLLAPSIBLE STRATEGY DRAWER INSIDE POPUP */}
              {showStrategyOptions && (
                <div className="bg-yellow-50/50 dark:bg-stone-850 p-3 rounded-2xl border border-yellow-200 dark:border-stone-750 space-y-3 animate-[fadeIn_0.15s_ease-out]">
                  <div className="space-y-1.5">
                    <span className="text-[9.5px] font-black uppercase tracking-wider text-amber-950 dark:text-yellow-400 block">
                      Breakdown Strategy Mode:
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setBreakdownMode('FEWEST_BILLS')}
                        className={`py-2 px-3 rounded-xl text-[10px] font-black transition-all border outline-none ${
                          breakdownMode === 'FEWEST_BILLS'
                            ? 'bg-yellow-400 text-stone-950 border-yellow-500 shadow-xs'
                            : 'bg-white dark:bg-stone-900 text-gray-600 dark:text-stone-300 border-gray-200 dark:border-stone-750'
                        }`}
                      >
                        ⚡ FEWEST BILLS
                      </button>
                      <button
                        type="button"
                        onClick={() => setBreakdownMode('SMALLER_BILLS')}
                        className={`py-2 px-3 rounded-xl text-[10px] font-black transition-all border outline-none ${
                          breakdownMode === 'SMALLER_BILLS'
                            ? 'bg-yellow-400 text-stone-950 border-yellow-500 shadow-xs'
                            : 'bg-white dark:bg-stone-900 text-gray-600 dark:text-stone-300 border-gray-200 dark:border-stone-750'
                        }`}
                      >
                        🔄 SMALLER BILLS (CHANGE)
                      </button>
                    </div>
                  </div>

                  {breakdownMode === 'SMALLER_BILLS' && (
                    <div className="space-y-1.5 pt-1 border-t border-yellow-200/60 dark:border-stone-750">
                      <span className="text-[9px] font-black uppercase tracking-wider text-amber-900 dark:text-yellow-400 block">
                        Smaller Bills Cap Options:
                      </span>
                      <div className="grid grid-cols-3 gap-1">
                        {[
                          { id: 'MAX_1000_1', label: 'Max 1x ₱1000' },
                          { id: 'MAX_1000_0', label: 'No ₱1000' },
                          { id: 'PREFER_100_50', label: 'Prefer ₱100/₱50' }
                        ].map((capOpt) => (
                          <button
                            key={capOpt.id}
                            type="button"
                            onClick={() => setSmallerCap(capOpt.id as SmallerBillCap)}
                            className={`py-1 px-1.5 rounded-lg text-[8.5px] font-black border transition-all ${
                              smallerCap === capOpt.id
                                ? 'bg-amber-600 text-white border-amber-700'
                                : 'bg-white dark:bg-stone-900 text-gray-600 dark:text-stone-300 border-gray-200 dark:border-stone-750'
                            }`}
                          >
                            {capOpt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Denomination Toggles */}
                  <div className="space-y-1.5 pt-1 border-t border-yellow-200/60 dark:border-stone-750">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-amber-950 dark:text-stone-300 uppercase tracking-wider">
                        Enable / Disable Denominations:
                      </span>
                      <button
                        type="button"
                        onClick={enableAllDenominations}
                        className="text-[8.5px] font-black text-amber-800 dark:text-yellow-400 uppercase hover:underline"
                      >
                        Enable All
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {PHP_DENOMINATIONS.map((d) => {
                        const isDisabled = disabledValues.includes(d.value);
                        return (
                          <button
                            key={d.value}
                            type="button"
                            onClick={() => toggleDenomination(d.value)}
                            className={`py-0.5 px-2 rounded-lg text-[9.5px] font-black font-mono border transition-all ${
                              isDisabled
                                ? 'bg-gray-100 text-gray-400 border-gray-200 line-through dark:bg-stone-800 dark:text-stone-600'
                                : `${d.colorBg} ${d.colorText} ${d.borderColor}`
                            }`}
                          >
                            ₱{d.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Toggle Zero Counts Display */}
                  <div className="flex items-center justify-between pt-1 border-t border-yellow-200/60 dark:border-stone-750">
                    <span className="text-[9px] font-black text-amber-950 dark:text-stone-300 uppercase tracking-wider">
                      Show 0 pcs Denominations:
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowZeroCounts(!showZeroCounts)}
                      className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase transition-all ${
                        showZeroCounts
                          ? 'bg-amber-600 text-white'
                          : 'bg-gray-200 dark:bg-stone-800 text-gray-700 dark:text-stone-400'
                      }`}
                    >
                      {showZeroCounts ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>
              )}

              {/* Unallocated Leftover Alert */}
              {breakdownResult.leftover > 0 && (
                <div className="bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 px-3 py-2 rounded-xl text-xs font-black flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Info size={14} />
                    Unallocated Leftover:
                  </span>
                  <span className="font-mono text-sm font-black">₱{breakdownResult.leftover.toFixed(2)}</span>
                </div>
              )}

              {/* SHORT & SIMPLE DETAILED LIST */}
              <div className="bg-stone-50 dark:bg-stone-950 rounded-2xl p-3 border border-yellow-101/80 dark:border-stone-800 space-y-2 font-mono">
                {activeBreakdownItems.length > 0 ? (
                  activeBreakdownItems.map((d) => {
                    const count = breakdownResult.counts[d.value] || 0;
                    const subtotal = count * d.value;

                    return (
                      <div
                        key={d.value}
                        className="flex items-center justify-between py-2 px-3.5 rounded-xl bg-white dark:bg-stone-900 border border-gray-150 dark:border-stone-800 text-xs font-black hover:border-yellow-400 transition-all"
                      >
                        <div className="flex items-baseline gap-2">
                          <span className="text-stone-900 dark:text-stone-100 text-sm font-black w-14">
                            {d.label}
                          </span>
                          <span className="text-gray-400 font-bold">x</span>
                          <span className="text-amber-800 dark:text-yellow-400 text-sm font-black">
                            {count} pcs
                          </span>
                        </div>

                        <span className="text-gray-600 dark:text-stone-300 text-xs font-bold">
                          ₱{subtotal.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-400 dark:text-stone-500 text-xs font-mono">
                    Enter an amount to view breakdown report
                  </div>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-gray-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={handleCopyBreakdown}
                  disabled={runningTotal <= 0}
                  className="flex-1 py-3 px-4 rounded-2xl bg-stone-950 hover:bg-stone-900 dark:bg-yellow-400 dark:hover:bg-yellow-405 text-white dark:text-stone-950 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] disabled:opacity-40"
                >
                  {copiedKey === 'breakdown-summary' ? (
                    <>
                      <Check size={14} className="text-emerald-400 dark:text-stone-950 stroke-[3]" />
                      <span>Copied Summary!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy Breakdown</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleSaveToHistory}
                  disabled={runningTotal <= 0}
                  className="flex-1 py-3 px-4 rounded-2xl bg-yellow-400 hover:bg-yellow-405 dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-950 dark:text-yellow-400 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] border border-yellow-300 dark:border-stone-700 disabled:opacity-40"
                >
                  {historySaved ? (
                    <>
                      <Check size={14} className="text-emerald-700 dark:text-emerald-400 stroke-[3]" />
                      <span>Logged to History!</span>
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      <span>Save to History</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
