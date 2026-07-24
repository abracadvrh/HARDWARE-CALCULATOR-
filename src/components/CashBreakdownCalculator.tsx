import React, { useState, useEffect, useMemo } from 'react';
import { 
  Banknote, 
  Calculator, 
  Copy, 
  Check, 
  Save, 
  RotateCcw, 
  SlidersHorizontal, 
  ArrowDownUp, 
  Info, 
  Plus, 
  Minus, 
  Delete,
  Coins,
  ShieldCheck,
  Zap,
  HelpCircle
} from 'lucide-react';
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
  { value: 1000, label: '₱1,000', type: 'bill', colorBg: 'bg-blue-50 dark:bg-blue-950/30', colorText: 'text-blue-700 dark:text-blue-400', borderColor: 'border-blue-200 dark:border-blue-800/60', accentBadge: 'bg-blue-600 text-white' },
  { value: 500, label: '₱500', type: 'bill', colorBg: 'bg-amber-50 dark:bg-amber-950/30', colorText: 'text-amber-800 dark:text-amber-400', borderColor: 'border-amber-200 dark:border-amber-800/60', accentBadge: 'bg-amber-500 text-white' },
  { value: 200, label: '₱200', type: 'bill', colorBg: 'bg-emerald-50 dark:bg-emerald-950/30', colorText: 'text-emerald-700 dark:text-emerald-400', borderColor: 'border-emerald-200 dark:border-emerald-800/60', accentBadge: 'bg-emerald-600 text-white' },
  { value: 100, label: '₱100', type: 'bill', colorBg: 'bg-purple-50 dark:bg-purple-950/30', colorText: 'text-purple-700 dark:text-purple-400', borderColor: 'border-purple-200 dark:border-purple-800/60', accentBadge: 'bg-purple-600 text-white' },
  { value: 50, label: '₱50', type: 'bill', colorBg: 'bg-rose-50 dark:bg-rose-950/30', colorText: 'text-rose-700 dark:text-rose-400', borderColor: 'border-rose-200 dark:border-rose-800/60', accentBadge: 'bg-rose-600 text-white' },
  { value: 20, label: '₱20', type: 'bill', colorBg: 'bg-orange-50 dark:bg-orange-950/30', colorText: 'text-orange-800 dark:text-orange-400', borderColor: 'border-orange-200 dark:border-orange-800/60', accentBadge: 'bg-orange-600 text-white' },
  { value: 10, label: '₱10', type: 'coin', colorBg: 'bg-yellow-50 dark:bg-stone-900', colorText: 'text-yellow-900 dark:text-yellow-400', borderColor: 'border-yellow-250 dark:border-stone-800', accentBadge: 'bg-yellow-500 text-stone-950' },
  { value: 5, label: '₱5', type: 'coin', colorBg: 'bg-gray-100 dark:bg-stone-900', colorText: 'text-gray-700 dark:text-stone-300', borderColor: 'border-gray-250 dark:border-stone-800', accentBadge: 'bg-gray-600 text-white' },
  { value: 1, label: '₱1', type: 'coin', colorBg: 'bg-gray-50 dark:bg-stone-900', colorText: 'text-gray-600 dark:text-stone-400', borderColor: 'border-gray-200 dark:border-stone-800', accentBadge: 'bg-stone-500 text-white' },
  { value: 0.25, label: '₱0.25', type: 'coin', colorBg: 'bg-amber-100/40 dark:bg-stone-900', colorText: 'text-amber-900 dark:text-amber-500', borderColor: 'border-amber-300/40 dark:border-stone-800', accentBadge: 'bg-amber-700 text-white' }
];

export type BreakdownMode = 'FEWEST_BILLS' | 'SMALLER_BILLS';
export type SmallerBillCap = 'MAX_1000_1' | 'MAX_1000_0' | 'PREFER_100_50';

/**
 * Safe client-side math evaluator for live arithmetic input
 */
