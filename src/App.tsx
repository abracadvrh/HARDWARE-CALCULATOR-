import React, { useState } from 'react';
import { Trees, ReceiptText, Calculator, RefreshCw, Menu, X, ArrowRight, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import VatCalculator from './components/VatCalculator';
import Tax2307Calculator from './components/Tax2307Calculator';
import LumberCalculator from './components/LumberCalculator';
import NormalCalculator from './components/NormalCalculator';
import MetricConverter from './components/MetricConverter';

type Category = 'NORMAL_CALC' | 'SALES_INVOICE' | 'LUMBER' | 'CONVERSION';
type SubCategory = 'VAT' | '2307';

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
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

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
      {/* Top Bar with floating Menu and Day/Night Mode Switch Button */}
      <div className="w-full max-w-md flex justify-between items-center mb-2.5 px-1 pt-1 shrink-0">
        <div className="flex items-center gap-2.5">
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
              className="fixed top-0 left-0 h-full w-[82vw] max-w-[290px] bg-white border-r border-yellow-100/50 z-50 shadow-2xl p-5 flex flex-col justify-between"
            >
              {/* Top Drawer segment */}
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div className="flex flex-col">
                    <span className="text-xl font-black text-yellow-950 tracking-tight">Navigation</span>
                    <span className="text-[10px] font-black text-yellow-600/80 tracking-wider">CHOOSE CALCULATOR</span>
                  </div>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="w-9 h-9 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-950 hover:bg-yellow-100 active:scale-95 transition-all outline-none"
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
                        ? 'bg-yellow-400 text-white shadow-md shadow-yellow-300 font-black'
                        : 'text-gray-500 hover:bg-yellow-50 hover:text-yellow-905 font-bold'
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 ${activeCategory === 'NORMAL_CALC' ? 'bg-white/20' : 'bg-gray-100'}`}>
                      <Calculator size={18} className={activeCategory === 'NORMAL_CALC' ? 'text-white' : 'text-gray-650'} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs uppercase tracking-wide truncate">Standard Calc</span>
                      <span className={`text-[8.5px] ${activeCategory === 'NORMAL_CALC' ? 'text-yellow-50' : 'text-gray-400'} font-medium mt-0.5`}>Pocket Basic Math Tool</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActiveCategory('SALES_INVOICE');
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-2xl flex items-center gap-3 transition-all text-left outline-none ${
                      activeCategory === 'SALES_INVOICE'
                        ? 'bg-yellow-400 text-white shadow-md shadow-yellow-300 font-black'
                        : 'text-gray-500 hover:bg-yellow-50 hover:text-yellow-905 font-bold'
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 ${activeCategory === 'SALES_INVOICE' ? 'bg-white/20' : 'bg-gray-100'}`}>
                      <ReceiptText size={18} className={activeCategory === 'SALES_INVOICE' ? 'text-white' : 'text-gray-650'} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs uppercase tracking-wide truncate">Receipt Invoice</span>
                      <span className={`text-[8.5px] ${activeCategory === 'SALES_INVOICE' ? 'text-yellow-50' : 'text-gray-400'} font-medium mt-0.5`}>Vat & WHT Form 2307</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActiveCategory('LUMBER');
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-2xl flex items-center gap-3 transition-all text-left outline-none ${
                      activeCategory === 'LUMBER'
                        ? 'bg-yellow-400 text-white shadow-md shadow-yellow-300 font-black'
                        : 'text-gray-500 hover:bg-yellow-50 hover:text-yellow-905 font-bold'
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 ${activeCategory === 'LUMBER' ? 'bg-white/20' : 'bg-gray-100'}`}>
                      <Trees size={18} className={activeCategory === 'LUMBER' ? 'text-white' : 'text-gray-650'} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs uppercase tracking-wide truncate">Lumber Dimensions</span>
                      <span className={`text-[8.5px] ${activeCategory === 'LUMBER' ? 'text-yellow-50' : 'text-gray-400'} font-medium mt-0.5`}>Board Feet Price Estimate</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActiveCategory('CONVERSION');
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-2xl flex items-center gap-3 transition-all text-left outline-none ${
                      activeCategory === 'CONVERSION'
                        ? 'bg-yellow-400 text-white shadow-md shadow-yellow-300 font-black'
                        : 'text-gray-500 hover:bg-yellow-50 hover:text-yellow-905 font-bold'
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 ${activeCategory === 'CONVERSION' ? 'bg-white/20' : 'bg-gray-100'}`}>
                      <RefreshCw size={18} className={activeCategory === 'CONVERSION' ? 'text-white' : 'text-gray-650'} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs uppercase tracking-wide truncate">Metric Conversion</span>
                      <span className={`text-[8.5px] ${activeCategory === 'CONVERSION' ? 'text-yellow-50' : 'text-gray-400'} font-medium mt-0.5`}>PVC pipe trade sizes & bits</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Bottom Drawer segment */}
              <div className="space-y-4">
                {/* Mode Settings section */}
                <div className="p-3 bg-yellow-50 rounded-2xl border border-yellow-101/40 flex flex-col gap-1.5">
                  <span className="text-[9px] font-black text-yellow-900 uppercase tracking-widest block select-none">
                    Theme mode
                  </span>
                  <div className="flex border border-yellow-101/30 rounded-xl overflow-hidden bg-white mb-2">
                    <button
                      onClick={() => {
                        setTheme('day');
                        localStorage.setItem('hwcalc-theme', 'day');
                      }}
                      className={`flex-1 py-1.5 px-2 text-[10px] font-black flex items-center justify-center gap-1.5 transition-all outline-none ${
                        theme === 'day' 
                          ? 'bg-yellow-400 text-white font-black' 
                          : 'text-gray-400 hover:text-yellow-905'
                      }`}
                    >
                      <Sun size={11} />
                      <span>DAY MODE</span>
                    </button>
                    <button
                      onClick={() => {
                        setTheme('night');
                        localStorage.setItem('hwcalc-theme', 'night');
                      }}
                      className={`flex-1 py-1.5 px-2 text-[10px] font-black flex items-center justify-center gap-1.5 transition-all outline-none ${
                        theme === 'night' 
                          ? 'bg-yellow-400 text-white font-black' 
                          : 'text-gray-400 hover:text-yellow-905'
                      }`}
                    >
                      <Moon size={11} />
                      <span>NIGHT MODE</span>
                    </button>
                  </div>

                  <span className="text-[9px] font-black text-yellow-900 uppercase tracking-widest block select-none">
                    Screen Layout
                  </span>
                  <div className="flex border border-yellow-101/30 rounded-xl overflow-hidden bg-white">
                    <button
                      onClick={() => {
                        setLayoutMode('scroll');
                        localStorage.setItem('hwcalc-layout', 'scroll');
                      }}
                      className={`flex-1 py-1.5 px-2 text-[10px] font-black flex items-center justify-center gap-1 transition-all outline-none ${
                        layoutMode === 'scroll' 
                          ? 'bg-yellow-400 text-white font-black' 
                          : 'text-gray-400 hover:text-yellow-905'
                      }`}
                      title="Standard scrolling layout"
                    >
                      <span>SCROLLABLE</span>
                    </button>
                    <button
                      onClick={() => {
                        setLayoutMode('fit');
                        localStorage.setItem('hwcalc-layout', 'fit');
                      }}
                      className={`flex-1 py-1.5 px-2 text-[10px] font-black flex items-center justify-center gap-1 transition-all outline-none ${
                        layoutMode === 'fit' 
                          ? 'bg-yellow-400 text-white font-black' 
                          : 'text-gray-400 hover:text-yellow-905'
                      }`}
                      title="Compact no-scroll fullscreen layout"
                    >
                      <span>FULL SCREEN</span>
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-yellow-50 rounded-2xl border border-yellow-101/40 text-center select-none">
                  <p className="text-[11px] font-black uppercase tracking-wider text-yellow-950">HardwareCalc</p>
                  <span className="text-[8.5px] font-black text-yellow-750 block mt-0.5">BY: ABRACADVRH</span>
                </div>
                
                <div className="flex items-center gap-1.5 justify-center text-[9px] font-bold text-yellow-800 bg-yellow-100/40 py-1.5 px-2 rounded-xl border border-dashed border-yellow-250">
                  <span>💡</span> Swipe left or tap backdrop to close
                </div>
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
                      ? 'py-3.5 px-4 text-xs sm:text-sm'
                      : 'py-2.5 px-3 text-[10px]'
                  } ${
                    activeSubCategory === 'VAT'
                      ? 'bg-yellow-101 border-yellow-400 text-yellow-905 pointer-events-none'
                      : 'bg-white border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  VATABLE SALES / VAT
                </button>
                <button
                  id="subtab-2307"
                  onClick={() => setActiveSubCategory('2307')}
                  className={`flex-1 rounded-2xl font-black tracking-wider transition-all border-2 outline-none ${
                    layoutMode === 'scroll'
                      ? 'py-3.5 px-4 text-xs sm:text-sm'
                      : 'py-2.5 px-3 text-[10px]'
                  } ${
                    activeSubCategory === '2307'
                      ? 'bg-yellow-101 border-yellow-400 text-yellow-905 pointer-events-none'
                      : 'bg-white border-transparent text-gray-400 hover:text-gray-650'
                  }`}
                >
                  2307 FORM
                </button>
              </div>

              {activeSubCategory === 'VAT' ? <VatCalculator layoutMode={layoutMode} /> : <Tax2307Calculator layoutMode={layoutMode} />}
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
              <LumberCalculator layoutMode={layoutMode} />
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
              <NormalCalculator layoutMode={layoutMode} />
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
              <MetricConverter layoutMode={layoutMode} />
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
