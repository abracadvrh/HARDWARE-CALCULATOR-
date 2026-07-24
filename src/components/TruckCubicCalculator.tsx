import React, { useState, useEffect } from 'react';
import { Copy, Check, Truck, Save, RefreshCw, Calculator } from 'lucide-react';
import { SharedHistoryProps } from '../types';

interface ComponentProps extends SharedHistoryProps {
  layoutMode?: 'scroll' | 'fit';
}

export default function TruckCubicCalculator({ layoutMode = 'scroll', onAddHistory }: ComponentProps) {
  // 1. Bed Dimension Unit: Meter | CM | Feet
  const [unit, setUnit] = useState<'meters' | 'cm' | 'feet'>('meters');

  // 2. Bed Dimensions inputs 
  const [length, setLength] = useState<string>('0');
  const [width, setWidth] = useState<string>('0');
  const [depth, setDepth] = useState<string>('0');

  // 3. Calculator Inputs
  // Pre-filled from Bed Dimension calculation, but a fully customizable input!
  const [customCubic, setCustomCubic] = useState<string>('0');
  const [pricePerCubic, setPricePerCubic] = useState<string>('0');
  const [loads, setLoads] = useState<string>('0');

  // UI state states
  const [activeTab, setActiveTab] = useState<'dimensions' | 'aggregate'>('dimensions');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [historySaved, setHistorySaved] = useState<boolean>(false);

  // Read-only reference values computed from dimension inputs
  const [calculatedCbm, setCalculatedCbm] = useState<number>(0);
  const [calculatedCuFt, setCalculatedCuFt] = useState<number>(0);

  // Compute Volume on changes to length, width, depth, or unit
  useEffect(() => {
    const l = parseFloat(length);
    const w = parseFloat(width);
    const d = parseFloat(depth);

    if (!isNaN(l) && !isNaN(w) && !isNaN(d) && l >= 0 && w >= 0 && d >= 0) {
      let cbm = 0;
      let cuft = 0;

      if (unit === 'cm') {
        const totalCm3 = l * w * d;
        cbm = totalCm3 / 1000000; // 1,000,000 cm³ in a CBM
        cuft = cbm * 35.3147;
      } else if (unit === 'meters') {
        cbm = l * w * d;
        cuft = cbm * 35.3147;
      } else { // feet
        cuft = l * w * d;
        cbm = cuft / 35.3147;
      }

      setCalculatedCbm(cbm);
      setCalculatedCuFt(cuft);

      // Automatically pre-fill the customized input truck cubic field
      // with a clean rounded 3-decimal string!
      setCustomCubic(cbm.toFixed(3));
    } else {
      setCalculatedCbm(0);
      setCalculatedCuFt(0);
    }
  }, [length, width, depth, unit]);

  // Compute the Aggregate Price Calculation
  const cubicVal = parseFloat(customCubic) || 0;
  const priceVal = parseFloat(pricePerCubic) || 0;
  const loadsVal = parseFloat(loads) || 0;
  const grandTotal = cubicVal * priceVal * loadsVal;

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    }).format(num);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);

    if (grandTotal > 0) {
      onAddHistory?.(
        'TRUCK_CUBIC',
        'Truck Cubic & Cost Calc',
        `${loadsVal} load(s) × ${cubicVal.toFixed(3)} m³ @ ₱${priceVal.toLocaleString()}/m³`,
        `Grand Total: ${formatCurrency(grandTotal)}`
      );
    }

    setTimeout(() => setCopiedKey(null), 1500);
  };

  const saveToHistoryLog = () => {
    if (grandTotal <= 0) return;
    onAddHistory?.(
      'TRUCK_CUBIC',
      'Truck Cubic Aggregates',
      `${loadsVal} load(s) × ${cubicVal.toFixed(3)} m³ @ ₱${priceVal.toLocaleString()}/m³`,
      `Total cost: ${formatCurrency(grandTotal)}`
    );
    setHistorySaved(true);
    setTimeout(() => setHistorySaved(false), 2000);
  };

  // Fraction and Integer Quick Selectors for No. of Loads
  const fractionButtons = [
    { label: '1/8', value: 0.125 },
    { label: '1/4', value: 0.25 },
    { label: '1/2', value: 0.5 },
    { label: '3/4', value: 0.75 },
    { label: '1', value: 1.0 },
    { label: '1.5', value: 1.5 },
    { label: '2', value: 2.0 },
    { label: '3', value: 3.0 },
    { label: '4', value: 4.0 },
    { label: '5', value: 5.0 }
  ];

  // Quick reset to Calculated values
  const handleResetToCalculated = () => {
    setCustomCubic(calculatedCbm.toFixed(3));
  };

  return (
    <div className={`bg-white dark:bg-stone-900 rounded-3xl border border-gray-250/90 dark:border-stone-800 shadow-lg ${
      layoutMode === 'scroll' ? 'p-4 xs:p-5 mb-2 space-y-4' : 'p-3 xs:p-4 space-y-3'
    }`}>
      
      {/* SECTION SELECTOR TAB (SEGMENTED SWITCH SWITCH) */}
      <div className="grid grid-cols-2 gap-1 p-1 bg-yellow-50/70 dark:bg-stone-950/40 border border-yellow-200/50 dark:border-stone-850 rounded-2xl shadow-inner select-none transition-all">
        <button
          type="button"
          onClick={() => setActiveTab('dimensions')}
          className={`py-2 px-3 rounded-xl text-center text-xs font-black transition-all outline-none flex items-center justify-center gap-2 tracking-wider uppercase ${
            activeTab === 'dimensions'
              ? 'bg-gradient-to-r from-yellow-405 to-amber-400 dark:from-yellow-455 dark:to-yellow-300 text-yellow-955 dark:text-stone-950 font-black shadow-md shadow-yellow-200/50 dark:shadow-[0_4px_12px_rgba(250,204,21,0.25)] scale-[1.015] transform border border-yellow-300/40 dark:border-yellow-400/30'
              : 'text-gray-500 dark:text-stone-400 hover:text-yellow-950 dark:hover:text-yellow-400 hover:bg-white/50 dark:hover:bg-stone-850/50'
          }`}
        >
          <Truck size={14} className="stroke-[2.5]" />
          <span>Bed Dimensions</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('aggregate')}
          className={`py-2 px-3 rounded-xl text-center text-xs font-black transition-all outline-none flex items-center justify-center gap-2 tracking-wider uppercase ${
            activeTab === 'aggregate'
              ? 'bg-gradient-to-r from-yellow-405 to-amber-400 dark:from-yellow-455 dark:to-yellow-300 text-yellow-955 dark:text-stone-950 font-black shadow-md shadow-yellow-200/50 dark:shadow-[0_4px_12px_rgba(250,204,21,0.25)] scale-[1.015] transform border border-yellow-300/40 dark:border-yellow-400/30'
              : 'text-gray-500 dark:text-stone-400 hover:text-yellow-950 dark:hover:text-yellow-400 hover:bg-white/50 dark:hover:bg-stone-850/50'
          }`}
        >
          <Calculator size={14} className="stroke-[2.5]" />
          <span>Aggregate Calc</span>
        </button>
      </div>

      {activeTab === 'dimensions' ? (
        /* SECTION 1: TRUCK BED INTERNAL DIMENSIONS (DIMS) */
        <div className="space-y-3.5 animate-[fadeIn_0.15s_ease-out]">
          <div className="bg-yellow-50/15 dark:bg-stone-850/20 rounded-2xl p-3.5 border border-yellow-101/60 dark:border-stone-800/80 space-y-3">
            <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-gradient-to-br from-yellow-405 to-amber-400 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Truck size={13} className="stroke-[2.5]" />
                </span>
                <div>
                  <h4 className="text-[11px] font-black text-yellow-950 dark:text-yellow-400 uppercase tracking-widest leading-none">
                    Truck Bed Dimensions
                  </h4>
                  <p className="text-[8px] font-bold text-gray-400 dark:text-stone-500 uppercase tracking-widest mt-0.5 leading-none">
                    Internal Measurements
                  </p>
                </div>
              </div>

              {/* Unit Toggle: Meter | CM | Ft */}
              <div className="flex bg-yellow-55 dark:bg-stone-850 p-0.5 rounded-lg text-[9px] font-black border border-yellow-101/30 dark:border-stone-800/50 select-none">
                {(['meters', 'cm', 'feet'] as const).map((u) => (
                  <button
                    key={u}
                    onClick={() => setUnit(u)}
                    className={`py-1 px-2.5 rounded transition-all uppercase leading-none outline-none font-black ${
                      unit === u 
                        ? 'bg-yellow-404 dark:bg-yellow-405 text-white dark:text-stone-950 shadow-xs scale-[1.02] border border-yellow-300 dark:border-yellow-450' 
                        : 'text-gray-400 dark:text-stone-400 hover:text-yellow-950 dark:hover:text-yellow-405'
                    }`}
                  >
                    {u === 'meters' ? 'Meter' : u === 'cm' ? 'CM' : 'Ft'}
                  </button>
                ))}
              </div>
            </div>

            {/* 3-Column Dimension Grid with compact sizing */}
            <div className="grid grid-cols-3 gap-2.5">
              {/* Length */}
              <div className="bg-white dark:bg-stone-900 rounded-xl border-2 border-yellow-101 dark:border-stone-800 p-2 text-center shadow-xs hover:border-yellow-400 dark:hover:border-stone-750 focus-within:border-yellow-405 dark:focus-within:border-yellow-405 transition-all">
                <span className="text-[8.5px] font-black text-gray-500 dark:text-stone-400 uppercase tracking-wider block leading-none mb-1">
                  Length
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  placeholder="0"
                  className="w-full bg-transparent text-center font-black text-gray-900 dark:text-stone-100 text-sm sm:text-base outline-none px-1"
                />
                <span className="text-[7.5px] text-amber-700 dark:text-amber-400 font-extrabold block bg-yellow-50 dark:bg-stone-850 uppercase py-0.5 rounded mt-1 select-none leading-none tracking-wider">
                  {unit === 'cm' ? 'cm' : unit === 'meters' ? 'meter' : 'feet'}
                </span>
              </div>

              {/* Width */}
              <div className="bg-white dark:bg-stone-900 rounded-xl border-2 border-yellow-101 dark:border-stone-800 p-2 text-center shadow-xs hover:border-yellow-400 dark:hover:border-stone-750 focus-within:border-yellow-405 dark:focus-within:border-yellow-405 transition-all">
                <span className="text-[8.5px] font-black text-gray-500 dark:text-stone-400 uppercase tracking-wider block leading-none mb-1">
                  Width
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  placeholder="0"
                  className="w-full bg-transparent text-center font-black text-gray-900 dark:text-stone-100 text-sm sm:text-base outline-none px-1"
                />
                <span className="text-[7.5px] text-amber-700 dark:text-amber-400 font-extrabold block bg-yellow-50 dark:bg-stone-850 uppercase py-0.5 rounded mt-1 select-none leading-none tracking-wider">
                  {unit === 'cm' ? 'cm' : unit === 'meters' ? 'meter' : 'feet'}
                </span>
              </div>

              {/* Depth / Height */}
              <div className="bg-white dark:bg-stone-900 rounded-xl border-2 border-yellow-101 dark:border-stone-800 p-2 text-center shadow-xs hover:border-yellow-400 dark:hover:border-stone-750 focus-within:border-yellow-405 dark:focus-within:border-yellow-405 transition-all">
                <span className="text-[8.5px] font-black text-gray-500 dark:text-stone-400 uppercase tracking-wider block leading-none mb-1">
                  Depth / Ht
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={depth}
                  onChange={(e) => setDepth(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  placeholder="0"
                  className="w-full bg-transparent text-center font-black text-gray-900 dark:text-stone-100 text-sm sm:text-base outline-none px-1"
                />
                <span className="text-[7.5px] text-amber-700 dark:text-amber-400 font-extrabold block bg-yellow-50 dark:bg-stone-850 uppercase py-0.5 rounded mt-1 select-none leading-none tracking-wider">
                  {unit === 'cm' ? 'cm' : unit === 'meters' ? 'meter' : 'feet'}
                </span>
              </div>
            </div>
          </div>

          {/* HIGHLIGHTED VOLUME RESULT TAB (WITH MUCH BIGGER FONT SIZE DEFINED) */}
          <div className={`relative overflow-hidden rounded-2xl border text-center transition-all ${
            layoutMode === 'scroll'
              ? 'p-4.5 shadow-md shadow-yellow-250/30 dark:shadow-[0_0_16px_rgba(250,204,21,0.15)] bg-gradient-to-br from-yellow-400 to-yellow-455 dark:from-yellow-405 dark:to-yellow-500 border-yellow-300 dark:border-yellow-450/70 text-yellow-955'
              : 'p-3.5 rounded-xl bg-yellow-400 dark:bg-yellow-405 border-yellow-300 dark:border-yellow-405 text-yellow-955 shadow-sm'
          }`}>
            {/* Backdrop watermark */}
            <div className="absolute right-3 bottom-0 pointer-events-none opacity-[0.05] select-none translate-y-[20%]">
              <Truck size={90} className="stroke-[1]" />
            </div>

            <p className={`font-black uppercase tracking-[0.25em] mb-1 text-yellow-950 dark:text-stone-900 ${
              layoutMode === 'scroll' ? 'text-[10px]' : 'text-[9.5px]'
            }`}>
              ⚡ CALCULATED BED VOLUME ⚡
            </p>

            <div className="flex flex-col items-center justify-center gap-0.5">
              <div className="text-white dark:text-stone-900 leading-none text-center">
                <span className={`font-black tracking-tighter block ${
                  layoutMode === 'scroll' ? 'text-4xl xs:text-5xl sm:text-6xl py-0.5' : 'text-3xl xs:text-4xl py-0.5'
                }`}>
                  {calculatedCbm.toFixed(3)}
                </span>
                <span className={`inline-block font-black uppercase tracking-widest opacity-95 ${
                  layoutMode === 'scroll' ? 'text-[10px] sm:text-xs' : 'text-[9.5px]'
                }`}>
                  CBM (m³)
                </span>
              </div>

              <div className={`mt-1.5 py-1 px-3 rounded-lg bg-white/20 dark:bg-stone-910/20 text-white dark:text-stone-900 font-extrabold font-mono tracking-wide ${
                layoutMode === 'scroll' ? 'text-xs' : 'text-[11px]'
              }`}>
                {calculatedCuFt.toFixed(1)} CU.FT Equivalent
              </div>
            </div>
              
              <button
                onClick={() => handleCopy(`${calculatedCbm.toFixed(3)} CBM (${calculatedCuFt.toFixed(1)} CU.FT) from L=${length}, W=${width}, D=${depth} ${unit}`, 'dim-copy')}
                type="button"
                className={`mt-2.5 rounded-lg font-bold uppercase flex items-center justify-center gap-1 transition-all active:scale-95 ${
                  layoutMode === 'scroll'
                    ? 'p-1.5 px-4 text-[10px] bg-white text-yellow-955 shadow-xs hover:bg-yellow-50'
                    : 'p-1 px-3 text-[9.5px] bg-white text-yellow-955 hover:bg-yellow-50 shadow-xs'
                }`}
              >
                {copiedKey === 'dim-copy' ? (
                  <>
                    <Check size={layoutMode === 'scroll' ? 12 : 10} className="text-green-600 stroke-[3]" />
                    <span className="text-green-600 font-extrabold">Copied Specs!</span>
                  </>
                ) : (
                  <>
                    <Copy size={layoutMode === 'scroll' ? 11 : 9.5} className="text-yellow-955" />
                    <span>Copy Volume Specs</span>
                  </>
                )}
              </button>
            </div>
          </div>      ) : (
        /* SECTION 2: STREAMLINED AGGREGATE PRICE CALCULATOR */
        <div className="space-y-4 animate-[fadeIn_0.15s_ease-out]">
          <div className="flex items-center gap-2 border-b border-yellow-101 dark:border-stone-800 pb-2">
            <span className="w-2.5 h-3.5 bg-gradient-to-b from-yellow-405 to-amber-400 rounded-full shadow-xs"></span>
            <h4 className="text-xs font-black text-yellow-950 dark:text-yellow-400 uppercase tracking-widest leading-none">
              Aggregate Price Calculator
            </h4>
          </div>

          <div className="grid grid-cols-2 gap-4 pb-0.5">
            {/* Box 1: CUBIC VOLUME (Customizable Input!) */}
            <div className="space-y-1.5 relative group">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] sm:text-[11px] font-black text-gray-500 dark:text-stone-300 uppercase tracking-wider leading-none select-none">
                  Truck Volume
                </label>
                
                {/* Reset to Calculated Dimension Trigger */}
                {Math.abs(parseFloat(customCubic) - calculatedCbm) > 0.005 && (
                  <button
                    type="button"
                    onClick={handleResetToCalculated}
                    className="text-[8px] sm:text-[9px] font-black text-amber-700 dark:text-yellow-405 flex items-center gap-1 active:scale-95 transition-all hover:text-amber-600 bg-yellow-50 dark:bg-stone-850 px-1.5 py-0.5 rounded border border-yellow-250 animate-bounce"
                    title="Reset to calculated volume from dimensions"
                  >
                    <RefreshCw size={9} className="animate-spin" style={{ animationDuration: '4s' }} />
                    <span>RESET</span>
                  </button>
                )}
              </div>
              
              <div className="relative font-mono shadow-xs">
                <input
                  type="number"
                  inputMode="decimal"
                  value={customCubic}
                  onChange={(e) => setCustomCubic(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  placeholder="0.00"
                  className="w-full bg-white dark:bg-stone-900 border-2 border-yellow-250 dark:border-stone-800 focus:border-yellow-405 dark:focus:border-yellow-450 rounded-2xl py-3 px-4 text-sm font-black outline-none transition-all text-gray-850 dark:text-stone-100 font-mono focus:ring-2 focus:ring-yellow-400/5"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[8.5px] font-black text-amber-700 dark:text-amber-500 bg-yellow-101/50 dark:bg-stone-850 px-1.5 py-0.5 rounded uppercase font-sans leading-none">
                  m³
                </span>
              </div>
              {calculatedCbm > 0 && Math.abs(parseFloat(customCubic) - calculatedCbm) < 0.01 ? (
                <p className="text-[7.5px] sm:text-[8px] text-emerald-600 dark:text-emerald-405 font-black leading-none flex items-center gap-0.5 uppercase tracking-wider px-1">
                  ✓ Matched dims
                </p>
              ) : (
                <p className="text-[7.5px] sm:text-[8px] text-gray-400 dark:text-stone-500 font-extrabold uppercase tracking-wide leading-none p-1">
                  Custom Capacity
                </p>
              )}
            </div>

            {/* Box 2: PRICE PER CUBIC METER */}
            <div className="space-y-1.5">
              <label className="text-[10px] sm:text-[11px] font-black text-gray-500 dark:text-stone-300 uppercase tracking-wider leading-none block select-none px-1">
                Price per Cubic
              </label>
              <div className="relative font-mono shadow-xs">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-700 dark:text-amber-400 text-sm font-black pointer-events-none font-sans">
                  ₱
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={pricePerCubic}
                  onChange={(e) => setPricePerCubic(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  placeholder="0"
                  className="w-full bg-white dark:bg-stone-900 border-2 border-yellow-250 dark:border-stone-800 focus:border-yellow-405 dark:focus:border-yellow-450 rounded-2xl py-3 pl-8 pr-4 text-sm font-black outline-none transition-all text-gray-850 dark:text-stone-100 font-mono focus:ring-2 focus:ring-yellow-400/5"
                />
              </div>
              <p className="text-[7.5px] sm:text-[8px] text-gray-400 dark:text-stone-500 font-extrabold uppercase tracking-wide leading-none px-1">
                Rate per cubic meter
              </p>
            </div>
          </div>

          {/* Box 3: NO OF LOADS INPUT & FRAC QUICK SELECTORS */}
          <div className="bg-yellow-50/10 dark:bg-stone-850/25 rounded-2xl p-4 border border-yellow-101/60 dark:border-stone-800/80 space-y-3">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] sm:text-[11px] font-black text-gray-500 dark:text-stone-300 uppercase tracking-wider select-none">
                Number of Loads (Trips)
              </label>
              <div className="relative w-28 shadow-xs">
                <input
                  type="number"
                  inputMode="decimal"
                  value={loads}
                  onChange={(e) => setLoads(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  placeholder="Qty"
                  className="w-full text-center bg-white dark:bg-stone-900 border-2 border-yellow-250 dark:border-stone-800 focus:border-yellow-405 dark:focus:border-yellow-450 rounded-xl py-2 text-sm font-black font-mono outline-none transition-all text-gray-850 dark:text-stone-100 focus:ring-2 focus:ring-yellow-405/10"
                />
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div className="grid grid-cols-5 gap-1.5 pt-1">
              {fractionButtons.map((f) => {
                const currentLoadsVal = parseFloat(loads) || 0;
                const active = Math.abs(currentLoadsVal - f.value) < 0.001;
                return (
                  <button
                    key={f.label}
                    type="button"
                    onClick={() => setLoads(f.value.toString())}
                    className={`py-2.5 rounded-xl text-[10px] sm:text-[11px] font-black active:scale-[0.96] transition-all outline-none leading-none border-2 ${
                      active 
                        ? 'bg-gradient-to-b from-yellow-400 to-amber-400 border-yellow-350 dark:border-yellow-450 text-yellow-955 dark:text-stone-950 font-black shadow-xs scale-[1.02]' 
                        : 'bg-white dark:bg-stone-900 hover:bg-yellow-50/50 dark:hover:bg-stone-800/60 border-yellow-101/40 dark:border-stone-800 text-gray-500 dark:text-stone-400'
                    }`}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 3: THE HIGHLY HIGHLIGHTED RESULT CARD */}
          <div className="bg-gradient-to-br from-yellow-350 to-yellow-450 dark:from-yellow-400 dark:to-yellow-500 rounded-3xl p-5 border-2 border-yellow-300 dark:border-yellow-550 shadow-[0_10px_25px_-5px_rgba(250,204,21,0.35)] relative overflow-hidden flex flex-col xs:flex-row justify-between items-center gap-4">
            {/* Subtle backdrop graphical watermark */}
            <div className="absolute right-0 bottom-0 pointer-events-none opacity-[0.06] select-none translate-x-[15%] translate-y-[20%]">
              <span className="text-8xl font-sans font-black italic text-stone-950">PHP</span>
            </div>

            <div className="text-center xs:text-left z-10 shrink-0">
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-stone-900 block pb-1 select-none leading-none opacity-85">
                GRAND TOTAL ESTIMATED COST
              </span>
              <div 
                onClick={() => handleCopy(`₱${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'total-main-click')}
                className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tighter text-stone-950 flex items-baseline justify-center xs:justify-start gap-1 leading-none py-1 cursor-pointer hover:opacity-85 transition-opacity active:scale-[0.99]"
                title="Tap to copy grand total"
              >
                <span className="text-stone-900 text-xl font-bold">₱</span>
                <span>
                  {grandTotal > 0 ? grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                </span>
                {copiedKey === 'total-main-click' && (
                  <span className="text-[10px] font-black text-emerald-850 lowercase ml-2 font-sans bg-white/60 px-1.5 py-0.5 rounded border border-emerald-300">copied!</span>
                )}
              </div>
              
              {/* Calculation summary line */}
              <p className="text-[10px] sm:text-[11px] text-stone-905 font-extrabold uppercase mt-1 tracking-wider leading-none">
                {loadsVal} Load(s) × {cubicVal.toFixed(3)} m³ @ ₱{priceVal.toLocaleString()}/m³
              </p>
            </div>

            {/* Action buttons directly in highlighted panel */}
            <div className="flex gap-2.5 z-10 shrink-0 w-full xs:w-auto justify-center xs:justify-end">
              <button
                onClick={() => handleCopy(`${loadsVal} Load(s) x ${cubicVal.toFixed(3)}m³ @ ₱${priceVal.toLocaleString()}/m³ - Total: ₱${grandTotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`, 'price-calc-copy')}
                type="button"
                className="py-2.5 px-4 rounded-xl bg-stone-950 hover:bg-stone-900 text-white text-[10px] sm:text-[11px] font-black tracking-wider transition-all active:scale-[0.95] flex items-center gap-1.5 shadow-md uppercase shrink-0 outline-none cursor-pointer"
                title="Copy complete calculation layout"
              >
                {copiedKey === 'price-calc-copy' ? (
                  <>
                    <Check size={12} className="text-emerald-400 font-black stroke-[3]" />
                    <span className="text-emerald-400 font-black">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={11} className="text-white" />
                    <span>Copy Sizing</span>
                  </>
                )}
              </button>

              <button
                onClick={saveToHistoryLog}
                type="button"
                className="py-2.5 px-4 rounded-xl bg-stone-950 hover:bg-stone-900 text-white text-[10px] sm:text-[11px] font-black tracking-wider transition-all active:scale-[0.95] flex items-center gap-1.5 shadow-md uppercase shrink-0 outline-none cursor-pointer"
                title="Save aggregate cost estimate to log"
              >
                {historySaved ? (
                  <>
                    <Check size={12} className="text-emerald-400 font-black stroke-[3]" />
                    <span>Logged!</span>
                  </>
                ) : (
                  <>
                    <Save size={11} className="text-white" />
                    <span>Save Log</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER INFORMATIONAL LABELS */}
      <div className="text-[8px] text-gray-400 dark:text-stone-500 text-center font-mono leading-normal pt-1 flex justify-between select-none">
        <span>🇵🇭 Hauling & Aggregate System</span>
        <span>Philippine Specs</span>
      </div>
    </div>
  );
}