function evaluateArithmetic(expr: string): number {
  if (!expr || !expr.trim()) return 0;
  try {
    // Sanitize string to allow basic arithmetic operators (+, -, *, /, x, ÷) and digits
    const cleaned = expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/x/gi, '*')
      .replace(/[^0-9.+-/*()]/g, '');

    if (!cleaned) return 0;

    // Use a clean Function evaluation for standard math expressions
    // eslint-disable-next-line no-new-func
    const result = new Function(`"use strict"; return (${cleaned});`)();
    if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
      return Math.max(0, Math.round(result * 100) / 100);
    }
  } catch {
    // If expression is currently incomplete during typing (e.g. "5000 + "), try evaluating sub-expression
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
  const [expression, setExpression] = useState<string>('15375');
  const [breakdownMode, setBreakdownMode] = useState<BreakdownMode>('FEWEST_BILLS');
  const [smallerCap, setSmallerCap] = useState<SmallerBillCap>('MAX_1000_1');
  
  // Enabled Denominations (default: all enabled except 0.25 if user prefers whole pesos, but included by default)
  const [disabledValues, setDisabledValues] = useState<number[]>([]);
  
  // Custom Override Adjustments (for direct cashier manual counts)
  const [customCounts, setCustomCounts] = useState<{ [value: number]: number }>({});
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);

  // UI status feedback
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [historySaved, setHistorySaved] = useState<boolean>(false);

  // Compute live running total from arithmetic expression
  const runningTotal = useMemo(() => {
    return evaluateArithmetic(expression);
  }, [expression]);

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

  // Enable all / Disable all quick helpers
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

    if (isCustomMode) {
      // Manual Count Mode
      let sum = 0;
      let totalBills = 0;
      let totalCoins = 0;
      let totalItems = 0;

      PHP_DENOMINATIONS.forEach((d) => {
        const count = customCounts[d.value] || 0;
        sum += count * d.value;
        totalItems += count;
        if (d.type === 'bill') totalBills += count;
        else totalCoins += count;
      });

      return {
        counts: customCounts,
        allocatedTotal: sum,
        leftover: Math.max(0, Math.round((totalToBreak - sum) * 100) / 100),
        totalItems,
        totalBills,
        totalCoins
      };
    }

    // Filter available enabled denominations sorted descending
    const activeDenoms = PHP_DENOMINATIONS
      .filter((d) => !disabledValues.includes(d.value))
      .map((d) => d.value)
      .sort((a, b) => b - a);

    const counts: { [val: number]: number } = {};
    let remaining = totalToBreak;

    if (breakdownMode === 'FEWEST_BILLS') {
      // Standard Greedy Algorithm
      for (const val of activeDenoms) {
        if (remaining <= 0) break;
        if (val <= remaining) {
          const count = Math.floor(remaining / val);
          counts[val] = count;
          remaining = Math.round((remaining - count * val) * 100) / 100;
        }
      }
    } else {
      // SMALLER_BILLS Mode (Retail / Cash Change Distribution)
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
          // Limit 500s to max 2 so remainder flows into 100s & 50s
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

      // If leftover remains after applying cap, use next available smaller denoms
      if (remaining > 0) {
        for (const val of activeDenoms) {
          if (remaining <= 0) break;
          // Skip 1000 if hard capped at 0
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
  }, [runningTotal, disabledValues, breakdownMode, smallerCap, isCustomMode, customCounts]);

  // Keypad button handlers
  const handleKeypadPress = (val: string) => {
    setHistorySaved(false);
    if (val === 'C') {
      setExpression('');
    } else if (val === '⌫') {
      setExpression((prev) => prev.slice(0, -1));
    } else if (val === '=') {
      // Evaluate expression to plain string
      const evalVal = evaluateArithmetic(expression);
      setExpression(evalVal.toString());
    } else {
      setExpression((prev) => prev + val);
    }
  };

  const handleQuickAdd = (amountToAdd: number) => {
    setHistorySaved(false);
    const currentVal = evaluateArithmetic(expression);
    setExpression((currentVal + amountToAdd).toString());
  };

  // Copy breakdown function
  const handleCopyBreakdown = () => {
    if (runningTotal <= 0) return;
    
    const parts: string[] = [];
    PHP_DENOMINATIONS.forEach((d) => {
      const count = breakdownResult.counts[d.value] || 0;
      if (count > 0) {
        parts.push(`${count}x ${d.label}`);
      }
    });

    const summaryText = `PHP Cash Breakdown (₱${runningTotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}):\n` +
      `Mode: ${breakdownMode === 'FEWEST_BILLS' ? 'Fewest Bills' : 'Smaller Bills'}\n` +
      `Breakdown: ${parts.length > 0 ? parts.join(', ') : 'None'}\n` +
      (breakdownResult.leftover > 0 ? `Unallocated Leftover: ₱${breakdownResult.leftover.toFixed(2)}\n` : '') +
      `Total Pieces: ${breakdownResult.totalItems} (${breakdownResult.totalBills} Bills, ${breakdownResult.totalCoins} Coins)`;

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
        parts.push(`${count}x ${d.label}`);
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

  return (
    <div className={`space-y-4 ${layoutMode === 'fit' ? 'text-xs' : 'text-sm'}`}>
      
      {/* 1. ARITHMETIC CALCULATOR HEADER CARD */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-4 sm:p-5 border-2 border-yellow-250 dark:border-stone-800 shadow-md space-y-3">
        <div className="flex items-center justify-between border-b border-yellow-101 dark:border-stone-800 pb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-yellow-400 dark:bg-yellow-405 text-stone-950 font-black shadow-xs">
              <Banknote size={16} />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black uppercase text-yellow-950 dark:text-yellow-400 tracking-wide leading-none">
                Cash Breakdown Calculator
              </h3>
              <span className="text-[8.5px] font-bold text-gray-400 dark:text-stone-500 uppercase tracking-wider block mt-0.5">
                Philippine Peso (PHP) Denominations
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setExpression('0');
                setDisabledValues([]);
                setCustomCounts({});
                setIsCustomMode(false);
              }}
              className="p-1.5 rounded-xl bg-yellow-50 dark:bg-stone-800 text-yellow-900 dark:text-yellow-400 hover:bg-yellow-100 transition-all text-[9px] font-black flex items-center gap-1 border border-yellow-200 dark:border-stone-750"
              title="Reset All"
            >
              <RotateCcw size={12} />
              <span className="hidden xs:inline">RESET</span>
            </button>
          </div>
        </div>

        {/* Live Running Total Display */}
        <div className="bg-gradient-to-br from-yellow-950 to-stone-900 dark:from-stone-950 dark:to-stone-900 text-white rounded-2xl p-4 border border-yellow-450/40 dark:border-stone-800 relative overflow-hidden shadow-inner">
          <div className="flex justify-between items-start text-[9px] font-black uppercase tracking-widest text-yellow-400/90 mb-1">
            <span>RUNNING CASH TOTAL</span>
            <span className="text-[8px] text-gray-400 font-mono">LIVE EVALUATION</span>
          </div>

          <div className="flex items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-1 font-mono font-black text-2xl xs:text-3xl sm:text-4xl text-yellow-400 tracking-tight">
              <span className="text-lg sm:text-2xl text-yellow-500">₱</span>
              <span>{runningTotal.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>

            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(`₱${runningTotal.toFixed(2)}`);
                setCopiedKey('total-main');
                setTimeout(() => setCopiedKey(null), 1500);
              }}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-yellow-300 transition-all active:scale-95 shrink-0 border border-white/10"
              title="Copy running total"
            >
              {copiedKey === 'total-main' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            </button>
          </div>

          {/* Arithmetic Expression Bar */}
          <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between gap-2">
            <input
              type="text"
              value={expression}
              onChange={(e) => {
                setHistorySaved(false);
                setExpression(e.target.value);
              }}
              placeholder="Enter cash calculation (e.g. 5000 + 2500 * 2)"
              className="w-full bg-transparent text-xs font-mono font-bold text-yellow-100 placeholder-stone-500 outline-none"
            />
            {expression && (
              <button
                type="button"
                onClick={() => setExpression('')}
                className="text-[9px] text-gray-400 hover:text-white uppercase font-mono font-bold px-1"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Quick Cash Addition Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none select-none">
          <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 dark:text-stone-500 shrink-0">
            Quick Add:
          </span>
          {[100, 500, 1000, 2000, 5000].map((addVal) => (
            <button
              key={addVal}
              type="button"
              onClick={() => handleQuickAdd(addVal)}
              className="px-2.5 py-1 rounded-xl bg-yellow-50 dark:bg-stone-850 hover:bg-yellow-100 dark:hover:bg-stone-800 text-yellow-950 dark:text-yellow-400 border border-yellow-200 dark:border-stone-750 text-[10px] font-black font-mono shrink-0 transition-all active:scale-95"
            >
              +₱{addVal.toLocaleString()}
            </button>
          ))}
        </div>

        {/* Compact Keypad for quick touch calculation */}
        <div className="grid grid-cols-4 gap-1.5 pt-1">
          {['7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '-', 'C', '0', '⌫', '+'].map((btn) => {
            const isOp = ['÷', '×', '-', '+'].includes(btn);
            const isAction = ['C', '⌫'].includes(btn);
            return (
              <button
                key={btn}
                type="button"
                onClick={() => handleKeypadPress(btn)}
                className={`py-2 rounded-xl text-xs sm:text-sm font-black font-mono transition-all active:scale-95 outline-none ${
                  isOp
                    ? 'bg-yellow-400 text-stone-950 dark:bg-yellow-405 dark:text-stone-950 shadow-xs'
                    : isAction
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40'
                    : 'bg-gray-100 text-gray-800 dark:bg-stone-800 dark:text-stone-200 hover:bg-gray-200 dark:hover:bg-stone-750 border border-gray-200/60 dark:border-stone-750'
                }`}
              >
                {btn}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. MODE & DENOMINATION CONTROLS BAR */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-4 border-2 border-yellow-250 dark:border-stone-800 shadow-md space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-yellow-101 dark:border-stone-800 pb-2.5">
          <div className="flex items-center gap-1.5">
            <ArrowDownUp size={15} className="text-amber-600 dark:text-yellow-400" />
            <span className="text-xs font-black uppercase text-yellow-950 dark:text-yellow-400 tracking-wider">
              Breakdown Strategy Mode
            </span>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex bg-gray-100 dark:bg-stone-800 p-1 rounded-2xl border border-gray-200 dark:border-stone-750">
            <button
              type="button"
              onClick={() => {
                setIsCustomMode(false);
                setBreakdownMode('FEWEST_BILLS');
              }}
              className={`flex-1 py-1.5 px-3 rounded-xl text-[10px] sm:text-xs font-black transition-all outline-none ${
                !isCustomMode && breakdownMode === 'FEWEST_BILLS'
                  ? 'bg-yellow-400 text-stone-950 dark:bg-yellow-405 dark:text-stone-950 shadow-xs'
                  : 'text-gray-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              ⚡ FEWEST BILLS
            </button>
            <button
              type="button"
              onClick={() => {
                setIsCustomMode(false);
                setBreakdownMode('SMALLER_BILLS');
              }}
              className={`flex-1 py-1.5 px-3 rounded-xl text-[10px] sm:text-xs font-black transition-all outline-none ${
                !isCustomMode && breakdownMode === 'SMALLER_BILLS'
                  ? 'bg-yellow-400 text-stone-950 dark:bg-yellow-405 dark:text-stone-950 shadow-xs'
                  : 'text-gray-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              🔄 SMALLER BILLS (CHANGE)
            </button>
          </div>
        </div>

        {/* Sub-options for Smaller Bills mode */}
        {breakdownMode === 'SMALLER_BILLS' && !isCustomMode && (
          <div className="bg-yellow-50/60 dark:bg-stone-850 p-3 rounded-2xl border border-yellow-200 dark:border-stone-750 space-y-2 animate-[fadeIn_0.2s_ease-out]">
            <span className="text-[9.5px] font-black uppercase tracking-wider text-amber-900 dark:text-yellow-400 block">
              Smaller Bills Cap Options:
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'MAX_1000_1', label: 'Max 1x ₱1000 note' },
                { id: 'MAX_1000_0', label: 'No ₱1000 notes' },
                { id: 'PREFER_100_50', label: 'Prefer ₱100 / ₱50' }
              ].map((capOpt) => (
                <button
                  key={capOpt.id}
                  type="button"
                  onClick={() => setSmallerCap(capOpt.id as SmallerBillCap)}
                  className={`py-1.5 px-2 rounded-xl text-[9px] font-black transition-all border ${
                    smallerCap === capOpt.id
                      ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                      : 'bg-white dark:bg-stone-900 text-gray-600 dark:text-stone-300 border-gray-200 dark:border-stone-750'
                  }`}
                >
                  {capOpt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Enabled Denominations Quick Toggles */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between items-center px-1">
            <span className="text-[9.5px] font-black text-gray-500 dark:text-stone-400 uppercase tracking-wider">
              Enable / Disable Denominations:
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={enableAllDenominations}
                className="text-[8.5px] font-black text-amber-700 dark:text-yellow-400 uppercase hover:underline"
              >
                Enable All
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {PHP_DENOMINATIONS.map((d) => {
              const isDisabled = disabledValues.includes(d.value);
              return (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => toggleDenomination(d.value)}
                  className={`py-1 px-2.5 rounded-xl text-[10px] font-black font-mono transition-all border outline-none ${
                    isDisabled
                      ? 'bg-gray-100 text-gray-400 border-gray-200 dark:bg-stone-800 dark:text-stone-600 dark:border-stone-750 line-through opacity-60'
                      : `${d.colorBg} ${d.colorText} ${d.borderColor} shadow-2xs`
                  }`}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. DENOMINATION BREAKDOWN RESULTS GRID */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-4 sm:p-5 border-2 border-yellow-250 dark:border-stone-800 shadow-md space-y-4">
        {/* Breakdown Header Stats */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-yellow-101 dark:border-stone-800 pb-2.5">
          <div>
            <h4 className="text-xs font-black uppercase text-yellow-950 dark:text-yellow-400 tracking-wider">
              Optimal Cash Breakdown
            </h4>
            <span className="text-[9px] font-bold text-gray-400 dark:text-stone-500 uppercase tracking-wider block mt-0.5">
              {breakdownResult.totalBills} Bills, {breakdownResult.totalCoins} Coins ({breakdownResult.totalItems} Total Pieces)
            </span>
          </div>

          {breakdownResult.leftover > 0 && (
            <div className="bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 px-2.5 py-1 rounded-xl text-[9.5px] font-black flex items-center gap-1">
              <Info size={12} />
              <span>Unallocated Leftover: ₱{breakdownResult.leftover.toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* Grid List of Denominations */}
        <div className="space-y-2">
          {PHP_DENOMINATIONS.map((d) => {
            const isDisabled = disabledValues.includes(d.value);
            const count = breakdownResult.counts[d.value] || 0;
            const subtotal = count * d.value;
            const percentage = runningTotal > 0 ? (subtotal / runningTotal) * 100 : 0;

            return (
              <div
                key={d.value}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  isDisabled
                    ? 'bg-gray-50 dark:bg-stone-950 border-gray-200 dark:border-stone-850 opacity-40'
                    : count > 0
                    ? `${d.colorBg} ${d.borderColor} shadow-2xs`
                    : 'bg-white dark:bg-stone-900 border-gray-150/60 dark:border-stone-800'
                }`}
              >
                {/* Denomination Info */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    type="button"
                    onClick={() => toggleDenomination(d.value)}
                    className={`px-2.5 py-1 rounded-xl text-xs sm:text-sm font-black font-mono shrink-0 ${d.accentBadge} shadow-xs`}
                    title="Tap to toggle enable/disable"
                  >
                    {d.label}
                  </button>

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black uppercase text-gray-800 dark:text-stone-200 truncate">
                        {d.type === 'bill' ? 'Banknote' : 'Coin'}
                      </span>
                      {isDisabled && (
                        <span className="text-[8px] font-black text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/60 px-1 rounded uppercase">
                          Disabled
                        </span>
                      )}
                    </div>

                    {/* Subtotal bar */}
                    {count > 0 && (
                      <div className="w-24 sm:w-32 h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden mt-1">
                        <div
                          className="h-full bg-yellow-500 dark:bg-yellow-400 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, percentage)}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Count & Subtotal Display */}
                <div className="flex items-center gap-3 shrink-0 text-right">
                  <div>
                    <span className={`text-sm sm:text-base font-black font-mono block leading-none ${count > 0 ? 'text-gray-900 dark:text-stone-100' : 'text-gray-300 dark:text-stone-700'}`}>
                      {count} <span className="text-[10px] font-bold text-gray-400">pcs</span>
                    </span>
                    <span className="text-[9.5px] font-black font-mono text-amber-800 dark:text-yellow-400 block mt-0.5">
                      ₱{subtotal.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons Row */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-yellow-101 dark:border-stone-800">
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
      </div>
    </div>
  );
}
