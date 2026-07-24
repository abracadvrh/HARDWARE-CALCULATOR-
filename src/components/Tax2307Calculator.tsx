import React, { useState, useEffect } from 'react';
import { Info, Copy, Check, Save } from 'lucide-react';
import { SharedHistoryProps } from '../types';

export default function Tax2307Calculator({ layoutMode = 'scroll', onAddHistory }: { layoutMode?: 'scroll' | 'fit' } & SharedHistoryProps) {
  const [totalSales, setTotalSales] = useState<string>('');
  const [whtRate, setWhtRate] = useState<number>(1); // Default 1%
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [historySaved, setHistorySaved] = useState<boolean>(false);

  // Derived Values
  const [data, setData] = useState({
    netOfVat: 0,
    vat: 0,
    wht: 0,
    amountDue: 0,
    totalAmountDue: 0,
  });

  useEffect(() => {
    const salesNum = parseFloat(totalSales);
    if (!isNaN(salesNum) && salesNum > 0) {
      const net = salesNum / 1.12;
      const v = salesNum - net;
      const withholding = net * (whtRate / 100);
      const due = net - withholding;
      const totalDue = due + v;

      setData({
        netOfVat: net,
        vat: v,
        wht: withholding,
        amountDue: due,
        totalAmountDue: totalDue,
      });
    } else {
      setData({ netOfVat: 0, vat: 0, wht: 0, amountDue: 0, totalAmountDue: 0 });
    }
  }, [totalSales, whtRate]);

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

    if (data.totalAmountDue > 0) {
      const salesNum = parseFloat(totalSales) || 0;
      onAddHistory?.(
        '2307',
        'BIR Form 2307 Calculation',
        `Priced ₱${salesNum.toLocaleString('en-PH', { minimumFractionDigits: 2 })} with ${whtRate}% Withholding`,
        key === 'net' ? `Net of VAT: ${formatCurrency(data.netOfVat)}`
        : key === 'vat' ? `VAT amount: ${formatCurrency(data.vat)}`
        : key === 'wht' ? `Withheld Tax: ${formatCurrency(data.wht)}`
        : key === 'due' ? `Amount Due (Net of Tax): ${formatCurrency(data.amountDue)}`
        : `Total Amount Due (including VAT): ${formatCurrency(data.totalAmountDue)}`
      );
    }

    setTimeout(() => {
      setCopiedKey(null);
    }, 1500);
  };

  const saveToHistoryLog = () => {
    if (data.totalAmountDue <= 0) return;
    const salesNum = parseFloat(totalSales) || 0;
    onAddHistory?.(
      '2307',
      'BIR Form 2307 Estimate',
      `Base: ₱${salesNum.toLocaleString('en-PH', { minimumFractionDigits: 2 })} (WHT Rate ${whtRate}%)`,
      `Net sales: ${formatCurrency(data.netOfVat)} | WHT: ${formatCurrency(data.wht)} | Due: ${formatCurrency(data.totalAmountDue)}`
    );
    setHistorySaved(true);
    setTimeout(() => setHistorySaved(false), 2000);
  };

  return (
    <div className={`bg-white dark:bg-stone-900 rounded-3xl shadow-lg border border-gray-250/90 dark:border-stone-800 transition-all ${
      layoutMode === 'scroll' ? 'p-5 xs:p-6 mb-2' : 'p-3.5 xs:p-5'
    }`}>
      <div className={`grid grid-cols-2 gap-2.5 ${layoutMode === 'scroll' ? 'mb-4.5' : 'mb-3.5'}`}>
        <div className="col-span-2">
          <label className={`block font-bold text-gray-400 uppercase tracking-widest px-1 ${
            layoutMode === 'scroll' ? 'text-xs mb-2' : 'text-[10px] mb-1.5'
          }`}>
            Total Gross Sales
          </label>
          <div className="relative">
            <span className={`absolute top-1/2 -translate-y-1/2 text-yellow-600 font-bold transition-all ${
              layoutMode === 'scroll' ? 'left-4 text-xl' : 'left-3.5'
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
                  : 'rounded-xl py-2 pl-8 pr-3 text-lg font-bold'
              }`}
            />
          </div>
        </div>
        
        <div className="col-span-2">
          <label className={`block font-bold text-gray-400 uppercase tracking-widest px-1 ${
            layoutMode === 'scroll' ? 'text-xs mb-2' : 'text-[10px] mb-1'
          }`}>
            WHT Rate (%)
          </label>
          <select 
            value={whtRate}
            onChange={(e) => setWhtRate(Number(e.target.value))}
            className={`w-full bg-gray-50 dark:bg-stone-850 text-gray-800 dark:text-stone-100 border-2 border-transparent focus:border-yellow-400 focus:bg-white dark:focus:bg-stone-800 rounded-xl transition-all outline-none appearance-none cursor-pointer ${
              layoutMode === 'scroll' ? 'p-3.5 text-sm font-black' : 'p-1.5 text-xs font-bold'
            }`}
          >
            <option value={1}>1% (Goods Selection)</option>
            <option value={2}>2% (Services Selection)</option>
            <option value={5}>5% Flat Rate</option>
            <option value={10}>10% High Income Rate</option>
          </select>
        </div>
      </div>

      <div className={`border-t border-gray-100 transition-all ${
        layoutMode === 'scroll' ? 'space-y-2 pt-4' : 'space-y-1 pt-2.5'
      }`}>
        <div className="flex justify-between items-center py-0.5">
          <span className={`text-gray-500 font-medium font-mono uppercase ${
            layoutMode === 'scroll' ? 'text-xs' : 'text-[10px]'
          }`}>Total Sales:</span>
          <span className={`font-bold ${layoutMode === 'scroll' ? 'text-sm' : 'text-xs'}`}>
            {formatCurrency(parseFloat(totalSales) || 0)}
          </span>
        </div>
        
        <div className="flex justify-between items-center py-0.5">
          <span className={`text-gray-500 font-medium font-mono uppercase ${
            layoutMode === 'scroll' ? 'text-xs' : 'text-[10px]'
          }`}>VAT (12%):</span>
          <span className={`font-bold text-red-500 ${layoutMode === 'scroll' ? 'text-sm' : 'text-xs'}`}>
            − {formatCurrency(data.vat)}
          </span>
        </div>
        
        {/* Net of VAT row with copy */}
        <div className="flex justify-between items-center py-1 border-y border-dashed border-gray-200 dark:border-stone-800">
          <span className={`font-bold uppercase ${
            layoutMode === 'scroll' ? 'text-xs text-gray-750 dark:text-stone-300' : 'text-[10px] text-gray-650 dark:text-stone-400'
          }`}>Net of VAT:</span>
          <div className="flex items-center gap-1.5 min-w-0">
            <span className={`font-bold text-gray-750 dark:text-stone-200 truncate ${
              layoutMode === 'scroll' ? 'text-sm font-black' : 'text-xs'
            }`}>{formatCurrency(data.netOfVat)}</span>
            {data.netOfVat > 0 && (
              <button
                onClick={() => handleCopy(data.netOfVat.toFixed(2), 'net')}
                className={`rounded bg-gray-100 dark:bg-stone-800 hover:bg-yellow-101/70 dark:hover:bg-stone-700 transition-all text-gray-500 dark:text-stone-300 hover:text-yellow-905 dark:hover:text-yellow-400 active:scale-90 flex items-center justify-center border border-gray-200/50 dark:border-stone-750/30 ${
                  layoutMode === 'scroll' ? 'p-1' : 'p-0.5'
                }`}
                title="Copy Net amount"
              >
                {copiedKey === 'net' ? (
                  <Check size={layoutMode === 'scroll' ? 12 : 10} className="text-green-600 dark:text-green-400" />
                ) : (
                  <Copy size={layoutMode === 'scroll' ? 12 : 10} />
                )}
              </button>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center py-0.5">
          <span className={`text-gray-500 font-medium font-mono uppercase ${
            layoutMode === 'scroll' ? 'text-xs' : 'text-[10px]'
          }`}>Less WHT ({whtRate}%):</span>
          <span className={`font-bold text-red-500 ${layoutMode === 'scroll' ? 'text-sm' : 'text-xs'}`}>
            − {formatCurrency(data.wht)}
          </span>
        </div>

        {/* Amount Due with copy */}
        <div className={`flex justify-between items-center bg-gray-50 dark:bg-stone-850/60 rounded-lg ${
          layoutMode === 'scroll' ? 'py-2 px-3.5' : 'py-1 px-2.5'
        }`}>
          <span className={`font-bold uppercase ${
            layoutMode === 'scroll' ? 'text-xs text-gray-700 dark:text-stone-300' : 'text-[10px] text-gray-650 dark:text-stone-400'
          }`}>Amount Due:</span>
          <div className="flex items-center gap-1.5 min-w-0">
            <span className={`font-bold text-gray-800 dark:text-stone-200 truncate ${
              layoutMode === 'scroll' ? 'text-sm font-black' : 'text-xs'
            }`}>{formatCurrency(data.amountDue)}</span>
            {data.amountDue > 0 && (
              <button
                onClick={() => handleCopy(data.amountDue.toFixed(2), 'due')}
                className={`rounded bg-white dark:bg-stone-800 border border-gray-200 dark:border-stone-700 hover:bg-yellow-101/70 dark:hover:bg-stone-700 transition-all text-gray-500 dark:text-stone-300 hover:text-yellow-905 dark:hover:text-yellow-400 active:scale-95 flex items-center justify-center ${
                  layoutMode === 'scroll' ? 'p-1' : 'p-0.5'
                }`}
                title="Copy Amount Due"
              >
                {copiedKey === 'due' ? (
                  <Check size={layoutMode === 'scroll' ? 12 : 10} className="text-green-600 dark:text-green-400" />
                ) : (
                  <Copy size={layoutMode === 'scroll' ? 12 : 10} />
                )}
              </button>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center py-0.5 px-2.5">
          <span className={`text-gray-500 font-medium font-mono uppercase ${
            layoutMode === 'scroll' ? 'text-xs' : 'text-[10px]'
          }`}>Add VAT Ref:</span>
          <span className={`font-bold text-blue-500 ${layoutMode === 'scroll' ? 'text-sm' : 'text-xs'}`}>
            + {formatCurrency(data.vat)}
          </span>
        </div>

        {/* Total Amount Due panel with large copy option */}
        <div className={`bg-yellow-400 dark:bg-yellow-405 text-center shadow-md shadow-yellow-250 dark:shadow-[0_0_20px_rgba(250,204,21,0.3)] relative group overflow-hidden transition-all ${
          layoutMode === 'scroll' ? 'mt-4 p-5 rounded-3xl' : 'mt-3 p-3 rounded-2xl'
        }`}>
          <p className={`font-bold text-yellow-905 dark:text-stone-900 uppercase tracking-[0.2em] ${
            layoutMode === 'scroll' ? 'text-[10px] mb-1' : 'text-[9px] mb-0.5'
          }`}>Total Amount Due</p>
          <div className="flex items-center justify-center gap-1.5 flex-wrap max-w-full">
            <p className={`font-black text-white dark:text-stone-950 drop-shadow-xs select-all tracking-tight break-all transition-all ${
              layoutMode === 'scroll' ? 'text-3xl' : 'text-2xl'
            }`}>
              {formatCurrency(data.totalAmountDue)}
            </p>
            {data.totalAmountDue > 0 && (
              <div className="flex gap-1.5 flex-wrap items-center justify-center">
                <button
                  onClick={() => handleCopy(data.totalAmountDue.toFixed(2), 'total')}
                  className={`font-bold uppercase flex items-center gap-1 transition-all active:scale-95 ${
                    layoutMode === 'scroll'
                      ? 'p-1.5 px-3 rounded-xl bg-white/25 hover:bg-white/35 dark:bg-stone-950/20 dark:hover:bg-stone-950/40 text-white dark:text-stone-900 text-[10px]'
                      : 'p-1 px-2.5 rounded-lg bg-white/25 hover:bg-white/35 dark:bg-stone-950/20 dark:hover:bg-stone-950/40 text-white dark:text-stone-900 text-[9px]'
                  }`}
                  title="Copy Total Amount"
                >
                  {copiedKey === 'total' ? (
                    <>
                      <Check size={layoutMode === 'scroll' ? 11 : 9} className="text-white dark:text-stone-900" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={layoutMode === 'scroll' ? 11 : 9} className="text-yellow-101 dark:text-stone-900/70" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                <button
                  onClick={saveToHistoryLog}
                  className={`font-bold uppercase flex items-center gap-1 transition-all active:scale-95 ${
                    layoutMode === 'scroll'
                      ? 'p-1.5 px-3 rounded-xl bg-white/25 hover:bg-white/35 dark:bg-stone-950/20 dark:hover:bg-stone-950/40 text-white dark:text-stone-900 text-[10px]'
                      : 'p-1 px-2.5 rounded-lg bg-white/25 hover:bg-white/35 dark:bg-stone-950/20 dark:hover:bg-stone-950/40 text-white dark:text-stone-900 text-[9px]'
                  }`}
                  title="Save current estimate to local calculation database logs"
                >
                  {historySaved ? (
                    <>
                      <Check size={layoutMode === 'scroll' ? 11 : 9} className="text-white dark:text-stone-900" />
                      <span>LOGGED!</span>
                    </>
                  ) : (
                    <>
                      <Save size={layoutMode === 'scroll' ? 11 : 9} className="text-yellow-101 dark:text-stone-900/70" />
                      <span>SAVE LOG</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
          <p className={`text-yellow-100 dark:text-stone-900/85 mt-1 font-bold uppercase select-none ${
            layoutMode === 'scroll' ? 'text-[9.5px]' : 'text-[8.5px]'
          }`}>Total to pay by the customer</p>
        </div>
      </div>
    </div>
  );
}
