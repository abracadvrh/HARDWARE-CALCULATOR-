import React, { useState, useEffect } from 'react';
import { Info } from 'lucide-react';

export default function Tax2307Calculator() {
  const [totalSales, setTotalSales] = useState<string>('');
  const [whtRate, setWhtRate] = useState<number>(1); // Default 1%

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

  return (
    <div className="bg-white p-6 rounded-3xl shadow-lg border border-yellow-50">
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">
            Total Gross Sales
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-600 font-bold">₱</span>
            <input
              type="number"
              inputMode="decimal"
              value={totalSales}
              onChange={(e) => setTotalSales(e.target.value)}
              placeholder="0.00"
              className="w-full bg-yellow-50 border-2 border-transparent focus:border-yellow-400 focus:bg-white rounded-2xl py-4 pl-10 pr-4 text-xl font-bold transition-all outline-none"
            />
          </div>
        </div>
        
        <div className="col-span-2">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">
            WHT Rate (%)
          </label>
          <select 
            value={whtRate}
            onChange={(e) => setWhtRate(Number(e.target.value))}
            className="w-full bg-gray-50 border-2 border-transparent focus:border-yellow-400 focus:bg-white rounded-xl p-3 text-sm font-bold transition-all outline-none appearance-none"
          >
            <option value={1}>1% (Goods)</option>
            <option value={2}>2% (Services)</option>
            <option value={5}>5%</option>
            <option value={10}>10%</option>
          </select>
        </div>
      </div>

      <div className="space-y-2 border-t border-gray-100 pt-4">
        <div className="flex justify-between items-center py-1">
          <span className="text-xs text-gray-500 font-medium font-mono uppercase">Total Sales:</span>
          <span className="text-sm font-bold">{formatCurrency(parseFloat(totalSales) || 0)}</span>
        </div>
        <div className="flex justify-between items-center py-1">
          <span className="text-xs text-gray-500 font-medium font-mono uppercase">VAT (12%):</span>
          <span className="text-sm font-bold text-red-400">− {formatCurrency(data.vat)}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-y border-dashed border-gray-200">
          <span className="text-xs text-gray-600 font-bold uppercase">Net of VAT:</span>
          <span className="text-sm font-bold">{formatCurrency(data.netOfVat)}</span>
        </div>
        <div className="flex justify-between items-center py-1">
          <span className="text-xs text-gray-500 font-medium font-mono uppercase">Less WHT ({whtRate}%):</span>
          <span className="text-sm font-bold text-red-500">− {formatCurrency(data.wht)}</span>
        </div>
        <div className="flex justify-between items-center py-2 bg-gray-50 px-3 rounded-lg">
          <span className="text-xs text-gray-600 font-bold uppercase">Amount Due:</span>
          <span className="text-sm font-bold">{formatCurrency(data.amountDue)}</span>
        </div>
        <div className="flex justify-between items-center py-1 px-3">
          <span className="text-xs text-gray-500 font-medium font-mono uppercase">Add VAT Ref:</span>
          <span className="text-sm font-bold text-blue-500">+ {formatCurrency(data.vat)}</span>
        </div>

        <div className="mt-4 p-4 bg-yellow-400 rounded-2xl text-center shadow-md shadow-yellow-200">
          <p className="text-[10px] font-bold text-yellow-900 uppercase tracking-[0.2em] mb-1">Total Amount Due</p>
          <p className="text-3xl font-black text-white drop-shadow-sm">
            {formatCurrency(data.totalAmountDue)}
          </p>
          <p className="text-[9px] text-yellow-100 mt-2 font-bold uppercase">Total to pay by the customer</p>
        </div>
      </div>
    </div>
  );
}
