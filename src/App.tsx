import React, { useState, useEffect, useRef } from 'react';
import { Trees, ReceiptText, Calculator, RefreshCw, Menu, X, ArrowRight, Sun, Moon, Truck, HelpCircle, History, Trash2, Pin, Star, Copy, Check, ChevronLeft, ChevronRight, Zap, Wrench, Banknote } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import VatCalculator from './components/VatCalculator';
import Tax2307Calculator from './components/Tax2307Calculator';
import LumberCalculator from './components/LumberCalculator';
import NormalCalculator from './components/NormalCalculator';
import MetricConverter, { SCREW_LENGTH_DATA, SCREW_WRENCH_DATA } from './components/MetricConverter';
import TruckCubicCalculator from './components/TruckCubicCalculator';
import CashBreakdownCalculator from './components/CashBreakdownCalculator';
import { HistoryItem, HistoryCategory } from './types';

type Category = 'NORMAL_CALC' | 'SALES_INVOICE' | 'LUMBER' | 'CONVERSION' | 'TRUCK_CUBIC' | 'FINANCE';
type SubCategory = 'VAT' | '2307';
type HelpCategory = 'NORMAL_CALC' | 'SALES_INVOICE' | 'LUMBER' | 'WIRE_EQUIV' | 'BOLT_EQUIV' | 'CONVERSION' | 'TRUCK_CUBIC' | 'FINANCE';

