import React, { useState, useEffect } from 'react';
import { Ruler, Scale, RefreshCw, Layers, Wrench, CircleDot, Info, Copy, Check } from 'lucide-react';

type ConversionType = 'length' | 'weight' | 'volume' | 'area' | 'bolt_drill' | 'pvc_pipes';

interface UnitInfo {
  name: string;
  symbol: string;
  factor: number;
}

const MEASUREMENTS: Record<'length' | 'weight' | 'volume' | 'area', { label: string; icon: any; units: UnitInfo[] }> = {
  length: {
    label: 'Length',
    icon: Ruler,
    units: [
      { name: 'Millimeters', symbol: 'mm', factor: 0.001 },
      { name: 'Centimeters', symbol: 'cm', factor: 0.01 },
      { name: 'Meters', symbol: 'm', factor: 1.0 },
      { name: 'Kilometers', symbol: 'km', factor: 1000.0 },
      { name: 'Inches', symbol: 'in', factor: 0.0254 },
      { name: 'Feet', symbol: 'ft', factor: 0.3048 },
      { name: 'Yards', symbol: 'yd', factor: 0.9144 },
      { name: 'Miles', symbol: 'mi', factor: 1609.344 },
    ],
  },
  weight: {
    label: 'Weight & Mass',
    icon: Scale,
    units: [
      { name: 'Milligrams', symbol: 'mg', factor: 0.001 },
      { name: 'Grams', symbol: 'g', factor: 1.0 },
      { name: 'Kilograms', symbol: 'kg', factor: 1000.0 },
      { name: 'Pounds', symbol: 'lb', factor: 453.59237 },
      { name: 'Ounces', symbol: 'oz', factor: 28.34952 },
    ],
  },
  volume: {
    label: 'Volume',
    icon: RefreshCw,
    units: [
      { name: 'Milliliters', symbol: 'mL', factor: 0.001 },
      { name: 'Liters', symbol: 'L', factor: 1.0 },
      { name: 'Cups (US)', symbol: 'cup', factor: 0.236588 },
      { name: 'Pints (US)', symbol: 'pt', factor: 0.473176 },
      { name: 'Quarts (US)', symbol: 'qt', factor: 0.946353 },
      { name: 'Gallons (US)', symbol: 'gal', factor: 3.78541 },
      { name: 'Cubic Meters', symbol: 'm³', factor: 1000.0 },
    ],
  },
  area: {
    label: 'Area',
    icon: Layers,
    units: [
      { name: 'Square Centimeters', symbol: 'cm²', factor: 0.0001 },
      { name: 'Square Meters', symbol: 'm²', factor: 1.0 },
      { name: 'Square Feet', symbol: 'ft²', factor: 0.092903 },
      { name: 'Square Yards', symbol: 'yd²', factor: 0.836127 },
      { name: 'Acres', symbol: 'ac', factor: 4046.8564 },
      { name: 'Hectares', symbol: 'ha', factor: 10000.0 },
      { name: 'Square Kilometers', symbol: 'km²', factor: 1000000.0 },
    ],
  },
};

// Bolt / Drill standard fractions alignment data
interface DrillBitMapping {
  fraction: string;
  decimalInches: number;
  mm: number;
  note?: string;
}

