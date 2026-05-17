import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

export default function VatCalculator() {
  const [totalSales, setTotalSales] = useState<string>('');
  const [vatableSales, setVatableSales] = useState<number | null>(null);
  const [vat, setVat] = useState<number | null>(null);

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

  return (
    <div className="bg-white p-6 rounded-3xl shadow-lg border border-yellow-50">
      <div className="mb-6">
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">
          Total Sales Amount
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-600 font-bold">₱</span>
          <input
            type="number"
            inputMode="decimal"
            value={totalSales}
            onChange={(e) => setTotalSales(e.target.value)}
            placeholder="0.00"
            className="w-full bg-yellow-50 border-2 border-transparent focus:border-yellow-400 focus:bg-white rounded-2xl py-4 pl-10 pr-4 text-2xl font-bold transition-all outline-none"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-gray-50 rounded-2xl flex justify-between items-center group transition-all hover:bg-yellow-50">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Vatable Sales (V.S.)</p>
            <p className="text-xl font-bold text-gray-700">
              {vatableSales !== null ? formatCurrency(vatableSales) : '₱0.00'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gray-200 group-hover:bg-yellow-200 flex items-center justify-center transition-colors">
            <span className="text-[10px] font-bold text-gray-500">1.12</span>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-2xl flex justify-between items-center group transition-all hover:bg-yellow-50">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">VAT Amount</p>
            <p className="text-xl font-bold text-yellow-600">
              {vat !== null ? formatCurrency(vat) : '₱0.00'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gray-200 group-hover:bg-yellow-200 flex items-center justify-center transition-colors">
            <span className="text-[10px] font-bold text-gray-500">12%</span>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-yellow-400 rounded-2xl text-white">
        <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Formula</p>
        <p className="text-xs font-medium">TOTAL ⋅ 1.12 = V.S.</p>
        <p className="text-xs font-medium">TOTAL - V.S. = VAT</p>
      </div>
    </div>
  );
}