export default function App() {
  const [theme, setTheme] = useState<'day' | 'night'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('hwcalc-theme') as 'day' | 'night') || 'day';
    }
    return 'day';
  });
  const [layoutMode, setLayoutMode] = useState<'scroll' | 'fit'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('hwcalc-layout') as 'scroll' | 'fit') || 'scroll';
    }
    return 'scroll';
  });
  const [activeCategory, setActiveCategory] = useState<Category>('NORMAL_CALC');
  const [activeSubCategory, setActiveSubCategory] = useState<SubCategory>('VAT');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<string>('ALL');
  const [selectedHelpCategory, setSelectedHelpCategory] = useState<HelpCategory>('NORMAL_CALC');
  const [helpLengthSearchFilter, setHelpLengthSearchFilter] = useState<string>('');
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // --- HELP PAGE SWIPE & NAVIGATION SYSTEM ---
  const helpTouchStartX = useRef<number | null>(null);
  const helpTouchStartY = useRef<number | null>(null);

  const handleHelpTouchStart = (e: React.TouchEvent) => {
    helpTouchStartX.current = e.targetTouches[0].clientX;
    helpTouchStartY.current = e.targetTouches[0].clientY;
  };

  const handleHelpTouchEnd = (e: React.TouchEvent) => {
    if (helpTouchStartX.current === null || helpTouchStartY.current === null) return;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    
    const diffX = endX - helpTouchStartX.current;
    const diffY = endY - helpTouchStartY.current;

    helpTouchStartX.current = null;
    helpTouchStartY.current = null;

    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY) * 1.3) {
      const HELP_CATEGORIES: HelpCategory[] = ['NORMAL_CALC', 'SALES_INVOICE', 'LUMBER', 'WIRE_EQUIV', 'BOLT_EQUIV', 'CONVERSION', 'TRUCK_CUBIC', 'FINANCE'];
      const currentIndex = HELP_CATEGORIES.indexOf(selectedHelpCategory);
      if (diffX > 0) {
        // Swipe to the right (left to right gesture) -> Previous Category
        const prevIndex = (currentIndex - 1 + HELP_CATEGORIES.length) % HELP_CATEGORIES.length;
        setSelectedHelpCategory(HELP_CATEGORIES[prevIndex]);
      } else {
        // Swipe to the left (right to left gesture) -> Next Category
        const nextIndex = (currentIndex + 1) % HELP_CATEGORIES.length;
        setSelectedHelpCategory(HELP_CATEGORIES[nextIndex]);
      }
    }
  };

  const handleNextHelpCategory = () => {
    const HELP_CATEGORIES: HelpCategory[] = ['NORMAL_CALC', 'SALES_INVOICE', 'LUMBER', 'WIRE_EQUIV', 'BOLT_EQUIV', 'CONVERSION', 'TRUCK_CUBIC', 'FINANCE'];
    const currentIndex = HELP_CATEGORIES.indexOf(selectedHelpCategory);
    const nextIndex = (currentIndex + 1) % HELP_CATEGORIES.length;
    setSelectedHelpCategory(HELP_CATEGORIES[nextIndex]);
  };

  const handlePrevHelpCategory = () => {
    const HELP_CATEGORIES: HelpCategory[] = ['NORMAL_CALC', 'SALES_INVOICE', 'LUMBER', 'WIRE_EQUIV', 'BOLT_EQUIV', 'CONVERSION', 'TRUCK_CUBIC', 'FINANCE'];
    const currentIndex = HELP_CATEGORIES.indexOf(selectedHelpCategory);
    const prevIndex = (currentIndex - 1 + HELP_CATEGORIES.length) % HELP_CATEGORIES.length;
    setSelectedHelpCategory(HELP_CATEGORIES[prevIndex]);
  };

  // --- CALCULATION LOGS HISTORIES SYSTEM ---
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('hwcalc-history-logs');
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  const addHistoryItem = (category: HistoryCategory, calculatorName: string, formula: string, result: string) => {
    const newItem: HistoryItem = {
      id: Math.random().toString(36).substring(2, 9),
      category,
      calculatorName,
      formula,
      result,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      rawTimestamp: Date.now()
    };
    setHistory((prev) => {
      // Avoid raw duplicates triggered in quick succession
      if (prev.length > 0 && prev[0].formula === formula && prev[0].result === result) {
        return prev;
      }
      const updated = [newItem, ...prev].slice(0, 100);
      localStorage.setItem('hwcalc-history-logs', JSON.stringify(updated));
      return updated;
    });
  };

  const togglePinHistoryItem = (id: string) => {
    setHistory((prev) => {
      const updated = prev.map((item) => {
        if (item.id === id) {
          return { ...item, isPinned: !item.isPinned };
        }
        return item;
      });
      localStorage.setItem('hwcalc-history-logs', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteHistoryItem = (id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      localStorage.setItem('hwcalc-history-logs', JSON.stringify(updated));
      return updated;
    });
  };

  const clearHistory = () => {
    setHistory((prev) => {
      // Premium feature: clear preserves pinned calculations by default
      const updated = prev.filter((item) => item.isPinned);
      localStorage.setItem('hwcalc-history-logs', JSON.stringify(updated));
      return updated;
    });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const currentX = e.targetTouches[0].clientX;
    const diffX = currentX - touchStartX;

    // Swiping right from left edge range (< 100px) to slide open drawer
    if (!isSidebarOpen && diffX > 60 && touchStartX < 100) {
      setIsSidebarOpen(true);
      setTouchStartX(null);
    }
    // Swiping left to close drawer
    if (isSidebarOpen && diffX < -60) {
      setIsSidebarOpen(false);
      setTouchStartX(null);
    }
  };

  const handleTouchEnd = () => {
    setTouchStartX(null);
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'day' ? 'night' : 'day';
    setTheme(nextTheme);
    localStorage.setItem('hwcalc-theme', nextTheme);
  };

  return (
    <div 
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`layout-${layoutMode} ${
        layoutMode === 'fit'
          ? 'h-[100dvh] overflow-hidden px-3 py-2 sm:p-4'
          : 'min-h-screen overflow-y-auto overflow-x-hidden px-3 py-4 sm:p-6 md:p-8'
      } w-full transition-colors duration-250 flex flex-col items-center justify-between ${
        theme === 'night' ? 'dark bg-stone-950 text-stone-100' : 'bg-yellow-50 text-gray-800'
      }`}
    >
      {/* Top Bar with floating Menu, Day/Night Mode Switch, and Info/Help Button */}
      <div className="w-full max-w-md flex justify-between items-center mb-2.5 px-1 pt-1 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-yellow-101/30 shadow text-yellow-950 active:scale-95 hover:bg-yellow-50/50 transition-all cursor-pointer relative"
            aria-label="Open sidebar menu"
            title="Open menu"
          >
            <Menu size={18} className="stroke-[2.5]" />
            {/* Subtle heartbeat indicator dot to draw user to the menu */}
            <span className="absolute top-1 right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-400"></span>
            </span>
          </button>

          <button
            onClick={toggleTheme}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-yellow-101/30 shadow text-yellow-950 active:scale-95 hover:bg-yellow-50/50 transition-all cursor-pointer"
            aria-label="Toggle Day/Night mode"
            title={theme === 'day' ? "Switch to Night Mode" : "Switch to Day Mode"}
          >
            {theme === 'day' ? (
              <Moon size={16} className="text-yellow-750 fill-yellow-100" />
            ) : (
              <Sun size={16} className="text-amber-500 fill-amber-300 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => {
              setSelectedHelpCategory(activeCategory);
              setIsHelpOpen(true);
            }}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-yellow-101/30 shadow text-yellow-950 active:scale-95 hover:bg-yellow-50/50 transition-all cursor-pointer relative animate-[bounce_3s_infinite]"
            aria-label="Open reference notes and cheatsheets"
            title="Open informational cheatsheets"
          >
            <HelpCircle size={18} className="stroke-[2.5] text-amber-600 dark:text-amber-505" />
            <span className="absolute top-1 right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
            </span>
          </button>

          <button
            onClick={() => setIsHistoryOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-yellow-101/30 shadow text-yellow-950 active:scale-95 hover:bg-yellow-50/50 transition-all cursor-pointer relative"
            aria-label="Open calculation history logs"
            title="Open calculation logs"
          >
            <History size={18} className="stroke-[2.5] text-amber-750" />
            {history.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-yellow-500 font-sans text-[8px] font-black text-white border border-white leading-none shadow-xs">
                {history.filter(h => h.isPinned).length > 0 ? (
                  <span>★</span>
                ) : (
                  <span>{history.length}</span>
                )}
              </span>
            )}
          </button>
        </div>

        <div className="flex flex-col items-end text-right select-none">
          <h1 className="text-xl font-black text-yellow-950 tracking-tight leading-none">
            HardwareCalc
          </h1>
          <span className="text-[7.5px] font-black tracking-widest text-yellow-904 uppercase bg-yellow-200/60 dark:bg-yellow-950/40 px-1.5 py-0.5 rounded-full mt-1.5 shadow-3xs">
            ABRACADVRH
          </span>
        </div>
      </div>

      {/* Sliding Sidebar Drawer with AnimatePresence */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Dark blur backdrop */}
            <motion.div
              key="sidebar-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-yellow-950/80 backdrop-blur-[1px] z-40 cursor-pointer"
            />

            {/* Side Drawer Container */}
            <motion.div
              key="sidebar-drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 24, stiffness: 210 }}
              className="fixed top-0 left-0 h-full w-[82vw] max-w-[290px] bg-white dark:bg-stone-900 border-r border-yellow-100/50 dark:border-stone-800 z-50 shadow-2xl p-5 flex flex-col justify-between"
            >
              {/* Top Drawer segment */}
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div className="flex flex-col">
                    <span className="text-xl font-black text-yellow-950 dark:text-yellow-400 tracking-tight">Navigation</span>
                    <span className="text-[10px] font-black text-yellow-600/80 dark:text-yellow-600/90 tracking-wider">CHOOSE CALCULATOR</span>
                  </div>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="w-9 h-9 rounded-xl bg-yellow-50 dark:bg-stone-800 flex items-center justify-center text-yellow-950 dark:text-yellow-400 hover:bg-yellow-101 dark:hover:bg-stone-750 active:scale-95 transition-all outline-none"
                    aria-label="Close sidebar menu"
                  >
                    <X size={18} className="stroke-[2.5]" />
                  </button>
                </div>

                {/* Categories List Options */}
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setActiveCategory('NORMAL_CALC');
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-2xl flex items-center gap-3 transition-all text-left outline-none ${
                      activeCategory === 'NORMAL_CALC'
                        ? 'bg-yellow-400 text-white dark:bg-yellow-405 dark:text-stone-900 shadow-md shadow-yellow-300 dark:shadow-yellow-400/20 font-black'
                        : 'text-gray-550 dark:text-stone-200 hover:bg-yellow-50 dark:hover:bg-stone-800 hover:text-yellow-955 dark:hover:text-yellow-400 font-extrabold'
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 ${activeCategory === 'NORMAL_CALC' ? 'bg-white/20 dark:bg-stone-900/60' : 'bg-gray-150 dark:bg-stone-800 border border-gray-200/50 dark:border-stone-750'}`}>
                      <Calculator size={18} className={activeCategory === 'NORMAL_CALC' ? 'text-white dark:text-stone-950' : 'text-gray-700 dark:text-yellow-400'} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs uppercase tracking-wide truncate">Standard Calc</span>
                      <span className={`text-[8.5px] ${activeCategory === 'NORMAL_CALC' ? 'text-yellow-950/80 dark:text-stone-800/80' : 'text-gray-400 dark:text-stone-450'} font-medium mt-0.5`}>Pocket Basic Math Tool</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActiveCategory('SALES_INVOICE');
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-2xl flex items-center gap-3 transition-all text-left outline-none ${
                      activeCategory === 'SALES_INVOICE'
                        ? 'bg-yellow-400 text-white dark:bg-yellow-405 dark:text-stone-900 shadow-md shadow-yellow-300 dark:shadow-yellow-400/20 font-black'
                        : 'text-gray-550 dark:text-stone-200 hover:bg-yellow-50 dark:hover:bg-stone-800 hover:text-yellow-955 dark:hover:text-yellow-400 font-extrabold'
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 ${activeCategory === 'SALES_INVOICE' ? 'bg-white/20 dark:bg-stone-900/60' : 'bg-gray-150 dark:bg-stone-800 border border-gray-200/50 dark:border-stone-750'}`}>
                      <ReceiptText size={18} className={activeCategory === 'SALES_INVOICE' ? 'text-white dark:text-stone-950' : 'text-gray-700 dark:text-yellow-400'} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs uppercase tracking-wide truncate">Receipt Invoice</span>
                      <span className={`text-[8.5px] ${activeCategory === 'SALES_INVOICE' ? 'text-yellow-950/80 dark:text-stone-800/80' : 'text-gray-400 dark:text-stone-450'} font-medium mt-0.5`}>Vat & WHT Form 2307</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActiveCategory('LUMBER');
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-2xl flex items-center gap-3 transition-all text-left outline-none ${
                      activeCategory === 'LUMBER'
                        ? 'bg-yellow-400 text-white dark:bg-yellow-405 dark:text-stone-900 shadow-md shadow-yellow-300 dark:shadow-yellow-400/20 font-black'
                        : 'text-gray-550 dark:text-stone-200 hover:bg-yellow-50 dark:hover:bg-stone-800 hover:text-yellow-955 dark:hover:text-yellow-400 font-extrabold'
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 ${activeCategory === 'LUMBER' ? 'bg-white/20 dark:bg-stone-900/60' : 'bg-gray-150 dark:bg-stone-800 border border-gray-200/50 dark:border-stone-750'}`}>
                      <Trees size={18} className={activeCategory === 'LUMBER' ? 'text-white dark:text-stone-950' : 'text-gray-700 dark:text-yellow-400'} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs uppercase tracking-wide truncate">Lumber Dimensions</span>
                      <span className={`text-[8.5px] ${activeCategory === 'LUMBER' ? 'text-yellow-950/80 dark:text-stone-800/80' : 'text-gray-400 dark:text-stone-450'} font-medium mt-0.5`}>Board Feet Price Estimate</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActiveCategory('CONVERSION');
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-2xl flex items-center gap-3 transition-all text-left outline-none ${
                      activeCategory === 'CONVERSION'
                        ? 'bg-yellow-405 text-white dark:bg-yellow-405 dark:text-stone-900 shadow-md shadow-yellow-300 dark:shadow-yellow-400/20 font-black'
                        : 'text-gray-550 dark:text-stone-200 hover:bg-yellow-50 dark:hover:bg-stone-800 hover:text-yellow-955 dark:hover:text-yellow-400 font-extrabold'
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 ${activeCategory === 'CONVERSION' ? 'bg-white/20 dark:bg-stone-900/60' : 'bg-gray-150 dark:bg-stone-800 border border-gray-200/50 dark:border-stone-750'}`}>
                      <RefreshCw size={18} className={activeCategory === 'CONVERSION' ? 'text-white dark:text-stone-950' : 'text-gray-700 dark:text-yellow-400'} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs uppercase tracking-wide truncate">Metric Conversion</span>
                      <span className={`text-[8.5px] ${activeCategory === 'CONVERSION' ? 'text-yellow-950/80 dark:text-stone-800/80' : 'text-gray-400 dark:text-stone-450'} font-medium mt-0.5`}>PVC pipe trade sizes & bits</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActiveCategory('TRUCK_CUBIC');
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-2xl flex items-center gap-3 transition-all text-left outline-none ${
                      activeCategory === 'TRUCK_CUBIC'
                        ? 'bg-yellow-400 text-white dark:bg-yellow-405 dark:text-stone-900 shadow-md shadow-yellow-300 dark:shadow-yellow-400/20 font-black'
                        : 'text-gray-550 dark:text-stone-200 hover:bg-yellow-50 dark:hover:bg-stone-800 hover:text-yellow-955 dark:hover:text-yellow-400 font-extrabold'
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 ${activeCategory === 'TRUCK_CUBIC' ? 'bg-white/20 dark:bg-stone-900/60' : 'bg-gray-150 dark:bg-stone-800 border border-gray-200/50 dark:border-stone-750'}`}>
                      <Truck size={18} className={activeCategory === 'TRUCK_CUBIC' ? 'text-white dark:text-stone-950' : 'text-gray-700 dark:text-yellow-400'} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs uppercase tracking-wide truncate">Truck & Aggregate</span>
                      <span className={`text-[8.5px] ${activeCategory === 'TRUCK_CUBIC' ? 'text-yellow-950/80 dark:text-stone-800/80' : 'text-gray-400 dark:text-stone-450'} font-medium mt-0.5`}>Cubic meter & Sand/Gravel prices</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActiveCategory('FINANCE');
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-2xl flex items-center gap-3 transition-all text-left outline-none ${
                      activeCategory === 'FINANCE'
                        ? 'bg-yellow-400 text-white dark:bg-yellow-405 dark:text-stone-900 shadow-md shadow-yellow-300 dark:shadow-yellow-400/20 font-black'
                        : 'text-gray-550 dark:text-stone-200 hover:bg-yellow-50 dark:hover:bg-stone-800 hover:text-yellow-955 dark:hover:text-yellow-400 font-extrabold'
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 ${activeCategory === 'FINANCE' ? 'bg-white/20 dark:bg-stone-900/60' : 'bg-gray-150 dark:bg-stone-800 border border-gray-200/50 dark:border-stone-750'}`}>
                      <Banknote size={18} className={activeCategory === 'FINANCE' ? 'text-white dark:text-stone-950' : 'text-gray-700 dark:text-yellow-400'} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs uppercase tracking-wide truncate">Finance & Cash</span>
                      <span className={`text-[8.5px] ${activeCategory === 'FINANCE' ? 'text-yellow-950/80 dark:text-stone-800/80' : 'text-gray-400 dark:text-stone-450'} font-medium mt-0.5`}>Cash breakdown & PHP peso bills</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Bottom Drawer segment */}
              <div className="space-y-4">
                {/* Mode Settings section */}
                <div className="p-3 bg-yellow-50 dark:bg-stone-850 rounded-2xl border border-yellow-101/40 dark:border-stone-800/60 flex flex-col gap-1.5 select-none animate-[fadeIn_0.5s_ease-out]">
                  <span className="text-[9px] font-black text-yellow-955 dark:text-yellow-450 uppercase tracking-widest block">
                    Screen Layout
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const nextMode = layoutMode === 'scroll' ? 'fit' : 'scroll';
                      setLayoutMode(nextMode);
                      localStorage.setItem('hwcalc-layout', nextMode);
                    }}
                    className="w-full flex items-center justify-between h-12 px-4 rounded-xl bg-white dark:bg-stone-900 border-2 border-yellow-250 hover:border-yellow-405 transition-all outline-none group cursor-pointer"
                  >
                    <div className="flex flex-col text-left">
                      <span className="text-[11px] font-black text-gray-850 dark:text-stone-100 uppercase tracking-wide">
                        {layoutMode === 'scroll' ? 'Spacious Mode' : 'Compact Mode'}
                      </span>
                      <span className="text-[8px] font-bold text-gray-400 dark:text-stone-500 uppercase tracking-widest">
                        {layoutMode === 'scroll' ? 'Large Spacing & Text' : 'Fits Screen Perfectly'}
                      </span>
                    </div>
                    {/* Compact layout switch widget using yellow theme */}
                    <div className="w-13 h-7 bg-gray-100 dark:bg-stone-800 rounded-full p-1 relative transition-colors duration-350 border border-gray-200 dark:border-stone-750 flex items-center">
                      <div className={`w-5 h-5 rounded-full bg-yellow-400 dark:bg-yellow-405 shadow-md transform transition-all duration-350 flex items-center justify-center text-[7px] text-yellow-950 dark:text-stone-900 font-extrabold ${
                        layoutMode === 'fit' ? 'translate-x-6' : 'translate-x-0'
                      }`}>
                        {layoutMode === 'fit' ? 'FIT' : 'SCL'}
                      </div>
                    </div>
                  </button>
                </div>

                <div className="p-3 bg-yellow-50 dark:bg-stone-850 rounded-2xl border border-yellow-101/40 dark:border-stone-800/60 text-center select-none">
                  <p className="text-[11px] font-black uppercase tracking-wider text-yellow-950 dark:text-yellow-400">HardwareCalc</p>
                  <span className="text-[8.5px] font-black text-yellow-750 dark:text-yellow-600 block mt-0.5">BY: ABRACADVRH</span>
                </div>
                
                <div className="flex items-center gap-1.5 justify-center text-[9px] font-bold text-yellow-800 dark:text-stone-300 bg-yellow-101/40 dark:bg-stone-850/40 py-1.5 px-2 rounded-xl border border-dashed border-yellow-250 dark:border-stone-750">
                  <span>💡</span> Swipe left or tap backdrop to close
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Informational Guides & Cheatsheets Overlay Modal */}
      <AnimatePresence>
        {isHelpOpen && (
          <>
            {/* Soft blur backdrop */}
            <motion.div
              key="help-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsHelpOpen(false)}
              className="fixed inset-0 bg-yellow-950/70 backdrop-blur-[2px] z-50 cursor-pointer"
            />

            {/* Dialog Panel */}
            <motion.div
              key="help-dialog"
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              onTouchStart={handleHelpTouchStart}
              onTouchEnd={handleHelpTouchEnd}
              className="fixed inset-x-4 top-[8dvh] bottom-[8dvh] md:top-[12dvh] md:bottom-[12dvh] max-w-md mx-auto bg-white dark:bg-stone-900 border border-yellow-101/40 dark:border-stone-800 rounded-3xl shadow-2xl z-50 flex flex-col p-5 overflow-hidden text-gray-800 dark:text-stone-100 select-none md:select-text"
            >
              {/* Header */}
              <div className="flex justify-between items-center pb-2.5 border-b border-gray-100 dark:border-stone-800 mb-3 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-yellow-405 text-white font-extrabold flex items-center justify-center">
                    <HelpCircle size={15} />
                  </span>
                  <div>
                    <h3 className="text-sm font-black text-yellow-950 dark:text-yellow-400 uppercase tracking-wider leading-none">
                      Reference Guide & Sheets
                    </h3>
                    <span className="text-[8.5px] font-bold text-gray-400 uppercase tracking-widest mt-1 block">
                      Tap any category to view formulas
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsHelpOpen(false)}
                  className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-stone-850 flex items-center justify-center text-gray-450 hover:bg-gray-100 dark:hover:bg-stone-800 active:scale-95 transition-all outline-none"
                  aria-label="Close help guide"
                >
                  <X size={15} className="stroke-[2.5]" />
                </button>
              </div>

              {/* Slider / Horizontal Quick sheet category selector */}
              <div className="flex gap-1.5 overflow-x-auto pb-1.5 mb-2 border-b border-gray-100 dark:border-stone-800 shrink-0 scrollbar-none">
                {[
                  { id: 'NORMAL_CALC', icon: Calculator, label: 'Calculator' },
                  { id: 'SALES_INVOICE', icon: ReceiptText, label: 'Receipt/VAT' },
                  { id: 'LUMBER', icon: Trees, label: 'Lumber' },
                  { id: 'WIRE_EQUIV', icon: Zap, label: 'Wire Specs' },
                  { id: 'BOLT_EQUIV', icon: Wrench, label: 'Bolt Specs' },
                  { id: 'CONVERSION', icon: RefreshCw, label: 'PVC Specs' },
                  { id: 'TRUCK_CUBIC', icon: Truck, label: 'Truck Specs' },
                  { id: 'FINANCE', icon: Banknote, label: 'Cash Specs' }
                ].map((item) => {
                  const Icon = item.icon;
                  const isCur = selectedHelpCategory === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedHelpCategory(item.id as HelpCategory)}
                      className={`px-2.5 py-1.5 rounded-xl text-center flex flex-col items-center justify-center min-w-[72px] gap-0.5 transition-all cursor-pointer outline-none ${
                        isCur
                          ? 'bg-yellow-400 text-white shadow-sm font-black'
                          : 'text-gray-450 dark:text-stone-450 hover:bg-gray-50 dark:hover:bg-stone-850 font-bold'
                      }`}
                    >
                      <Icon size={13} className={isCur ? 'text-white' : 'text-gray-450 dark:text-stone-450'} />
                      <span className="text-[8.5px] uppercase tracking-wider whitespace-nowrap leading-none mt-0.5">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Swipe/Paging Indicator Header */}
              <div className="flex items-center justify-center px-1 pb-2 mb-3 border-b border-gray-100 dark:border-stone-800 text-[10px] text-gray-450 dark:text-stone-500 font-bold tracking-wider shrink-0 select-none">
                <div className="flex items-center gap-2 py-0.5">
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((idx) => {
                    const HELP_CATEGORIES: HelpCategory[] = ['NORMAL_CALC', 'SALES_INVOICE', 'LUMBER', 'WIRE_EQUIV', 'BOLT_EQUIV', 'CONVERSION', 'TRUCK_CUBIC', 'FINANCE'];
                    const isActive = HELP_CATEGORIES[idx] === selectedHelpCategory;
                    return (
                      <button 
                        key={idx} 
                        type="button"
                        onClick={() => setSelectedHelpCategory(HELP_CATEGORIES[idx])}
                        className={`transition-all duration-300 rounded-full outline-none ${
                          isActive 
                            ? 'bg-yellow-500 dark:bg-yellow-400 w-3.5 h-1.5' 
                            : 'bg-gray-200 dark:bg-stone-800 hover:bg-gray-300 dark:hover:bg-stone-700 w-1.5 h-1.5'
                        }`}
                        aria-label={`Go to guide page ${idx + 1}`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Dynamic scrollable body of sheets */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
                {selectedHelpCategory === 'NORMAL_CALC' && (
                  <div className="space-y-4">
                    <div className="bg-yellow-50/40 dark:bg-stone-950/20 p-3 rounded-2xl border border-yellow-101/20 dark:border-stone-850">
                      <span className="text-[8.5px] font-black text-yellow-800 dark:text-yellow-500 uppercase tracking-widest block mb-1">STANDARD MATH COMMANDS</span>
                      <h4 className="text-xs font-black text-gray-850 dark:text-stone-200">Pocket Calculator Keys Guide</h4>
                      <p className="text-[10px] text-gray-450 dark:text-stone-400 mt-1">
                        Use standard arithmetic equations on our pocket ledger. Supports full BEDMAS rules evaluation order.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[9px] font-black text-gray-450 dark:text-stone-500 uppercase tracking-wider block px-1">Calculative Memory Registers</span>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-gray-50 dark:bg-stone-950 p-2 rounded-xl border border-gray-150/45 dark:border-stone-850 text-left">
                          <span className="text-[9px] font-extrabold text-yellow-750 dark:text-yellow-400 block">MS (Memory Store)</span>
                          <p className="text-[8.5px] text-gray-400 dark:text-stone-450 mt-0.5 leading-tight">Saves display digits as the active calculator memory reference.</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-stone-950 p-2 rounded-xl border border-gray-150/45 dark:border-stone-850 text-left">
                          <span className="text-[9px] font-extrabold text-yellow-750 dark:text-yellow-400 block">MR (Memory Recall)</span>
                          <p className="text-[8.5px] text-gray-400 dark:text-stone-450 mt-0.5 leading-tight">Prints saved register value back onto the display screen.</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-stone-950 p-2 rounded-xl border border-gray-150/45 dark:border-stone-850 text-left">
                          <span className="text-[9px] font-extrabold text-yellow-750 dark:text-yellow-400 block">M+ (Add to Memory)</span>
                          <p className="text-[8.5px] text-gray-400 dark:text-stone-450 mt-0.5 leading-tight">Adds the current display value directly to the memory record.</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-stone-950 p-2 rounded-xl border border-gray-150/45 dark:border-stone-850 text-left">
                          <span className="text-[9px] font-extrabold text-yellow-750 dark:text-yellow-400 block">MC (Memory Clear)</span>
                          <p className="text-[8.5px] text-gray-400 dark:text-stone-450 mt-0.5 leading-tight">Resets working internal store memory back to clear zero.</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5 bg-gray-50 dark:bg-stone-950 p-2.5 rounded-xl border border-gray-150/50 dark:border-stone-850">
                      <span className="text-[9px] font-black text-gray-405 dark:text-stone-500 uppercase tracking-wider block">Markup & Discount Shortcuts</span>
                      <div className="space-y-1.5 font-mono text-[9px] text-gray-550 dark:text-stone-400 font-bold">
                        <p className="flex justify-between border-b border-gray-100/50 dark:border-stone-800 pb-1">
                          <span>12% Sales tax markup:</span>
                          <span className="text-gray-800 dark:text-stone-200">120 + 12% = 134.40</span>
                        </p>
                        <p className="flex justify-between">
                          <span>15% Discount markdown:</span>
                          <span className="text-gray-800 dark:text-stone-200">500 - 15% = 425.00</span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedHelpCategory === 'SALES_INVOICE' && (
                  <div className="space-y-4">
                    <div className="bg-yellow-50/40 dark:bg-stone-950/20 p-3 rounded-2xl border border-yellow-101/20 dark:border-stone-850">
                      <span className="text-[8.5px] font-black text-yellow-800 dark:text-yellow-500 uppercase tracking-widest block mb-1">TAX REFERENCE (BIR SYSTEM)</span>
                      <h4 className="text-xs font-black text-gray-850 dark:text-stone-200">PH Sales Invoices VAT Guidelines</h4>
                      <p className="text-[10px] text-gray-450 dark:text-stone-400 mt-1">
                        In Philippine trade, sales totals shown on official receipts must incorporate 12% output Value Added Tax.
                      </p>
                    </div>

                    <div className="space-y-2 bg-gray-50 dark:bg-stone-950 p-3 rounded-xl border border-gray-150/50 dark:border-stone-850 font-bold text-[10px]">
                      <span className="text-[9px] font-black text-gray-405 uppercase tracking-wider block mb-1">Standard VAT Formulation</span>
                      <p className="flex justify-between border-b border-gray-100 dark:border-stone-800 pb-1.5 text-gray-600 dark:text-stone-300">
                        <span>Net Vatable Sales Amount:</span>
                        <span className="font-mono text-yellow-750 dark:text-yellow-400">Total Price ÷ 1.12</span>
                      </p>
                      <p className="flex justify-between pt-1 text-gray-600 dark:text-stone-300">
                        <span>Output VAT share:</span>
                        <span className="font-mono text-yellow-750 dark:text-yellow-400">Net Vatable × 12%</span>
                      </p>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[9px] font-black text-gray-450 dark:text-stone-505 uppercase tracking-wider block px-1">Creditable Withholding Taxes (Form 2307)</span>
                      <div className="bg-gray-50 dark:bg-stone-950 rounded-xl border border-gray-150/50 dark:border-stone-850 overflow-hidden text-[9px] p-2.5 space-y-2">
                        <div>
                          <strong className="text-red-650 dark:text-red-400 block font-bold uppercase tracking-wide">1% Tax Rate (Invoiced Goods)</strong>
                          <p className="text-gray-450 dark:text-stone-500 leading-tight mt-0.5">Applied upon purchase of hardware tools, steel beams, sand/cement bags, and timber assets from top withholding merchants.</p>
                        </div>
                        <div className="border-t border-gray-150/40 dark:border-stone-800 pt-2">
                          <strong className="text-red-650 dark:text-red-400 block font-bold uppercase tracking-wide">2% Tax Rate (Invoiced Services)</strong>
                          <p className="text-gray-450 dark:text-stone-505 leading-tight mt-0.5">Applied on contract scaffolding labor, concrete mixer hiring, cargo truck delivery logistics, and general installations.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedHelpCategory === 'LUMBER' && (
                  <div className="space-y-4">
                    <div className="bg-yellow-50/40 dark:bg-stone-950/20 p-3 rounded-2xl border border-yellow-101/20 dark:border-stone-850">
                      <span className="text-[8.5px] font-black text-yellow-800 dark:text-yellow-500 uppercase tracking-widest block mb-1">WOOD MEASUREMENT CHEATS</span>
                      <h4 className="text-xs font-black text-gray-850 dark:text-stone-200">Timber Board Foot Calculation Specs</h4>
                      <p className="text-[10px] text-gray-450 dark:text-stone-400 mt-1">
                        Board Foot (BF) represents the volume equivalence of a wood piece 12 inches square and 1 inch thick.
                      </p>
                    </div>

                    <div className="bg-gray-50 dark:bg-stone-950 p-2.5 rounded-xl border border-gray-150/40 dark:border-stone-850 space-y-1.5 text-center">
                      <span className="text-[8px] font-black text-gray-400 block uppercase">Board Foot Formula</span>
                      <code className="text-[13px] font-mono font-black text-yellow-750 dark:text-yellow-405 block">BF = (Thick" × Width" × Length') ÷ 12</code>
                      <p className="text-[8px] text-gray-400 dark:text-stone-500 uppercase font-bold leading-none mt-1">Note: Length must be in FEET (ft)</p>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[9px] font-black text-gray-450 dark:text-stone-500 uppercase tracking-wider block px-1">Common Standard PH Wood Sizes BF Equivalents</span>
                      <div className="bg-gray-50 dark:bg-stone-950 rounded-xl border border-gray-150/40 dark:border-stone-850 overflow-hidden text-[9px]">
                        {[
                          { sz: '2" x 2" x 12 ft', bf: '4.0 Board Feet', details: 'Standard support purlins & spacing studs' },
                          { sz: '2" x 3" x 12 ft', bf: '6.0 Board Feet', details: 'Truss bracing / wood scaffolding poles' },
                          { sz: '2" x 4" x 12 ft', bf: '8.0 Board Feet', details: 'Heavy load wall headers & roof studs' },
                          { sz: '2" x 6" x 12 ft', bf: '12.0 Board Feet', details: 'Structural joist joists / support pillars' }
                        ].map((timber) => (
                          <div key={timber.sz} className="flex justify-between items-center p-2.5 border-b border-gray-150/30 dark:border-stone-800/60 last:border-none">
                            <div>
                              <span className="font-extrabold text-gray-850 dark:text-stone-200 block">{timber.sz}</span>
                              <span className="text-[7.5px] text-gray-450 dark:text-stone-500 block leading-none">{timber.details}</span>
                            </div>
                            <span className="font-mono font-black text-xs text-yellow-750 dark:text-yellow-400">{timber.bf}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {selectedHelpCategory === 'WIRE_EQUIV' && (
                  <div className="space-y-4 animate-[fadeIn_0.15s_ease-out]">
                    <div className="p-3 bg-yellow-50/40 dark:bg-stone-950/20 rounded-xl border border-yellow-101/30 dark:border-stone-850/60 text-[11px] leading-snug flex items-center gap-2.5">
                      <span className="p-1.5 rounded-lg bg-yellow-405 text-white flex items-center justify-center shrink-0">
                        <Zap size={12} className="fill-white/10" />
                      </span>
                      <p className="text-gray-500 dark:text-stone-400 font-medium">
                        Interactive Wire Converter. Please open the standard Reference Guide &amp; Sheets (Help Menu) for the safe copper wire AWG to mm² master specifications chart.
                      </p>
                    </div>

                    {/* Wire Sizes Specs (AWG vs Metric) Cheat Card */}
                    <div className="bg-amber-50/40 dark:bg-stone-950/25 p-3 rounded-2xl border border-amber-200/40 dark:border-stone-850/60">
                      <span className="text-[8.5px] font-black text-amber-700 dark:text-yellow-405 uppercase tracking-widest block mb-1">🇵🇭 COPPER WIRE SIZES & APPLICATIONS</span>
                      <h4 className="text-xs font-black text-gray-850 dark:text-stone-200">AWG Sizing to Local mm² & Safe Breakers</h4>
                      <p className="text-[10px] text-gray-450 dark:text-stone-400 mt-1">
                        Standard cooper wire gauges with safe current ratings (ampacity) and matching breakers under PEC (Philippine Electrical Code) rules.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[9px] font-black text-gray-450 dark:text-stone-550 uppercase tracking-wider block px-1">Standard Wire Gauge (AWG) to Metric (mm²) Table</span>
                      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-yellow-101/60 dark:border-stone-850 p-2.5 space-y-1.5 select-none text-[10px]">
                        <div className="grid grid-cols-4 gap-1 pb-1.5 border-b border-gray-100 dark:border-stone-800 text-[8.5px] font-black text-gray-400 dark:text-stone-500 uppercase tracking-widest">
                          <span>AWG Size</span>
                          <span className="text-center">Local Metric</span>
                          <span className="text-center">Amp / Breaker</span>
                          <span className="text-right">Standard App</span>
                        </div>
                        {[
                          { awg: '#18 AWG', metric: '0.75 mm²', amp: '7A (SPT)', app: 'Flatcord / Speaker wire' },
                          { awg: '#16 AWG', metric: '1.25 mm²', amp: '10A (SPT)', app: 'Extension cord / Heavy flatcord' },
                          { awg: '#14 AWG', metric: '2.0 mm²', amp: '15A / 15A', app: 'Lighting circuits' },
                          { awg: '#12 AWG', metric: '3.5 mm²', amp: '20A / 20A', app: 'Standard plugs/outlets' },
                          { awg: '#10 AWG', metric: '5.5 mm²', amp: '30A / 30A', app: 'Water pumps / 1.5HP AC' },
                          { awg: '#8 AWG', metric: '8.0 mm²', amp: '40A / 40A', app: 'Water heater / ovens' },
                          { awg: '#6 AWG', metric: '14.0 mm²', amp: '55A / 50A', app: 'Panels & main lines' },
                          { awg: '#4 AWG', metric: '22.0 mm²', amp: '70A / 70A', app: 'Sub-panel feed lines' },
                          { awg: '#2 AWG', metric: '30.0 mm²', amp: '95A / 100A', app: 'Main services (large)' }
                        ].map((wire) => (
                          <div key={wire.awg} className="grid grid-cols-4 gap-1 items-center py-1.5 border-b border-gray-100/50 dark:border-stone-800/40 last:border-none hover:bg-yellow-50/20 dark:hover:bg-stone-850/20 px-1 rounded-lg transition-all">
                            <span className="font-extrabold text-gray-850 dark:text-stone-200">{wire.awg}</span>
                            <span className="font-mono font-black text-amber-700 dark:text-amber-400 text-center bg-amber-50/40 dark:bg-stone-950 px-1.5 py-0.5 rounded border border-amber-200/20 dark:border-stone-800/60 text-[9px]">{wire.metric}</span>
                            <span className="font-mono font-extrabold text-gray-650 dark:text-stone-300 text-center text-[9px]">{wire.amp}</span>
                            <span className="text-[9.5px] text-gray-450 dark:text-stone-455 font-medium text-right leading-tight">{wire.app}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* WIRE DICTIONARY SPECIFICATION CARDS */}
                    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-yellow-101/60 dark:border-stone-850 p-3 space-y-2.5">
                      <span className="text-[9px] font-black text-gray-450 dark:text-stone-550 uppercase tracking-wider block">🇵🇭 Local Philippine Wire Types &amp; Rules</span>
                      <div className="space-y-2 text-[9.5px]">
                        <div className="border-b border-gray-105 dark:border-stone-800 pb-2">
                          <strong className="text-gray-850 dark:text-stone-200 block uppercase tracking-wide">1. Stranded Core (THHN / THWN-2):</strong>
                          <p className="text-gray-500 dark:text-stone-400 mt-0.5 leading-relaxed">
                            Formed of multiple fine copper strands inside clear protective nylon sheath. Standard code requirement for modern home conduits (easily pulled through pipe elbow bends without binding).
                          </p>
                        </div>
                        <div className="border-b border-gray-105 dark:border-stone-800 pb-2">
                          <strong className="text-gray-850 dark:text-stone-200 block uppercase tracking-wide">2. Solid Core (TW / THW):</strong>
                          <p className="text-gray-500 dark:text-stone-400 mt-0.5 leading-relaxed">
                            Single thick continuous solid copper rod. Hard to bend. Strictly restricted under modern code inside building wall piping due to pulling friction. Mostly for static grounding wire hooks or overhead aerial drops.
                          </p>
                        </div>
                        <div className="border-b border-gray-105 dark:border-stone-800 pb-2">
                          <strong className="text-gray-850 dark:text-stone-200 block uppercase tracking-wide">3. PDX Cable (Non-Metallic Sheathed / NMS):</strong>
                          <p className="text-gray-500 dark:text-stone-400 mt-0.5 leading-relaxed">
                            2 parallel solid insulated core lines bundled inside a plain white outer PVC sheath. Staples flatly onto visible timber walls without conduit wraps. 
                            <span className="text-rose-500 font-extrabold block mt-0.5 bg-rose-500/5 px-1 py-0.5 rounded border border-rose-500/10">🚨 Code Restriction: Never encase or embed PDX below solid concrete walls as humidity destroys the sheathing over time.</span>
                          </p>
                        </div>
                        <div className="border-b border-gray-105 dark:border-stone-800 pb-2">
                          <strong className="text-gray-850 dark:text-stone-200 block uppercase tracking-wide">4. Flat Cord (Type SPT Duplex Cord):</strong>
                          <p className="text-gray-550 dark:text-stone-400 mt-0.5 leading-relaxed">
                            Stranded copper conductors wrapped parallel in ribbed flexible insulation. 
                            <strong>#18 flatcord (0.75 mm²)</strong> handles up to 7A for LED lamps and light appliances; 
                            <strong>#16 flatcord (1.25 mm²)</strong> is standard for household extension power strips, drop-lights, and fans.
                            <span className="text-amber-700 dark:text-yellow-500 font-bold block mt-0.5">⚠️ Caution: Only for portable external plugs. Never route inside walls or ceilings.</span>
                          </p>
                        </div>
                        <div className="border-b border-gray-105 dark:border-stone-800 pb-2">
                          <strong className="text-gray-850 dark:text-stone-200 block uppercase tracking-wide">5. Speaker Cable (Audio Zip):</strong>
                          <p className="text-gray-550 dark:text-stone-400 mt-0.5 leading-relaxed">
                            Parallel stranded cords (often color or stripe indicator of gold/silver polarity), engineered strictly for low-impedance audio links. Never utilize for standard 220V household outlets.
                          </p>
                        </div>
                        <div>
                          <strong className="text-gray-850 dark:text-stone-200 block uppercase tracking-wide">6. Welding Lead Cable:</strong>
                          <p className="text-gray-550 dark:text-stone-400 mt-0.5 leading-relaxed">
                            Heavy single conductor made of hundreds of microscopically dynamic fine hair filaments inside thick elastic synthetic rubber casing. Best for extremely high welding amp feeds and dynamic DC solar backup battery cell trunks.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50/25 dark:bg-stone-950/30 p-2.5 rounded-xl border border-yellow-101/40 dark:border-stone-850/60 text-[9px] text-gray-500 dark:text-stone-400 leading-relaxed">
                      <span className="font-extrabold text-amber-800 dark:text-yellow-505 uppercase block mb-0.5">⚠️ WIRE SAFETY DISCLAIMER:</span>
                      Never undersize wires below regional electrical codes. Typical outlets in the Philippines must always be integrated with at least 3.5 mm² wire paired with a 20A branch breaker protecting them to resist local overheating failures.
                    </div>
                  </div>
                )}

                {selectedHelpCategory === 'BOLT_EQUIV' && (
                  <div className="space-y-4 animate-[fadeIn_0.15s_ease-out]">
                    <div className="bg-yellow-50/40 dark:bg-stone-950/20 p-3 rounded-2xl border border-yellow-101/20 dark:border-stone-850">
                      <span className="text-[8.5px] font-black text-yellow-800 dark:text-yellow-505 uppercase tracking-widest block mb-1">📐 FASTENERS & BOLT SPECIFICATIONS</span>
                      <h4 className="text-xs font-black text-gray-850 dark:text-stone-200">Screw thread sizes, wrenches, & local trade lengths</h4>
                    </div>

                    {/* Disclaimers instead of instructions inside tools */}
                    <div className="bg-amber-50/25 dark:bg-stone-950/20 p-2.5 rounded-xl border border-amber-200/20 dark:border-stone-850/80 text-[9px] space-y-1.5 text-gray-600 dark:text-stone-400">
                      <p className="leading-snug">
                        <strong className="text-amber-850 dark:text-yellow-505">⚠️ WRENCH & TOOLING ACCURACY RATE:</strong> Standard hex/bolt pairings assume uniform manufacturing specs (JIS / DIN / ANSI). Be aware that cheaper local construction materials and hardware fasteners in the PH market can occasionally deviate from exact socket profiles by up to ±0.5 mm due to fabrication tolerances. Always keep a standard adjustable wrench nearby.
                      </p>
                      <p className="leading-snug">
                        <strong className="text-amber-850 dark:text-yellow-505">⚠️ COMMERCIAL BOX LABELS:</strong> Screw wood box labels (like 2-1/4" drywalls) sold in high volumes in municipal suppliers represent rounded local trade numbers. Real thread dimensions typically align with global standardized metric layouts.
                      </p>
                      <p className="leading-snug">
                        <strong className="text-amber-850 dark:text-yellow-505">⚠️ WALL PLUGS ACCURACY:</strong> For hollow blocks (CHB), drilling too aggressively will make the wall hole oversized, making the Tox anchor fail. Always drill with standard non-hammer rotation first when using soft masonry walls.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[9px] font-black text-gray-450 dark:text-stone-550 uppercase tracking-wider block px-1">Screw Sizes vs Wrench Sizing Reference Sheet</span>
                      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-yellow-101/60 dark:border-stone-850 p-2.5 space-y-1.5 select-none text-[10px]">
                        <div className="grid grid-cols-3 gap-2 pb-1.5 border-b border-gray-100 dark:border-stone-800 text-[8.5px] font-black text-gray-400 dark:text-stone-500 uppercase tracking-widest">
                          <span>Screw Spec</span>
                          <span className="text-center">🔧 Combo/Open</span>
                          <span className="text-right">🔩 Allen Hex</span>
                        </div>
                        {[
                          { name: 'M3 (Metric)', wrench: '5.5 mm', allen: '2.5 mm' },
                          { name: 'M4 (Metric)', wrench: '7.0 mm', allen: '3.0 mm' },
                          { name: 'M5 (Metric)', wrench: '8.0 mm', allen: '4.0 mm' },
                          { name: 'M6 (Metric)', wrench: '10.0 mm', allen: '5.0 mm' },
                          { name: 'M8 (Metric)', wrench: '13.0 mm (JIS: 12)', allen: '6.0 mm' },
                          { name: 'M10 (Metric)', wrench: '17.0 mm (JIS: 14)', allen: '8.0 mm' },
                          { name: 'M12 (Metric)', wrench: '19.0 mm (JIS: 17)', allen: '10.0 mm' },
                          { name: '1/4" Imperial', wrench: '7/16" Wrench', allen: '3/16" Key' },
                          { name: '5/16" Imperial', wrench: '1/2" Wrench', allen: '1/4" Key' },
                          { name: '3/8" Imperial', wrench: '9/16" Wrench', allen: '5/16" Key' },
                          { name: '1/2" Imperial', wrench: '3/4" Wrench', allen: '3/8" Key' }
                        ].map((sw) => (
                          <div key={sw.name} className="grid grid-cols-3 gap-2 items-center py-1.5 border-b border-gray-100/50 dark:border-stone-800/40 last:border-none px-1">
                            <span className="font-extrabold text-gray-850 dark:text-stone-200">{sw.name}</span>
                            <span className="font-mono font-black text-amber-700 dark:text-yellow-405 text-center bg-gray-50 dark:bg-stone-950 px-1.5 py-0.5 rounded-md text-[9.5px]">{sw.wrench}</span>
                            <span className="font-mono font-semibold text-gray-550 dark:text-stone-400 text-right text-[9.5px]">{sw.allen}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Total Screw Length Equivalency Grid inside Help page! */}
                    <div className="space-y-1.5 pt-1.5 border-t border-gray-150/40 dark:border-stone-800/80">
                      <div className="flex justify-between items-center px-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-450">Screw Length Equivalencies:</span>
                        <input
                          type="text"
                          placeholder="Search length..."
                          value={helpLengthSearchFilter}
                          onChange={(e) => setHelpLengthSearchFilter(e.target.value)}
                          className="bg-gray-50 dark:bg-stone-850 border border-gray-200 dark:border-stone-800 focus:border-yellow-405 dark:focus:border-yellow-450 rounded-lg outline-none px-2 py-0.5 text-[9.5px] max-w-[130px] font-semibold"
                        />
                      </div>

                      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-yellow-101/60 dark:border-stone-850 p-2.5 max-h-40 overflow-y-auto space-y-1 text-[10px]">
                        {SCREW_LENGTH_DATA.filter(sl => {
                          const q = helpLengthSearchFilter.toLowerCase();
                          return sl.inches.toLowerCase().includes(q) || sl.tradeMm.toLowerCase().includes(q) || sl.commonApp.toLowerCase().includes(q);
                        }).map((sl) => (
                          <div
                            key={sl.inches}
                            className="flex flex-col gap-0.5 py-1.5 border-b border-gray-100/50 dark:border-stone-800/40 last:border-none px-1"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-extrabold text-gray-850 dark:text-stone-200">{sl.inches} Nom. ({sl.decimalInches.toFixed(3)})</span>
                              <span className="font-black text-yellow-750 dark:text-yellow-405 bg-yellow-50/50 dark:bg-stone-950 px-1.5 py-0.5 rounded border border-yellow-101/20 text-[9px]">{sl.tradeMm}</span>
                            </div>
                            <div className="flex justify-between text-[8px] text-gray-450">
                              <span>App: {sl.commonApp}</span>
                              <span className="font-mono text-gray-400/85">Exact: {sl.exactMm}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5 border-t border-gray-150/40 dark:border-stone-800/80 pt-3">
                      <span className="text-[9px] font-black text-gray-450 dark:text-stone-550 uppercase tracking-wider block px-1">Wall TOX Plastic Anchors & Drill Bit Pairing</span>
                      <div className="bg-gray-50 dark:bg-stone-950 rounded-xl border border-gray-150/40 dark:border-stone-850 overflow-hidden text-[9px]">
                        {[
                          { plug: 'Tox #5 (Yellow)', recommendedBit: '3/16" masonry bit (5 mm)', typical: 'Visual paintings / Bathroom frames' },
                          { plug: 'Tox #6 (Orange/Red)', recommendedBit: '1/4" masonry bit (6 mm)', typical: 'Heavy towel tubes / small cabinets' },
                          { plug: 'Tox #8 (Blue)', recommendedBit: '5/16" masonry bit (8 mm)', typical: 'Medium TV brackets / heavy mirrors' },
                          { plug: 'Tox #10 (Green)', recommendedBit: '3/8" masonry bit (10 mm)', typical: 'Wall consoles / split AC frames' }
                        ].map((to) => (
                          <div key={to.plug} className="flex justify-between items-center p-2.5 border-b border-gray-150/30 dark:border-stone-800/60 last:border-none">
                            <div>
                              <span className="font-extrabold text-gray-850 dark:text-stone-200 block">{to.plug}</span>
                              <span className="text-[7.5px] text-gray-450 dark:text-stone-550 block leading-none">{to.typical}</span>
                            </div>
                            <span className="font-mono font-extrabold text-emerald-650 dark:text-emerald-450 shrink-0 ml-1.5 font-sans">{to.recommendedBit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {selectedHelpCategory === 'CONVERSION' && (
                  <div className="space-y-4 animate-[fadeIn_0.15s_ease-out]">
                    <div className="bg-yellow-50/40 dark:bg-stone-950/20 p-3 rounded-2xl border border-yellow-101/20 dark:border-stone-850">
                      <span className="text-[8.5px] font-black text-yellow-800 dark:text-yellow-500 uppercase tracking-widest block mb-1">PVC PIPE & CONDUITS Reference SHEET</span>
                      <h4 className="text-xs font-black text-gray-850 dark:text-stone-200">Nominal Trade Sizes to Metric Equivalents</h4>
                      <p className="text-[10px] text-gray-450 dark:text-stone-400 mt-1">
                        Nominal pipes correspond to outside diameter system sizes used by sanitary, water supply, and electric layouts in the Philippines.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[9px] font-black text-gray-450 dark:text-stone-550 uppercase tracking-wider block px-1">PVC Standard Metric Outer Diameters (OD)</span>
                      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-yellow-101/60 dark:border-stone-850 p-2.5 space-y-1.5 select-none">
                        {/* Custom Header Row */}
                        <div className="grid grid-cols-3 gap-2 pb-1.5 border-b border-gray-100 dark:border-stone-800 text-[8.5px] font-black text-gray-400 dark:text-stone-500 uppercase tracking-widest text-[10px]">
                          <span>Trade Size</span>
                          <span className="text-center">Metric (OD)</span>
                          <span className="text-right">Common Usage</span>
                        </div>
                        {[
                          { trade: '1/2" Inch', metric: '20 mm', use: 'Residential taps / washbasin feeds' },
                          { trade: '3/4" Inch', metric: '25 mm', use: 'Main domestic supply branch lines' },
                          { trade: '1" Inch', metric: '32 mm', use: 'Water meter link / pressure line' },
                          { trade: '1-1/4" Inch', metric: '40 mm', use: 'Utility pumps Waste outlets' },
                          { trade: '1-1/2" Inch', metric: '50 mm', use: 'Basin greywater / swimming pools' },
                          { trade: '2" Inch', metric: '63 mm', use: 'Toilet ventilation / electrical conduit' },
                          { trade: '2-1/2" Inch', metric: '75 mm', use: 'Storm system / drain channels' },
                          { trade: '3" Inch', metric: '90 mm', use: 'Sewage soil / drain ventilation' },
                          { trade: '4" Inch', metric: '110 mm', use: 'Main building waste / septic lines' },
                          { trade: '6" Inch', metric: '160 mm', use: 'Civil municipal / subdivision lines' },
                          { trade: '8" Inch', metric: '200 mm', use: 'Commercial industrial highflow systems' }
                        ].map((pvcObj) => (
                          <div key={pvcObj.trade} className="grid grid-cols-3 gap-2 items-center py-1.5 border-b border-gray-100/50 dark:border-stone-800/40 last:border-none hover:bg-yellow-50/25 dark:hover:bg-stone-850/20 px-1 rounded-lg transition-all text-[11px]">
                            <span className="font-extrabold text-gray-850 dark:text-stone-200">{pvcObj.trade}</span>
                            <span className="font-mono font-black text-yellow-750 dark:text-yellow-405 text-center bg-yellow-50/50 dark:bg-stone-950 px-2 rounded-md border border-yellow-101/40 dark:border-stone-800 text-[10px] w-fit mx-auto">{pvcObj.metric}</span>
                            <span className="text-[10px] text-gray-450 dark:text-stone-400 font-medium text-right leading-tight">{pvcObj.use}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-yellow-50/20 dark:bg-stone-950/40 p-2.5 rounded-xl border border-yellow-101/45 dark:border-stone-850/60 text-[9px] text-gray-550 dark:text-stone-400 leading-normal">
                      <span className="font-extrabold text-yellow-950 dark:text-yellow-500 uppercase block mb-0.5">⚠️ IMPORTANT PLUMBING PRESSURE SPEC:</span>
                      Under standard local PH plumbing guidelines (PNSA/PCP), schedule 40 water pressure pipes are thicker than schedule 80 wall conduits designed strictly for electrical wire routing. Never interchange blue pressure water lines with thin brown or orange/gray sanitary pipes.
                    </div>
                  </div>
                )}

                {selectedHelpCategory === 'TRUCK_CUBIC' && (
                  <div className="space-y-4">
                    <div className="bg-yellow-50/40 dark:bg-stone-950/20 p-3 rounded-2xl border border-yellow-101/20 dark:border-stone-850">
                      <span className="text-[8.5px] font-black text-yellow-800 dark:text-yellow-500 uppercase tracking-widest block mb-1">CONTAINER SPECS & DENSITY</span>
                      <h4 className="text-xs font-black text-gray-850 dark:text-stone-200 font-sans">Aggregates & Hauling Reference Sheets</h4>
                      <p className="text-[10px] text-gray-450 dark:text-stone-400 mt-1">
                        Reference metrics for calculating cubic load volume and standard dry materials carriage weights.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[9px] font-black text-gray-450 dark:text-stone-550 uppercase tracking-wider block px-1">Typical Dump Trucks Capacities</span>
                      <div className="bg-gray-50 dark:bg-stone-950 rounded-xl border border-gray-150/40 dark:border-stone-850 overflow-hidden text-[9px]">
                        {[
                          { truck: 'Bongo Mini cab (4-Wheeler)', cbm: '2.0 - 3.0 CBM Volume' },
                          { truck: 'Elf Dump Bed (6-Wheeler)', cbm: '4.0 - 5.0 CBM Volume' },
                          { truck: 'Forward Heavy Bed (6-Wheeler)', cbm: '7.0 - 9.0 CBM Volume' },
                          { truck: 'Heavy Duty 10-Wheeler Dump', cbm: '15.0 - 18.0 CBM Volume' }
                        ].map((tr) => (
                          <div key={tr.truck} className="flex justify-between items-center p-2.5 border-b border-gray-150/30 dark:border-stone-800/60 last:border-none font-bold">
                            <span className="text-gray-800 dark:text-stone-200">{tr.truck}</span>
                            <span className="text-yellow-750 dark:text-yellow-400 font-mono">{tr.cbm}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[9px] font-black text-gray-450 dark:text-stone-550 uppercase tracking-wider block px-1">Raw Loose Materials Density Average</span>
                      <div className="bg-gray-50 dark:bg-stone-950 rounded-xl border border-gray-150/40 dark:border-stone-850 overflow-hidden text-[9px]">
                        {[
                          { name: 'Wash Sand (Adlaw Plastering)', weight: '≈ 1.60 Tons per m³', detail: 'Bulk density: 1,600 kg / CBM' },
                          { name: 'Standard Concrete Gravel (3/4")', weight: '≈ 1.52 Tons per m³', detail: 'Bulk density: 1,520 kg / CBM' },
                          { name: 'Sub-base soil gravel matrix', weight: '≈ 1.45 Tons per m³', detail: 'Bulk density: 1,450 kg / CBM' },
                          { name: 'Road Base Crusher Run', weight: '≈ 1.80 Tons per m³', detail: 'Bulk density: 1,800 kg / CBM' }
                        ].map((mat) => (
                          <div key={mat.name} className="flex justify-between items-center p-2.5 border-b border-gray-150/30 dark:border-stone-800/60 last:border-none">
                            <div>
                              <span className="font-extrabold text-gray-850 dark:text-stone-200 block">{mat.name}</span>
                              <span className="text-[7.5px] text-gray-450 dark:text-stone-500 block leading-none">{mat.detail}</span>
                            </div>
                            <span className="font-mono font-black text-amber-700 dark:text-amber-400 text-right text-[10px] shrink-0 ml-1.5">{mat.weight}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {selectedHelpCategory === 'FINANCE' && (
                  <div className="space-y-4 animate-[fadeIn_0.15s_ease-out]">
                    <div className="bg-yellow-50/40 dark:bg-stone-950/20 p-3 rounded-2xl border border-yellow-101/20 dark:border-stone-850">
                      <span className="text-[8.5px] font-black text-yellow-800 dark:text-yellow-500 uppercase tracking-widest block mb-1">CASH DENOMINATIONS GUIDE</span>
                      <h4 className="text-xs font-black text-gray-850 dark:text-stone-200">Philippine Peso (PHP) Currency Breakdown</h4>
                      <p className="text-[10px] text-gray-450 dark:text-stone-400 mt-1">
                        Breakdown algorithms for retail sales drawers, salary payroll envelopes, and cashier float calculations.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[9px] font-black text-gray-450 dark:text-stone-550 uppercase tracking-wider block px-1">Breakdown Strategies</span>
                      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-yellow-101/60 dark:border-stone-850 p-2.5 space-y-2 text-[10px]">
                        <div>
                          <strong className="text-yellow-900 dark:text-yellow-400 block font-black uppercase">⚡ Fewest Bills Strategy</strong>
                          <p className="text-gray-500 dark:text-stone-400 mt-0.5 leading-tight">
                            Uses greedy distribution prioritizing largest notes (₱1000, ₱500) to minimize physical volume of cash required.
                          </p>
                        </div>
                        <div className="border-t border-gray-100 dark:border-stone-800 pt-2">
                          <strong className="text-yellow-900 dark:text-yellow-400 block font-black uppercase">🔄 Smaller Bills (Change) Strategy</strong>
                          <p className="text-gray-500 dark:text-stone-400 mt-0.5 leading-tight">
                            Limits large ₱1000 bills and distributes amounts into ₱500, ₱200, ₱100, and ₱50 notes to provide sufficient cashier change.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer inside help modal */}
              <div className="mt-3 pt-2 border-t border-gray-100 dark:border-stone-800 text-center shrink-0">
                <span className="text-[8px] font-mono text-gray-400 dark:text-stone-500 uppercase tracking-widest block leading-none">
                  PH CONSTRUCT ESTIMATE DATA
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Calculation History & Logs Overlay Drawer Modal */}
      <AnimatePresence>
        {isHistoryOpen && (
          <>
            {/* Soft backdrop overlay */}
            <motion.div
              key="history-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsHistoryOpen(false)}
              className="fixed inset-0 bg-yellow-950/70 backdrop-blur-[2px] z-50 cursor-pointer"
            />

            {/* Dialog Panel */}
            <motion.div
              key="history-dialog"
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed inset-x-4 top-[8dvh] bottom-[8dvh] md:top-[12dvh] md:bottom-[12dvh] max-w-md mx-auto bg-white dark:bg-stone-900 border border-yellow-101/40 dark:border-stone-800 rounded-3xl shadow-2xl z-50 flex flex-col p-5 overflow-hidden text-gray-800 dark:text-stone-100"
            >
              {/* Header */}
              <div className="flex justify-between items-center pb-2.5 border-b border-gray-100 dark:border-stone-800 mb-3 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-yellow-400 text-white font-extrabold flex items-center justify-center">
                    <History size={15} />
                  </span>
                  <div>
                    <h3 className="text-sm font-black text-yellow-950 dark:text-yellow-400 uppercase tracking-wider leading-none">
                      Calculations History Log
                    </h3>
                    <span className="text-[8.5px] font-bold text-gray-400 dark:text-stone-500 uppercase tracking-widest mt-1 block">
                      Pin or reference past estimates offline
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1.5">
                  {history.length > 0 && (
                    <button
                      onClick={clearHistory}
                      className="p-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-101 dark:bg-red-950/40 dark:text-red-400 font-bold text-[9px] flex items-center gap-0.5 active:scale-95 transition-all outline-none"
                      title="Clear non-pinned calculations"
                    >
                      <Trash2 size={11} />
                      <span>CLEAR</span>
                    </button>
                  )}
                  <button
                    onClick={() => setIsHistoryOpen(false)}
                    className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-stone-850 flex items-center justify-center text-gray-450 hover:bg-gray-100 dark:hover:bg-stone-800 active:scale-95 transition-all outline-none"
                    aria-label="Close history modal"
                  >
                    <X size={15} className="stroke-[2.5]" />
                  </button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-1 overflow-x-auto pb-2 border-b border-gray-100 dark:border-stone-800 shrink-0 scrollbar-none">
                {[
                  { id: 'ALL', label: 'All Logs' },
                  { id: 'NORMAL_CALC', label: 'Calculator' },
                  { id: 'VAT', label: 'VAT' },
                  { id: '2307', label: 'Form 2307' },
                  { id: 'LUMBER', label: 'Lumber' },
                  { id: 'CONVERSION', label: 'Conversions' },
                  { id: 'TRUCK_CUBIC', label: 'Truck/Cubic' },
                  { id: 'CASH_BREAKDOWN', label: 'Cash Breakdown' }
                ].map((item) => {
                  const isCur = historyFilter === item.id;
                  const count = item.id === 'ALL' 
                    ? history.length 
                    : history.filter(h => h.category === item.id).length;

                  return (
                    <button
                      key={item.id}
                      onClick={() => setHistoryFilter(item.id)}
                      className={`px-2.5 py-1 text-[9.5px] rounded-lg transition-all whitespace-nowrap outline-none font-bold shrink-0 flex items-center gap-1 border-2 ${
                        isCur
                          ? 'bg-yellow-101 border-yellow-400 text-yellow-905 font-black animate-[pulse_3s_infinite]'
                          : 'bg-white border-transparent text-gray-400 hover:text-gray-650'
                      }`}
                    >
                      <span>{item.label}</span>
                      {count > 0 && (
                        <span className="p-0.5 px-1 bg-yellow-400 text-white rounded-md text-[8px] font-black leading-none">
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Scrollable list of history items */}
              <div className="flex-1 overflow-y-auto pr-1 mt-3 space-y-2.5 scrollbar-thin">
                {history.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 mt-8">
                    <div className="w-12 h-12 bg-yellow-50 dark:bg-stone-950 rounded-full flex items-center justify-center text-yellow-400">
                      <History size={24} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-gray-800 dark:text-stone-300">No Calculations Found</h4>
                      <p className="text-[10px] text-gray-400 max-w-[200px] mt-1 leading-normal">
                        Your computed results will automatically show up here as you work.
                      </p>
                    </div>
                  </div>
                ) : (
                  (() => {
                    const filtered = historyFilter === 'ALL' 
                      ? history 
                      : history.filter(item => item.category === historyFilter);

                    if (filtered.length === 0) {
                      return (
                        <div className="text-center py-8 text-gray-450 dark:text-stone-400 text-[10.5px]">
                          No records match the current category filter.
                        </div>
                      );
                    }

                    return filtered.map((item) => (
                      <HistoryItemRow 
                        key={item.id} 
                        item={item} 
                        onTogglePin={togglePinHistoryItem} 
                        onDelete={deleteHistoryItem} 
                      />
                    ));
                  })()
                )}
              </div>

              {/* Note inside footer */}
              <div className="mt-3 pt-2 border-t border-gray-100 dark:border-stone-800 text-center shrink-0 flex justify-between items-center text-[8px] text-gray-400 font-mono">
                <span>PINS PREVENT CLEARING</span>
                <span>MAX 100 RECORDS</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Content Area - Fits mobile phone layout perfectly */}
      <main className={`${
        layoutMode === 'fit'
          ? 'flex-1 min-h-0 flex flex-col justify-start overflow-y-auto pb-2 scrollbar-none'
          : 'pb-6'
      } w-full max-w-md`}>
        <AnimatePresence mode="wait">
          {activeCategory === 'SALES_INVOICE' && (
            <motion.div
              key="sales"
              initial={{ x: 12, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -12, opacity: 0 }}
              transition={{ duration: 0.12 }}
            >
              {/* Sub-category tabs */}
              <div className="flex gap-2 mb-4">
                <button
                  id="subtab-vat"
                  onClick={() => setActiveSubCategory('VAT')}
                  className={`flex-1 rounded-2xl font-black tracking-wider transition-all border-2 outline-none ${
                    layoutMode === 'scroll'
                      ? 'py-4.5 px-5 text-sm sm:text-base rounded-2xl'
                      : 'py-2.5 px-3 text-[10px]'
                  } ${
                    activeSubCategory === 'VAT'
                      ? 'bg-yellow-101 border-yellow-400 text-yellow-905 dark:bg-yellow-405/10 dark:border-yellow-400 dark:text-yellow-400 dark:shadow-[0_0_18px_rgba(250,204,21,0.35)] pointer-events-none'
                      : 'bg-white dark:bg-stone-900 border-transparent dark:border-stone-850/40 text-gray-400 dark:text-stone-400 hover:text-gray-600 dark:hover:text-stone-200 hover:bg-yellow-50 dark:hover:bg-stone-850/40'
                  }`}
                >
                  VATABLE SALES / VAT
                </button>
                <button
                  id="subtab-2307"
                  onClick={() => setActiveSubCategory('2307')}
                  className={`flex-1 rounded-2xl font-black tracking-wider transition-all border-2 outline-none ${
                    layoutMode === 'scroll'
                      ? 'py-4.5 px-5 text-sm sm:text-base rounded-2xl'
                      : 'py-2.5 px-3 text-[10px]'
                  } ${
                    activeSubCategory === '2307'
                      ? 'bg-yellow-101 border-yellow-400 text-yellow-905 dark:bg-yellow-405/10 dark:border-yellow-400 dark:text-yellow-400 dark:shadow-[0_0_18px_rgba(250,204,21,0.35)] pointer-events-none'
                      : 'bg-white dark:bg-stone-900 border-transparent dark:border-stone-850/40 text-gray-400 dark:text-stone-400 hover:text-gray-650 dark:hover:text-stone-200 hover:bg-yellow-50 dark:hover:bg-stone-850/40'
                  }`}
                >
                  2307 FORM
                </button>
              </div>

              {activeSubCategory === 'VAT' ? (
                <VatCalculator layoutMode={layoutMode} onAddHistory={addHistoryItem} />
              ) : (
                <Tax2307Calculator layoutMode={layoutMode} onAddHistory={addHistoryItem} />
              )}
            </motion.div>
          )}

          {activeCategory === 'LUMBER' && (
            <motion.div
              key="lumber"
              initial={{ x: 12, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -12, opacity: 0 }}
              transition={{ duration: 0.12 }}
            >
              <LumberCalculator layoutMode={layoutMode} onAddHistory={addHistoryItem} />
            </motion.div>
          )}

          {activeCategory === 'NORMAL_CALC' && (
            <motion.div
              key="normal"
              initial={{ x: 12, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -12, opacity: 0 }}
              transition={{ duration: 0.12 }}
            >
              <NormalCalculator layoutMode={layoutMode} onAddHistory={addHistoryItem} />
            </motion.div>
          )}

          {activeCategory === 'CONVERSION' && (
            <motion.div
              key="conversion"
              initial={{ x: 12, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -12, opacity: 0 }}
              transition={{ duration: 0.12 }}
            >
              <MetricConverter layoutMode={layoutMode} onAddHistory={addHistoryItem} />
            </motion.div>
          )}

          {activeCategory === 'TRUCK_CUBIC' && (
            <motion.div
              key="truck-cubic"
              initial={{ x: 12, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -12, opacity: 0 }}
              transition={{ duration: 0.12 }}
            >
              <TruckCubicCalculator layoutMode={layoutMode} onAddHistory={addHistoryItem} />
            </motion.div>
          )}

          {activeCategory === 'FINANCE' && (
            <motion.div
              key="finance"
              initial={{ x: 12, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -12, opacity: 0 }}
              transition={{ duration: 0.12 }}
            >
              <CashBreakdownCalculator layoutMode={layoutMode} onAddHistory={addHistoryItem} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Decoration */}
      <footer className="mt-auto py-1 opacity-30 flex items-center justify-center gap-2 select-none shrink-0 w-full">
        <div className="h-[1px] w-4 bg-yellow-950/40" />
        <span className="text-[8px] font-mono tracking-widest text-yellow-900">PHILIPPINE CALC SUITE</span>
        <div className="h-[1px] w-4 bg-yellow-950/40" />
      </footer>
    </div>
  );
}

function HistoryItemRow({ 
  item, 
  onTogglePin, 
  onDelete 
}: { 
  key?: React.Key;
  item: HistoryItem; 
  onTogglePin: (id: string) => void; 
  onDelete: (id: string) => void; 
}) {
  const [copied, setCopied] = useState(false);

  const handleCopyRow = () => {
    const textToCopy = `${item.calculatorName}:\nInputs: ${item.formula}\nResult: ${item.result}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const getCategoryBadge = (cat: HistoryCategory) => {
    switch (cat) {
      case 'NORMAL_CALC': return 'bg-purple-105/90 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400';
      case 'VAT': return 'bg-blue-105/90 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400';
      case '2307': return 'bg-emerald-105/90 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400';
      case 'LUMBER': return 'bg-amber-105/90 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400';
      case 'CONVERSION': return 'bg-cyan-105/90 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-400';
      case 'TRUCK_CUBIC': return 'bg-orange-105/90 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400';
      case 'CASH_BREAKDOWN': return 'bg-emerald-105/90 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400';
      default: return 'bg-stone-105 text-stone-700';
    }
  };

  return (
    <div className={`p-3.5 rounded-2xl border transition-all text-left flex flex-col justify-between gap-2.5 relative group ${
      item.isPinned 
        ? 'border-yellow-405 bg-yellow-400/5 dark:border-yellow-500/30' 
        : 'border-gray-150/50 bg-stone-50/20 dark:border-stone-850 dark:bg-stone-900/40 hover:border-gray-300'
    }`}>
      {/* Card Header Row */}
      <div className="flex justify-between items-start gap-2 select-none">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded leading-none ${getCategoryBadge(item.category)}`}>
            {item.calculatorName}
          </span>
          <span className="text-[7.5px] font-bold text-gray-400 dark:text-stone-550 leading-none">
            {item.timestamp}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onTogglePin(item.id)}
            className={`p-1 rounded-md transition-all active:scale-95 outline-none ${
              item.isPinned 
                ? 'text-yellow-600 hover:bg-yellow-50 dark:text-yellow-400' 
                : 'text-gray-300 dark:text-stone-750 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-stone-800'
            }`}
            title={item.isPinned ? "Unpin calculation" : "Pin calculation"}
          >
            <Star size={11} className={item.isPinned ? "fill-yellow-500 text-yellow-500" : ""} />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="p-1 rounded-md text-gray-300 dark:text-stone-750 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all active:scale-95 outline-none"
            title="Delete this record"
          >
            <X size={11} className="stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Formula / Equation / Inputs */}
      <p className="text-[9.5px] font-mono leading-relaxed text-gray-500 dark:text-stone-450 break-words pr-1 mt-0.5 select-all">
        {item.formula}
      </p>

      {/* Result Row */}
      <div className="flex justify-between items-end mt-1 border-t border-gray-150/30 dark:border-stone-800/40 pt-2 shrink-0 select-all">
        <span className="text-[15px] font-mono font-black tracking-tight text-gray-900 dark:text-stone-100 break-all leading-none">
          {item.result}
        </span>
        
        <button
          onClick={handleCopyRow}
          className={`font-black uppercase flex items-center justify-center gap-1 shrink-0 p-1 px-1.5 rounded bg-white border outline-none cursor-pointer transition-all active:scale-95 text-[7px] leading-none ${
            copied
              ? 'bg-green-50 text-green-600 border-green-200'
              : 'text-gray-450 border-gray-150 shadow-3xs dark:bg-stone-950 dark:border-stone-805 dark:text-stone-400 hover:bg-gray-50'
          }`}
          title="Copy entry detail to clipboard"
        >
          {copied ? (
            <>
              <Check size={8} />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy size={8} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
