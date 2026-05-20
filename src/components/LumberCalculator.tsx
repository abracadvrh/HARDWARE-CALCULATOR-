import React, { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';

export default function LumberCalculator({ layoutMode = 'scroll' }: { layoutMode?: 'scroll' | 'fit' }) {
  const [thickness, setThickness] = useState<string>('');
  const [width, setWidth] = useState<string>('');
  const [length, setLength] = useState<string>('');
  const [pricePerBoardFoot, setPricePerBoardFoot] = useState<string>('');
  const [totalPrice, setTotalPrice] = useState<number | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const calculate = () => {
    const t = parseFloat(thickness);
    const w = parseFloat(width);
    const l = parseFloat(length);
    const p = parseFloat(pricePerBoardFoot);

    if (!isNaN(t) && !isNaN(w) && !isNaN(l) && !isNaN(p)) {
      const result = (t * w * l * p) / 12;
      setTotalPrice(result);
    } else {
      setTotalPrice(null);
    }
  };

  useEffect(() => {
    calculate();
  }, [thickness, width, length, pricePerBoardFoot]);

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const handleCopy = () => {
    if (totalPrice === null) return;
    navigator.clipboard.writeText(totalPrice.toFixed(2));
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1500);
  };

  return (
    <div className={`bg-white rounded-3xl shadow-lg border border-yellow-50 transition-all ${
      layoutMode === 'scroll' ? 'p-5 xs:p-6 mb-2' : 'p-3.5 xs:p-5'
    }`}>
      <div className={layoutMode === 'scroll' ? 'space-y-4' : 'space-y-2.5'}>
        <div className={`grid grid-cols-2 gap-2.5 ${layoutMode === 'scroll' ? 'gap-4' : 'gap-2.5'}`}>
          <div>
            <label className={`block font-bold text-gray-400 uppercase tracking-widest px-1 ${
              layoutMode === 'scroll' ? 'text-xs mb-1.5' : 'text-[10px] mb-1'
            }`}>
              Thickness (in)
            </label>
            <input
              type="number"
              inputMode="decimal"
              value={thickness}
              onChange={(e) => setThickness(e.target.value)}
              placeholder="0"
              className={`w-full bg-gray-50 border-2 border-transparent focus:border-yellow-400 focus:bg-white transition-all outline-none ${
                layoutMode === 'scroll' ? 'rounded-2xl py-3 px-4 text-lg font-black' : 'rounded-xl py-2 px-3 text-base font-bold'
              }`}
            />
          </div>
          <div>
            <label className={`block font-bold text-gray-400 uppercase tracking-widest px-1 ${
              layoutMode === 'scroll' ? 'text-xs mb-1.5' : 'text-[10px] mb-1'
            }`}>
              Width (in)
            </label>
            <input
              type="number"
              inputMode="decimal"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              placeholder="0"
              className={`w-full bg-gray-50 border-2 border-transparent focus:border-yellow-400 focus:bg-white transition-all outline-none ${
                layoutMode === 'scroll' ? 'rounded-2xl py-3 px-4 text-lg font-black' : 'rounded-xl py-2 px-3 text-base font-bold'
              }`}
            />
          </div>
        </div>

        <div className={`grid grid-cols-2 gap-2.5 ${layoutMode === 'scroll' ? 'gap-4' : 'gap-2.5'}`}>
          <div>
            <label className={`block font-bold text-gray-400 uppercase tracking-widest px-1 ${
              layoutMode === 'scroll' ? 'text-xs mb-1.5' : 'text-[10px] mb-1'
            }`}>
              Length (ft)
            </label>
            <input
              type="number"
              inputMode="decimal"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              placeholder="0"
              className={`w-full bg-gray-50 border-2 border-transparent focus:border-yellow-400 focus:bg-white transition-all outline-none ${
                layoutMode === 'scroll' ? 'rounded-2xl py-3 px-4 text-lg font-black' : 'rounded-xl py-2 px-3 text-base font-bold'
              }`}
            />
          </div>

          <div>
            <label className={`block font-bold text-gray-400 uppercase tracking-widest px-1 ${
              layoutMode === 'scroll' ? 'text-xs mb-1.5' : 'text-[10px] mb-1'
            }`}>
              Price per Bd Ft
            </label>
            <div className="relative">
              <span className={`absolute top-1/2 -translate-y-1/2 text-yellow-600 font-bold transition-all ${
                layoutMode === 'scroll' ? 'left-4 text-sm font-black' : 'left-3 text-xs'
              }`}>₱</span>
              <input
                type="number"
                inputMode="decimal"
                value={pricePerBoardFoot}
                onChange={(e) => setPricePerBoardFoot(e.target.value)}
                placeholder="0.00"
                className={`w-full bg-gray-50 border-2 border-transparent focus:border-yellow-400 focus:bg-white transition-all outline-none ${
                  layoutMode === 'scroll'
                    ? 'rounded-2xl py-3 pl-8 pr-3 text-lg font-black'
                    : 'rounded-xl py-2 pl-7 pr-2 text-base font-bold'
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={`bg-yellow-400 text-center shadow-md shadow-yellow-250 relative group overflow-hidden transition-all ${
        layoutMode === 'scroll' ? 'mt-5 p-5 rounded-3xl' : 'mt-4 p-4 rounded-2xl'
      }`}>
        <p className={`font-black text-yellow-905 uppercase tracking-[0.2em] transition-all ${
          layoutMode === 'scroll' ? 'text-xs mb-1.5' : 'text-[10px] mb-1'
        }`}>Total Price</p>
        <div className="flex flex-col items-center gap-1.5">
          <p className={`font-black text-white tracking-tight break-all transition-all ${
            layoutMode === 'scroll' ? 'text-3xl xs:text-4xl' : 'text-2xl xs:text-3xl'
          }`}>
            {totalPrice !== null ? formatCurrency(totalPrice) : '₱0.00'}
          </p>
          {totalPrice !== null && (
            <button
              onClick={handleCopy}
              className={`font-semibold uppercase flex items-center justify-center gap-1 transition-all active:scale-95 border border-white/10 ${
                layoutMode === 'scroll'
                  ? 'p-1 px-3.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[10px]'
                  : 'p-0.5 px-2.5 rounded-md bg-white/20 hover:bg-white/30 text-white text-[9px]'
              }`}
              title="Copy numeric value"
            >
              {copied ? (
                <>
                  <Check size={layoutMode === 'scroll' ? 11 : 9} className="text-white" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={layoutMode === 'scroll' ? 11 : 9} className="text-yellow-101" />
                  <span>Copy Price</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div className={layoutMode === 'scroll' ? 'mt-4 text-center' : 'mt-3.5 text-center'}>
        <p className={`font-black text-gray-300 uppercase tracking-widest leading-none select-none ${
          layoutMode === 'scroll' ? 'text-[10px]' : 'text-[9px]'
        }`}>
          (Thickness × Width × Length × Price) ÷ 12
        </p>
      </div>
    </div>
  );
}
