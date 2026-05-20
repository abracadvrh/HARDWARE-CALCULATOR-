import React, { useState, useEffect } from 'react';
import { Info, Copy, Check } from 'lucide-react';

export default function Tax2307Calculator({ layoutMode = 'scroll' }: { layoutMode?: 'scroll' | 'fit' }) {
  const [totalSales, setTotalSales] = useState<string>('');
  const [whtRate, setWhtRate] = useState<number>(1); // Default 1%
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

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
    setTimeout(() => {
      setCopiedKey(null);
    }, 1500);
  };

  return (
    <div className={`bg-white rounded-3xl shadow-lg border border-yellow-50 transition-all ${
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
              className={`w-full bg-yellow-50 border-2 border-transparent focus:border-yellow-400 focus:bg-white transition-all outline-none ${
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
            className={`w-full bg-gray-50 border-2 border-transparent focus:border-yellow-400 focus:bg-white rounded-xl transition-all outline-none appearance-none cursor-pointer ${
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
        <div className="flex justify-between items-center py-1 border-y border-dashed border-gray-200">
          <span className={`font-bold uppercase ${
            layoutMode === 'scroll' ? 'text-xs text-gray-750' : 'text-[10px] text-gray-650'
          }`}>Net of VAT:</span>
          <div className="flex items-center gap-1.5 min-w-0">
            <span className={`font-bold text-gray-750 truncate ${
              layoutMode === 'scroll' ? 'text-sm font-black' : 'text-xs'
            }`}>{formatCurrency(data.netOfVat)}</span>
            {data.netOfVat > 0 && (
              <button
                onClick={() => handleCopy(data.netOfVat.toFixed(2), 'net')}
                className={`rounded bg-gray-100 hover:bg-yellow-101/70 transition-all text-gray-500 hover:text-yellow-905 active:scale-90 flex items-center justify-center border border-gray-200/50 ${
                  layoutMode === 'scroll' ? 'p-1' : 'p-0.5'
                }`}
                title="Copy Net amount"
              >
                {copiedKey === 'net' ? (
                  <Check size={layoutMode === 'scroll' ? 12 : 10} className="text-green-600" />
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
        <div className={`flex justify-between items-center bg-gray-50 rounded-lg ${
          layoutMode === 'scroll' ? 'py-2 px-3.5' : 'py-1 px-2.5'
        }`}>
          <span className={`font-bold uppercase ${
            layoutMode === 'scroll' ? 'text-xs text-gray-700' : 'text-[10px] text-gray-650'
          }`}>Amount Due:</span>
          <div className="flex items-center gap-1.5 min-w-0">
            <span className={`font-bold text-gray-800 truncate ${
              layoutMode === 'scroll' ? 'text-sm font-black' : 'text-xs'
            }`}>{formatCurrency(data.amountDue)}</span>
            {data.amountDue > 0 && (
              <button
                onClick={() => handleCopy(data.amountDue.toFixed(2), 'due')}
                className={`rounded bg-white border border-gray-200 hover:bg-yellow-101/70 transition-all text-gray-500 hover:text-yellow-905 active:scale-95 flex items-center justify-center ${
                  layoutMode === 'scroll' ? 'p-1' : 'p-0.5'
                }`}
                title="Copy Amount Due"
              >
                {copiedKey === 'due' ? (
                  <Check size={layoutMode === 'scroll' ? 12 : 10} className="text-green-600" />
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
        <div className={`bg-yellow-400 text-center shadow-md shadow-yellow-250 relative group overflow-hidden transition-all ${
          layoutMode === 'scroll' ? 'mt-4 p-5 rounded-3xl' : 'mt-3 p-3 rounded-2xl'
        }`}>
          <p className={`font-bold text-yellow-905 uppercase tracking-[0.2em] ${
            layoutMode === 'scroll' ? 'text-[10px] mb-1' : 'text-[9px] mb-0.5'
          }`}>Total Amount Due</p>
          <div className="flex items-center justify-center gap-1.5 flex-wrap max-w-full">
            <p className={`font-black text-white drop-shadow-xs select-all tracking-tight break-all transition-all ${
              layoutMode === 'scroll' ? 'text-3xl' : 'text-2xl'
            }`}>
              {formatCurrency(data.totalAmountDue)}
            </p>
            {data.totalAmountDue > 0 && (
              <button
                onClick={() => handleCopy(data.totalAmountDue.toFixed(2), 'total')}
                className={`font-bold uppercase flex items-center gap-1 transition-all active:scale-95 ${
                  layoutMode === 'scroll'
                    ? 'p-1 px-3 rounded-xl bg-white/20 hover:bg-white/30 text-white text-[10px]'
                    : 'p-0.5 px-2 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[9px]'
                }`}
                title="Copy Total Amount"
              >
                {copiedKey === 'total' ? (
                  <>
                    <Check size={layoutMode === 'scroll' ? 11 : 9} className="text-white" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={layoutMode === 'scroll' ? 11 : 9} className="text-yellow-101" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            )}
          </div>
          <p className={`text-yellow-100 mt-1 font-bold uppercase select-none ${
            layoutMode === 'scroll' ? 'text-[9.5px]' : 'text-[8.5px]'
          }`}>Total to pay by the customer</p>
        </div>
      </div>
    </div>
  );
}