const DRILL_BIT_DATA: DrillBitMapping[] = [
  { fraction: '1/16"', decimalInches: 0.0625, mm: 1.59 },
  { fraction: '5/64"', decimalInches: 0.0781, mm: 1.98 },
  { fraction: '3/32"', decimalInches: 0.0938, mm: 2.38 },
  { fraction: '7/64"', decimalInches: 0.1094, mm: 2.78 },
  { fraction: '1/8"', decimalInches: 0.1250, mm: 3.18, note: 'Common small size' },
  { fraction: '9/64"', decimalInches: 0.1406, mm: 3.57 },
  { fraction: '5/32"', decimalInches: 0.1563, mm: 3.97, note: 'Practically 4mm' },
  { fraction: '11/64"', decimalInches: 0.1719, mm: 4.37 },
  { fraction: '3/16"', decimalInches: 0.1875, mm: 4.76, note: 'Popular drill bit size' },
  { fraction: '13/64"', decimalInches: 0.2031, mm: 5.16 },
  { fraction: '7/32"', decimalInches: 0.2188, mm: 5.56 },
  { fraction: '15/64"', decimalInches: 0.2344, mm: 5.95, note: 'Close to 6mm' },
  { fraction: '1/4"', decimalInches: 0.2500, mm: 6.35, note: 'Standard anchor size' },
  { fraction: '17/64"', decimalInches: 0.2656, mm: 6.75 },
  { fraction: '9/32"', decimalInches: 0.2813, mm: 7.14 },
  { fraction: '19/64"', decimalInches: 0.2969, mm: 7.54 },
  { fraction: '5/16"', decimalInches: 0.3125, mm: 7.94, note: 'Practically 8mm' },
  { fraction: '21/64"', decimalInches: 0.3281, mm: 8.33 },
  { fraction: '11/32"', decimalInches: 0.3438, mm: 8.73 },
  { fraction: '23/64"', decimalInches: 0.3594, mm: 9.13 },
  { fraction: '3/8"', decimalInches: 0.3750, mm: 9.53, note: 'Common structural size' },
  { fraction: '25/64"', decimalInches: 0.3906, mm: 9.92 },
  { fraction: '13/32"', decimalInches: 0.4063, mm: 10.32 },
  { fraction: '27/64"', decimalInches: 0.4219, mm: 10.72 },
  { fraction: '7/16"', decimalInches: 0.4375, mm: 11.11 },
  { fraction: '29/64"', decimalInches: 0.4531, mm: 11.51 },
  { fraction: '15/32"', decimalInches: 0.4688, mm: 11.91, note: 'Practically 12mm' },
  { fraction: '1/2"', decimalInches: 0.5000, mm: 12.70, note: 'Heavy duty standard' },
  { fraction: '17/32"', decimalInches: 0.5313, mm: 13.49 },
  { fraction: '9/16"', decimalInches: 0.5625, mm: 14.29 },
  { fraction: '19/32"', decimalInches: 0.5938, mm: 15.08 },
  { fraction: '5/8"', decimalInches: 0.6250, mm: 15.88, note: 'Common 16mm alternative' },
  { fraction: '11/16"', decimalInches: 0.6875, mm: 17.46 },
  { fraction: '3/4"', decimalInches: 0.7500, mm: 19.05, note: 'Large hardware structural' },
  { fraction: '13/16"', decimalInches: 0.8125, mm: 20.64 },
  { fraction: '7/8"', decimalInches: 0.8750, mm: 22.23 },
  { fraction: '15/16"', decimalInches: 0.9375, mm: 23.81 },
  { fraction: '1"', decimalInches: 1.0000, mm: 25.40, note: '1 inch standard size' }
];

// PVC pipe dimension alignment (Metric ISO vs Imperial standard nominal equivalents in the Philippines)
interface PvcPipeField {
  inches: string;
  metricMm: string;
  internalDiameterApprox: string;
  typicalUse: string;
}

const PVC_PIPE_DATA: PvcPipeField[] = [
  { inches: '1/2"', metricMm: '20 mm', internalDiameterApprox: '15.0 mm', typicalUse: 'Residential water taps & inside lines' },
  { inches: '3/4"', metricMm: '25 mm', internalDiameterApprox: '20.0 mm', typicalUse: 'Main residential branch connections' },
  { inches: '1"', metricMm: '32 mm', internalDiameterApprox: '25.0 mm', typicalUse: 'Primary water manifold & high flow' },
  { inches: '1-1/4"', metricMm: '40 mm', internalDiameterApprox: '32.0 mm', typicalUse: 'Pump discharge / minor sink wastes' },
  { inches: '1-1/2"', metricMm: '50 mm', internalDiameterApprox: '40.0 mm', typicalUse: 'Kitchen sink wash basins & pool plumbing' },
  { inches: '2"', metricMm: '63 mm', internalDiameterApprox: '50.0 mm', typicalUse: 'Major building toilets / vent pipes' },
  { inches: '2-1/2"', metricMm: '75 mm', internalDiameterApprox: '65.0 mm', typicalUse: 'General storm water drainage pipelines' },
  { inches: '3"', metricMm: '90 mm', internalDiameterApprox: '80.0 mm', typicalUse: 'Main sewage ventilation & soil stacks' },
  { inches: '4"', metricMm: '110 mm', internalDiameterApprox: '100.0 mm', typicalUse: 'Underground building main sewer outlet' },
  { inches: '6"', metricMm: '160 mm', internalDiameterApprox: '150.0 mm', typicalUse: 'Civil/Municipal wastewater discharge' },
  { inches: '8"', metricMm: '200 mm', internalDiameterApprox: '200.0 mm', typicalUse: 'Industrial drainage & high-capacity systems' }
];

