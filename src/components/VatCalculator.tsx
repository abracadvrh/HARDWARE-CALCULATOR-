import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Copy, Check } from 'lucide-react';

export default function VatCalculator({ layoutMode = 'scroll' }: { layoutMode?: 'scroll' | 'fit' }) {
  const [totalSales, setTotalSales] = useState<string>('');
  const [vatableSales, setVatableSales] = useState<number | null>(null);
  const [vat, setVat] = useState<number | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

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
    setTimeout(() => {
      setCopiedKey(null);
    }, 1500);
  };

  return (
    <div className={`bg-white rounded-3xl shadow-lg border border-yellow-50 transition-all ${
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
            className={`w-full bg-yellow-50 border-2 border-transparent focus:border-yellow-400 focus:bg-white transition-all outline-none ${
              layoutMode === 'scroll'
                ? 'rounded-2xl py-3.5 pl-10 pr-4 text-2xl font-black'
                : 'rounded-xl py-2.5 pl-8 pr-3 text-xl font-bold'
            }`}
          />
        </div>
      </div>

      <div className={layoutMode === 'scroll' ? 'space-y-3' : 'space-y-2'}>
        {/* Vatable Sales */}
        <div className={`bg-gray-50 rounded-2xl flex justify-between items-center group transition-all hover:bg-yellow-50 ${
          layoutMode === 'scroll' ? 'p-4' : 'p-3'
        }`}>
          <div className="flex-1 min-w-0 pr-2">
            <p className={`font-bold text-gray-400 uppercase tracking-widest ${
              layoutMode === 'scroll' ? 'text-xs' : 'text-[10px]'
            }`}>Vatable Sales (V.S.)</p>
            <div className="flex items-center gap-1.5 mt-0.5 sm:mt-0 flex-wrap">
              <span className={`font-black text-gray-700 truncate tracking-tight transition-all ${
                layoutMode === 'scroll' ? 'text-xl xs:text-2xl py-0.5' : 'text-lg font-bold'
              }`}>
                {vatableSales !== null ? formatCurrency(vatableSales) : '₱0.00'}
              </span>
              {vatableSales !== null && (
                <button
                  onClick={() => handleCopy(vatableSales.toFixed(2), 'vs')}
                  className={`font-semibold text-yellow-905 bg-yellow-105 hover:bg-yellow-200/80 rounded-md flex items-center gap-1 transition-all active:scale-95 border border-yellow-250/30 ${
                    layoutMode === 'scroll' ? 'p-1 px-2.5 text-xs' : 'p-0.5 px-1.5 text-[9px]'
                  }`}
                  title="Copy numeric value"
                >
                  {copiedKey === 'vs' ? (
                    <>
                      <Check size={layoutMode === 'scroll' ? 12 : 10} className="text-green-600" />
                      <span className={`text-green-600 font-bold ${layoutMode === 'scroll' ? 'text-xs' : 'text-[8px]'}`}>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={layoutMode === 'scroll' ? 12 : 10} className="text-yellow-800" />
                      <span className={layoutMode === 'scroll' ? 'text-xs font-bold' : 'text-[8px]'}>Copy</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
          <div className={`shrink-0 rounded-full bg-gray-200 group-hover:bg-yellow-200 flex items-center justify-center transition-all ${
            layoutMode === 'scroll' ? 'w-10 h-10 text-xs font-black' : 'w-8 h-8 text-[9px] font-bold'
          }`}>
            <span className="text-gray-500">1.12</span>
          </div>
        </div>

        {/* VAT Amount */}
        <div className={`bg-gray-50 rounded-2xl flex justify-between items-center group transition-all hover:bg-yellow-50 ${
          layoutMode === 'scroll' ? 'p-4' : 'p-3'
        }`}>
          <div className="flex-1 min-w-0 pr-2">
            <p className={`font-bold text-gray-400 uppercase tracking-widest ${
              layoutMode === 'scroll' ? 'text-xs' : 'text-[10px]'
            }`}>VAT Amount</p>
            <div className="flex items-center gap-1.5 mt-0.5 sm:mt-0 flex-wrap">
              <span className={`font-black text-yellow-600 truncate tracking-tight transition-all ${
                layoutMode === 'scroll' ? 'text-xl xs:text-2xl py-0.5' : 'text-lg font-bold'
              }`}>
                {vat !== null ? formatCurrency(vat) : '₱0.00'}
              </span>
              {vat !== null && (
                <button
                  onClick={() => handleCopy(vat.toFixed(2), 'vat')}
                  className={`font-semibold text-yellow-905 bg-yellow-105 hover:bg-yellow-200/80 rounded-md flex items-center gap-1 transition-all active:scale-95 border border-yellow-250/30 ${
                    layoutMode === 'scroll' ? 'p-1 px-2.5 text-xs' : 'p-0.5 px-1.5 text-[9px]'
                  }`}
                  title="Copy numeric value"
                >
                  {copiedKey === 'vat' ? (
                    <>
                      <Check size={layoutMode === 'scroll' ? 12 : 10} className="text-green-600" />
                      <span className={`text-green-600 font-bold ${layoutMode === 'scroll' ? 'text-xs' : 'text-[8px]'}`}>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={layoutMode === 'scroll' ? 12 : 10} className="text-yellow-850" />
                      <span className={layoutMode === 'scroll' ? 'text-xs font-bold' : 'text-[8px]'}>Copy</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
          <div className={`shrink-0 rounded-full bg-gray-200 group-hover:bg-yellow-200 flex items-center justify-center transition-all ${
            layoutMode === 'scroll' ? 'w-10 h-10 text-xs font-black' : 'w-8 h-8 text-[9px] font-bold'
          }`}>
            <span className="text-gray-500">12%</span>
          </div>
        </div>
      </div>

      <div className={`bg-yellow-400 text-white rounded-xl ${
        layoutMode === 'scroll' ? 'mt-5 p-4' : 'mt-4 p-3'
      }`}>
        <p className={`font-bold uppercase tracking-widest opacity-80 ${
          layoutMode === 'scroll' ? 'text-xs mb-1' : 'text-[10px] mb-0.5'
        }`}>Formula</p>
        <div className={`font-bold opacity-95 flex gap-4 ${
          layoutMode === 'scroll' ? 'text-xs' : 'text-[11px]'
        }`}>
          <span>TOTAL ÷ 1.12 = V.S.</span>
          <span>TOTAL − V.S. = VAT</span>
        </div>
      </div>
    </div>
  );
}
