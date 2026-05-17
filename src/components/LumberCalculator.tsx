import React, { useState, useEffect } from 'react';

export default function LumberCalculator() {
  const [thickness, setThickness] = useState<string>('');
  const [width, setWidth] = useState<string>('');
  const [length, setLength] = useState<string>('');
  const [pricePerBoardFoot, setPricePerBoardFoot] = useState<string>('');
  const [totalPrice, setTotalPrice] = useState<number | null>(null);

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

  return (
    <div className="bg-white p-6 rounded-3xl shadow-lg border border-yellow-50">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 px-1">
              Thickness
            </label>
            <input
              type="number"
              inputMode="decimal"
              value={thickness}
              onChange={(e) => setThickness(e.target.value)}
              placeholder="0"
              className="w-full bg-gray-50 border-2 border-transparent focus:border-yellow-400 focus:bg-white rounded-xl p-3 text-lg font-bold transition-all outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 px-1">
              Width
            </label>
            <input
              type="number"
              inputMode="decimal"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              placeholder="0"
              className="w-full bg-gray-50 border-2 border-transparent focus:border-yellow-400 focus:bg-white rounded-xl p-3 text-lg font-bold transition-all outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 px-1">
            Length (ft)
          </label>
          <input
            type="number"
            inputMode="decimal"
            value={length}
            onChange={(e) => setLength(e.target.value)}
            placeholder="0"
            className="w-full bg-gray-50 border-2 border-transparent focus:border-yellow-400 focus:bg-white rounded-xl p-3 text-lg font-bold transition-all outline-none"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 px-1">
            Price per board foot
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-600 font-bold">₱</span>
            <input
              type="number"
              inputMode="decimal"
              value={pricePerBoardFoot}
              onChange={(e) => setPricePerBoardFoot(e.target.value)}
              placeholder="0.00"
              className="w-full bg-gray-50 border-2 border-transparent focus:border-yellow-400 focus:bg-white rounded-xl py-3 pl-8 pr-3 text-lg font-bold transition-all outline-none"
            />
          </div>
        </div>
      </div>

      <div className="mt-8 p-6 bg-yellow-400 rounded-3xl text-center shadow-lg shadow-yellow-200">
        <p className="text-xs font-bold text-yellow-900 uppercase tracking-[0.2em] mb-2">Total Price</p>
        <p className="text-4xl font-black text-white tracking-tight">
          {totalPrice !== null ? formatCurrency(totalPrice) : '₱0.00'}
        </p>
      </div>

      <div className="mt-6 text-center">
        <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
          (Thickness × Width × Length × Price) ÷ 12
        </p>
      </div>
    </div>
  );
}