export default function MetricConverter({ layoutMode = 'scroll' }: { layoutMode?: 'scroll' | 'fit' }) {
  const [currentType, setCurrentType] = useState<ConversionType>('length');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 1500);
  };
  
  // Standard metric values
  const [inputValue, setInputValue] = useState<string>('1');
  const [sourceUnit, setSourceUnit] = useState<string>('');
  const [targetUnit, setTargetUnit] = useState<string>('');
  const [specificResult, setSpecificResult] = useState<string>('0');

  // Bolt/Drill state
  const [drillInput, setDrillInput] = useState<string>('12'); // target 12mm example
  const [drillInputType, setDrillInputType] = useState<'mm' | 'fraction'>('mm');
  const [drillSearchQuery, setDrillSearchQuery] = useState<string>('');

  // PVC pipe state
  const [selectedPvcIndex, setSelectedPvcIndex] = useState<number>(0);

  // Sync default units when standard metric category changes
  useEffect(() => {
    if (currentType !== 'bolt_drill' && currentType !== 'pvc_pipes') {
      const list = MEASUREMENTS[currentType].units;
      setSourceUnit(list[2]?.symbol || list[0].symbol); 
      setTargetUnit(list[4]?.symbol || list[1].symbol); 
    }
  }, [currentType]);

  // Handle calculation for standard physical units
  useEffect(() => {
    if (currentType === 'bolt_drill' || currentType === 'pvc_pipes') return;
    
    const val = parseFloat(inputValue);
    const units = MEASUREMENTS[currentType].units;
    if (!isNaN(val)) {
      const src = units.find((u) => u.symbol === sourceUnit);
      const tgt = units.find((u) => u.symbol === targetUnit);
      if (src && tgt) {
        const valueInBase = val * src.factor;
        const valueInTarget = valueInBase / tgt.factor;
        
        if (valueInTarget === 0) {
          setSpecificResult('0');
        } else if (Math.abs(valueInTarget) < 0.0001) {
          setSpecificResult(valueInTarget.toExponential(4));
        } else {
          setSpecificResult(
            valueInTarget.toLocaleString('en-PH', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 6,
            })
          );
        }
      }
    } else {
      setSpecificResult('0');
    }
  }, [inputValue, sourceUnit, targetUnit, currentType]);

  const handleTypeChange = (type: ConversionType) => {
    setCurrentType(type);
  };

  const getFullListConversions = () => {
    if (currentType === 'bolt_drill' || currentType === 'pvc_pipes') return [];
    
    const val = parseFloat(inputValue);
    if (isNaN(val)) return [];
    const units = MEASUREMENTS[currentType].units;
    const src = units.find((u) => u.symbol === sourceUnit);
    if (!src) return [];

    const valueInBase = val * src.factor;

    return units.map((u) => {
      const resultVal = valueInBase / u.factor;
      let displayRes = '';
      if (resultVal === 0) {
        displayRes = '0';
      } else if (Math.abs(resultVal) < 0.001) {
        displayRes = resultVal.toExponential(3);
      } else {
        displayRes = resultVal.toLocaleString('en-PH', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 4,
        });
      }
      return {
        ...u,
        value: displayRes,
      };
    });
  };

  // Safe helper to find closest matched drill bit size
  const getClosestDrillBits = () => {
    const parsedVal = parseFloat(drillInput);
    if (isNaN(parsedVal) || parsedVal <= 0) return [];

    if (drillInputType === 'mm') {
      // Find drill bits sorted by how close they are to inputted millimeters
      return [...DRILL_BIT_DATA]
        .map(b => ({
          ...b,
          diff: Math.abs(b.mm - parsedVal)
        }))
        .sort((a, b) => a.diff - b.diff)
        .slice(0, 3);
    } else {
      // Input is treated as decimal inches (e.g. 0.5)
      return [...DRILL_BIT_DATA]
        .map(b => ({
          ...b,
          diff: Math.abs(b.decimalInches - parsedVal)
        }))
        .sort((a, b) => a.diff - b.diff)
        .slice(0, 3);
    }
  };

  // Filtered list of drill bits by search query (e.g. "1/2" or "12")
  const filteredDrillBits = DRILL_BIT_DATA.filter(b => {
    const q = drillSearchQuery.toLowerCase();
    if (!q) return true;
    return (
      b.fraction.toLowerCase().includes(q) ||
      b.mm.toString().includes(q) ||
      (b.note && b.note.toLowerCase().includes(q))
    );
  });

  return (
    <div className="bg-white p-4 xs:p-6 rounded-3xl shadow-lg border border-yellow-50">
      
      {/* Category selector */}
      <div className="grid grid-cols-3 gap-1 mb-5 select-none bg-yellow-50/40 p-1 rounded-2xl border border-yellow-101/40">
        {/* Tab 1: Unit Converter */}
        <button
          onClick={() => {
            if (currentType === 'bolt_drill' || currentType === 'pvc_pipes') {
              setCurrentType('length');
            }
          }}
          className={`flex flex-col sm:flex-row items-center justify-center gap-1 font-extrabold transition-all outline-none text-center ${
            layoutMode === 'scroll'
              ? 'py-3.5 rounded-xl text-xs sm:text-xs'
              : 'py-2 rounded-lg text-[9px] xs:text-[10px]'
          } ${
            currentType !== 'bolt_drill' && currentType !== 'pvc_pipes'
              ? 'bg-yellow-400 text-white shadow-sm'
              : 'bg-white hover:bg-yellow-50 text-yellow-905 border border-yellow-101/40'
          }`}
        >
          <RefreshCw size={layoutMode === 'scroll' ? 14 : 12} />
          <span>Units</span>
        </button>

        {/* Tab 2: Bolts & Drills */}
        <button
          onClick={() => setCurrentType('bolt_drill')}
          className={`flex flex-col sm:flex-row items-center justify-center gap-1 font-extrabold transition-all outline-none text-center ${
            layoutMode === 'scroll'
              ? 'py-3.5 rounded-xl text-xs sm:text-xs'
              : 'py-2 rounded-lg text-[9px] xs:text-[10px]'
          } ${
            currentType === 'bolt_drill'
              ? 'bg-yellow-400 text-white shadow-sm'
              : 'bg-white hover:bg-yellow-50 text-yellow-905 border border-yellow-101/40'
          }`}
        >
          <Wrench size={layoutMode === 'scroll' ? 14 : 12} />
          <span>Bolts & Drills</span>
        </button>

        {/* Tab 3: PVC Pipes */}
        <button
          onClick={() => setCurrentType('pvc_pipes')}
          className={`flex flex-col sm:flex-row items-center justify-center gap-1 font-extrabold transition-all outline-none text-center ${
            layoutMode === 'scroll'
              ? 'py-3.5 rounded-xl text-xs sm:text-xs'
              : 'py-2 rounded-lg text-[9px] xs:text-[10px]'
          } ${
            currentType === 'pvc_pipes'
              ? 'bg-yellow-400 text-white shadow-sm'
              : 'bg-white hover:bg-yellow-50 text-yellow-905 border border-yellow-102/40'
          }`}
        >
          <CircleDot size={layoutMode === 'scroll' ? 14 : 12} />
          <span>PVC Pipes</span>
        </button>
      </div>

      {/* Subcategory sub-level selector for Standard Units */}
      {currentType !== 'bolt_drill' && currentType !== 'pvc_pipes' && (
        <div className="grid grid-cols-4 gap-1 mb-5 p-0.5 bg-gray-50 rounded-xl border border-gray-150/50">
          {(Object.keys(MEASUREMENTS) as Array<keyof typeof MEASUREMENTS>).map((type) => {
            const item = MEASUREMENTS[type];
            const IconComponent = item.icon;
            const isActive = currentType === type;
            return (
              <button
                key={type}
                onClick={() => handleTypeChange(type)}
                className={`py-1.5 px-0.5 rounded-lg text-[9px] sm:text-xs font-black transition-all flex flex-col xs:flex-row items-center justify-center gap-1 outline-none ${
                  isActive
                    ? 'bg-white text-yellow-905 shadow-xs border border-yellow-250/60'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <IconComponent size={12} className={isActive ? 'text-yellow-600' : ''} />
                <span>{item.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* RENDER LOGIC BY SELECTION */}

      {/* --- RENDER 1: STANDARD METRIC CONVERSIONS --- */}
      {currentType !== 'bolt_drill' && currentType !== 'pvc_pipes' && (
        <div className="space-y-6">
          {/* Input Panel */}
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 px-1">
                Source Value
              </label>
              <div className="flex gap-1.5 sm:gap-2">
                <input
                  type="number"
                  inputMode="decimal"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Enter value"
                  className="flex-1 min-w-0 bg-yellow-50 border-2 border-transparent focus:border-yellow-400 focus:bg-white rounded-xl p-2.5 sm:p-3 text-base sm:text-lg font-black transition-all outline-none"
                />
                <select
                  value={sourceUnit}
                  onChange={(e) => setSourceUnit(e.target.value)}
                  className="w-24 xs:w-[110px] sm:w-32 shrink-0 bg-gray-50 border-2 border-transparent focus:border-yellow-400 focus:bg-white rounded-xl p-2 px-2.5 sm:p-3 text-xs font-black transition-all outline-none truncate cursor-pointer"
                >
                  {MEASUREMENTS[currentType as keyof typeof MEASUREMENTS].units.map((u) => (
                    <option key={u.symbol} value={u.symbol} className="text-gray-700 font-medium">
                      {u.symbol} ({u.name})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 px-1">
                Target Unit
              </label>
              <select
                value={targetUnit}
                onChange={(e) => setTargetUnit(e.target.value)}
                className="w-full bg-gray-50 border-2 border-transparent focus:border-yellow-400 focus:bg-white rounded-xl p-2.5 sm:p-3 text-xs font-semibold transition-all outline-none cursor-pointer"
              >
                {MEASUREMENTS[currentType as keyof typeof MEASUREMENTS].units.map((u) => (
                  <option key={u.symbol} value={u.symbol}>
                    {u.name} ({u.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Primary Result Card */}
          <div className="p-5 bg-yellow-400 rounded-3xl text-center shadow-lg shadow-yellow-200 relative group overflow-hidden">
            <p className="text-[10px] font-bold text-yellow-905 uppercase tracking-[0.2em] mb-1">
              Converted Value
            </p>
            <div className="flex flex-col items-center gap-1.5">
              <p className="text-3xl font-black text-white tracking-tight break-all">
                {specificResult} <span className="text-xl font-bold opacity-80">{targetUnit}</span>
              </p>
              {specificResult !== '0' && (
                <button
                  onClick={() => handleCopy(specificResult, 'conv')}
                  className="p-1 px-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-[10px] uppercase flex items-center gap-1 transition-all active:scale-95"
                  title="Copy converted value"
                >
                  {copiedKey === 'conv' ? (
                    <>
                      <Check size={11} className="text-white" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={11} className="text-yellow-101" />
                      <span>Copy Result</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Full conversion list */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">
              Full Equivalence Sheet
            </h3>
            <div className="space-y-1.5 max-h-24 xs:max-h-28 overflow-y-auto pr-1">
              {getFullListConversions().map((item) => (
                <div
                  key={item.symbol}
                  className={`flex justify-between items-center px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                    item.symbol === targetUnit
                      ? 'bg-yellow-101 text-yellow-900 border border-yellow-300'
                      : item.symbol === sourceUnit
                      ? 'bg-blue-50 text-blue-950 border border-blue-100'
                      : 'bg-gray-50/70 hover:bg-yellow-50 text-gray-500'
                  }`}
                >
                  <span>{item.name} ({item.symbol})</span>
                  <span className="font-mono text-xs">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- RENDER 2: BOLTS & DRILLS REFERENCE MATCH --- */}
      {currentType === 'bolt_drill' && (
        <div className="space-y-6">
          {/* Quick interactive lookup input */}
          <div className="space-y-3 p-4 bg-yellow-50/50 rounded-2xl border border-yellow-100">
            <h3 className="text-xs font-bold text-yellow-900 uppercase tracking-wider flex items-center gap-1.5">
              <Wrench size={14} /> Close Compatibility Matching
            </h3>
            <p className="text-[11px] text-gray-500 leading-relaxed leading-snug">
              Compare your target drill bit or bolt size instantly. Type a size below to find the closest matches.
            </p>
            <div className="flex gap-2">
              <input
                type="number"
                inputMode="decimal"
                value={drillInput}
                onChange={(e) => setDrillInput(e.target.value)}
                placeholder="Ex. 12 or 0.5"
                className="flex-1 bg-white border-2 border-yellow-200 focus:border-yellow-400 rounded-xl px-3 py-2 text-sm font-black transition-all outline-none"
              />
              <select
                value={drillInputType}
                onChange={(e) => setDrillInputType(e.target.value as 'mm' | 'fraction')}
                className="w-24 bg-white border-2 border-yellow-200 focus:border-yellow-400 rounded-xl px-2 py-2 text-xs font-bold outline-none"
              >
                <option value="mm">mm</option>
                <option value="fraction">inches (dec)</option>
              </select>
            </div>

            {/* Render Matches */}
            <div className="space-y-2 pt-1">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Closest Standard Hardware Equivalents:</p>
              {getClosestDrillBits().map((match, idx) => (
                <div 
                  key={match.fraction}
                  onClick={() => setDrillInput(drillInputType === 'mm' ? match.mm.toString() : match.decimalInches.toString())}
                  className={`p-2.5 rounded-xl flex justify-between items-center text-xs font-bold cursor-pointer transition-all ${
                    idx === 0 
                      ? 'bg-yellow-400 text-white shadow-sm' 
                      : 'bg-white hover:bg-yellow-100 text-gray-700 border border-yellow-100'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-black">{match.fraction}</span>
                    {match.note && <span className={`text-[9px] ${idx === 0 ? 'text-yellow-100' : 'text-gray-400'}`}>{match.note}</span>}
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-sm">{match.mm.toFixed(2)} mm</span>
                    <p className={`text-[8px] uppercase tracking-wider ${idx === 0 ? 'text-yellow-100' : 'text-gray-400'}`}>
                      (~{(match.decimalInches).toFixed(3)} in)
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Complete Chart Search & List */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">Standard Sizes Chart</h3>
              <input
                type="text"
                placeholder="Search bit... e.g. 5/32"
                value={drillSearchQuery}
                onChange={(e) => setDrillSearchQuery(e.target.value)}
                className="bg-gray-50 border border-gray-200 focus:border-yellow-400 rounded-lg px-2 py-1 text-[11px] outline-none max-w-[150px] transition-all"
              />
            </div>

            <div className="grid grid-cols-1 gap-1.5 max-h-24 xs:max-h-28 overflow-y-auto pr-1">
              {filteredDrillBits.map((b) => (
                <div 
                  key={b.fraction}
                  className="flex items-center justify-between px-3 py-2 bg-gray-50/50 hover:bg-yellow-50 rounded-lg text-xs font-bold transition-all border border-gray-100/50"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black text-gray-800">{b.fraction}</span>
                    <span className="text-[10px] text-gray-400 font-normal">{(b.decimalInches).toFixed(3)} in</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {b.note && <span className="bg-yellow-100 text-[9px] text-yellow-905 px-1.5 py-0.5 rounded font-black uppercase text-center scale-90">{b.note}</span>}
                    <span className="font-mono text-gray-600 bg-white border border-gray-100 p-1.5 rounded">{b.mm.toFixed(2)} mm</span>
                  </div>
                </div>
              ))}
              {filteredDrillBits.length === 0 && (
                <p className="text-xs text-center text-gray-400 py-4">No matching sizes found.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- RENDER 3: PVC PIPE NOMINAL SIZES LOOKUP --- */}
      {currentType === 'pvc_pipes' && (
        <div className="space-y-6">
          <div className="p-4 bg-yellow-50/50 rounded-2xl border border-yellow-100 text-xs">
            <h3 className="font-bold text-yellow-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CircleDot size={14} /> Philippine PVC Trade Dimension Lookup
            </h3>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              PVC Pipe trade sizes in the Philippines reference standard nominal imperial values (inches), but map precisely to metric outer diameter (OD) in millimeters.
            </p>
          </div>

          {/* Quick Select Grid */}
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">Select Nominal Trade Size:</span>
            <div className="grid grid-cols-4 gap-1.5">
              {PVC_PIPE_DATA.map((pipe, idx) => (
                <button
                  key={pipe.inches}
                  onClick={() => setSelectedPvcIndex(idx)}
                  className={`py-2 px-1 rounded-xl text-xs font-black transition-all border ${
                    selectedPvcIndex === idx
                      ? 'bg-yellow-400 text-white border-transparent shadow'
                      : 'bg-white hover:bg-yellow-50 text-gray-700 border-gray-100'
                  }`}
                >
                  {pipe.inches}
                </button>
              ))}
            </div>
          </div>

          {/* PVC Pipe Conversion Output Panel */}
          <div className="bg-yellow-400 p-5 rounded-3xl shadow-lg border border-yellow-300 space-y-4 text-white">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black text-yellow-950 uppercase tracking-widest opacity-80">Nominal Pipe Size</p>
                <p className="text-3xl font-black text-white leading-tight">{PVC_PIPE_DATA[selectedPvcIndex].inches}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-yellow-950 uppercase tracking-widest opacity-80">ISO Metric Designation</p>
                <div className="flex items-center justify-end gap-1.5 mt-0.5">
                  <span className="text-3xl font-black text-white">{PVC_PIPE_DATA[selectedPvcIndex].metricMm}</span>
                  <button
                    onClick={() => handleCopy(PVC_PIPE_DATA[selectedPvcIndex].metricMm, 'pvc-metric')}
                    className="p-1 rounded bg-white/20 hover:bg-white/30 text-white border border-white/10 transition-all active:scale-90"
                    title="Copy metric size"
                  >
                    {copiedKey === 'pvc-metric' ? <Check size={11} className="text-white font-extrabold" /> : <Copy size={11} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t border-white/20 pt-3 space-y-3">
              <div className="flex justify-between text-xs items-center">
                <span className="text-yellow-950 font-black uppercase tracking-wide opacity-80">Approx Inside Ø:</span>
                <div className="flex items-center gap-1.5 font-mono font-black text-white">
                  <span>{PVC_PIPE_DATA[selectedPvcIndex].internalDiameterApprox}</span>
                  <button
                    onClick={() => handleCopy(PVC_PIPE_DATA[selectedPvcIndex].internalDiameterApprox, 'pvc-id')}
                    className="p-1 rounded bg-white/20 hover:bg-white/30 text-white transition-all active:scale-90 flex items-center justify-center border border-white/10"
                    title="Copy inside diameter"
                  >
                    {copiedKey === 'pvc-id' ? <Check size={10} className="text-white font-extrabold" /> : <Copy size={10} />}
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-1 text-xs">
                <span className="text-yellow-950 font-black uppercase tracking-wide opacity-80">Typical Philippines Application:</span>
                <span className="p-3 bg-white/15 border border-white/10 rounded-xl text-white font-bold leading-relaxed flex items-start gap-1.5 shadow-sm">
                  <span className="text-white font-black">▪</span>
                  <span>{PVC_PIPE_DATA[selectedPvcIndex].typicalUse}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Full Lookup Quick reference sheet */}
          <div className="p-3 bg-gray-50/50 rounded-xl text-[10px] text-gray-400 font-bold space-y-1 max-h-24 xs:max-h-28 overflow-y-auto pr-1">
            <div className="flex justify-between border-b pb-1 mb-1 font-black text-gray-500 sticky top-0 bg-gray-50/90 py-0.5">
              <span>Nominal (Inches)</span>
              <span>Metric Standard</span>
            </div>
            {PVC_PIPE_DATA.map((pipe, idx) => (
              <div 
                key={pipe.inches} 
                onClick={() => setSelectedPvcIndex(idx)}
                className={`flex justify-between py-1 px-1.5 rounded cursor-pointer transition-colors ${
                  selectedPvcIndex === idx ? 'bg-yellow-100 text-yellow-905 font-black' : 'hover:bg-yellow-50'
                }`}
              >
                <span>{pipe.inches} nominal</span>
                <span>{pipe.metricMm} (OD)</span>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
}
