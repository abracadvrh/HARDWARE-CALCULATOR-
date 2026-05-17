import React, { useState } from 'react';
import { Calculator, Trees, ReceiptText, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import VatCalculator from './components/VatCalculator';
import Tax2307Calculator from './components/Tax2307Calculator';
import LumberCalculator from './components/LumberCalculator';

type Category = 'SALES_INVOICE' | 'LUMBER';
type SubCategory = 'VAT' | '2307';

export default function App() {
  const [activeCategory, setActiveCategory] = useState<Category>('SALES_INVOICE');
  const [activeSubCategory, setActiveSubCategory] = useState<SubCategory>('VAT');

  const rilakkumaImg = "/src/assets/images/rilakkuma_mascot_1779022893123.png";

  return (
    <div className="min-h-screen bg-yellow-50 text-gray-800 font-sans p-4 md:p-8 flex flex-col items-center">
      {/* Header */}
      <header className="w-full max-w-md mb-8 flex flex-col items-center relative">
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-3 mb-2"
        >
          <motion.img 
            src={rilakkumaImg} 
            alt="Rilakkuma" 
            className="w-12 h-12 object-contain"
            referrerPolicy="no-referrer"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
          />
          <h1 className="text-3xl font-bold text-yellow-900 tracking-tight">
            Dhebs' calculator
          </h1>
        </motion.div>
        <p className="text-yellow-700 text-sm font-medium">Efficient & Simple Calculations</p>
      </header>

      {/* Main Categories */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-yellow-200/50 overflow-hidden mb-6 flex">
        <button
          onClick={() => setActiveCategory('SALES_INVOICE')}
          className={`flex-1 py-4 flex flex-col items-center gap-1 transition-all ${
            activeCategory === 'SALES_INVOICE' 
              ? 'bg-yellow-400 text-white' 
              : 'text-gray-400 hover:bg-yellow-50'
          }`}
        >
          <ReceiptText size={24} />
          <span className="text-[10px] uppercase font-bold tracking-widest px-2 text-center">
            Sales Invoice Receipt
          </span>
        </button>
        <button
          onClick={() => setActiveCategory('LUMBER')}
          className={`flex-1 py-4 flex flex-col items-center gap-1 transition-all ${
            activeCategory === 'LUMBER' 
              ? 'bg-yellow-400 text-white' 
              : 'text-gray-400 hover:bg-yellow-50'
          }`}
        >
          <Trees size={24} />
          <span className="text-[10px] uppercase font-bold tracking-widest px-2 text-center">
            Lumber Materials
          </span>
        </button>
      </div>

      {/* Content Area */}
      <main className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {activeCategory === 'SALES_INVOICE' ? (
            <motion.div
              key="sales"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Sub-category tabs */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setActiveSubCategory('VAT')}
                  className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all border-2 ${
                    activeSubCategory === 'VAT'
                      ? 'bg-yellow-100 border-yellow-400 text-yellow-900'
                      : 'bg-white border-gray-100 text-gray-400'
                  }`}
                >
                  VATABLE SALES / VAT
                </button>
                <button
                  onClick={() => setActiveSubCategory('2307')}
                  className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all border-2 ${
                    activeSubCategory === '2307'
                      ? 'bg-yellow-100 border-yellow-400 text-yellow-900'
                      : 'bg-white border-gray-100 text-gray-400'
                  }`}
                >
                  2307 FORM
                </button>
              </div>

              {activeSubCategory === 'VAT' ? <VatCalculator /> : <Tax2307Calculator />}
            </motion.div>
          ) : (
            <motion.div
              key="lumber"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <LumberCalculator />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Decoration */}
      <footer className="mt-12 opacity-30 flex items-center gap-2">
        <div className="h-px w-8 bg-yellow-900" />
        <span className="text-xs font-mono">PHILIPPINE PESO (₱)</span>
        <div className="h-px w-8 bg-yellow-900" />
      </footer>
    </div>
  );
}
