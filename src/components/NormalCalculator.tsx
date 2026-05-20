import React, { useState } from 'react';
import { Delete, Percent, Divide, X, Minus, Plus, Equal, RotateCcw, Copy, Check } from 'lucide-react';
import { motion } from 'motion/react';

export default function NormalCalculator({ layoutMode = 'scroll' }: { layoutMode?: 'scroll' | 'fit' }) {
  const [display, setDisplay] = useState<string>('0');
  const [equation, setEquation] = useState<string>('');
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const handleNum = (num: string) => {
    if (display === '0' || isFinished) {
      setDisplay(num);
      setIsFinished(false);
    } else {
      setDisplay(display + num);
    }
  };

  const handleDecimal = () => {
    if (isFinished) {
      setDisplay('0.');
      setIsFinished(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleOperator = (op: string) => {
    setIsFinished(false);
    let currentEq = equation;
    if (isFinished) {
      currentEq = '';
    }

    // If the display ends with an operator, or we append to it
    const lastChar = currentEq.trim().slice(-1);
    if (['+', '-', '*', '/'].includes(lastChar) && display === '0') {
      // Replace last operator
      setEquation(currentEq.trim().slice(0, -1) + ' ' + op + ' ');
    } else {
      setEquation((currentEq ? currentEq + ' ' : '') + display + ' ' + op + ' ');
      setDisplay('0');
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
    setIsFinished(false);
  };

  const handleDelete = () => {
    if (isFinished) {
      handleClear();
      return;
    }
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const handleToggleSign = () => {
    if (display !== '0') {
      if (display.startsWith('-')) {
        setDisplay(display.slice(1));
      } else {
        setDisplay('-' + display);
      }
    }
  };

  const handlePercentage = () => {
    const val = parseFloat(display);
    if (!isNaN(val)) {
      setDisplay((val / 100).toString());
    }
  };

  const handleCopy = () => {
    if (display === 'Error') return;
    navigator.clipboard.writeText(display);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1500);
  };

  const handleEqual = () => {
    if (!equation) return;
    
    const fullExpression = equation + display;
    try {
      // Safe evaluation of standard math operators
      // We tokenize and compute to avoid eval() issues and preserve standard order of operations
      const tokens = fullExpression.trim().split(/\s+/);
      if (tokens.length < 3) return;

      // First pass for multiplication and division
      const firstPass: (string | number)[] = [];
      let i = 0;
      while (i < tokens.length) {
        const token = tokens[i];
        if (token === '*' || token === '/') {
          const prev = parseFloat(firstPass.pop() as string);
          const next = parseFloat(tokens[i + 1]);
          if (token === '*') {
            firstPass.push(prev * next);
          } else {
            if (next === 0) throw new Error('DivByZero');
            firstPass.push(prev / next);
          }
          i += 2;
        } else {
          firstPass.push(token);
          i++;
        }
      }

      // Second pass for addition and subtraction
      let total = typeof firstPass[0] === 'string' ? parseFloat(firstPass[0]) : firstPass[0];
      i = 1;
      while (i < firstPass.length) {
        const op = firstPass[i] as string;
        const val = typeof firstPass[i + 1] === 'string' ? parseFloat(firstPass[i + 1] as string) : (firstPass[i + 1] as number);
        if (op === '+') {
          total += val;
        } else if (op === '-') {
          total -= val;
        }
        i += 2;
      }

      // Round nicely up to 8 decimal places if needed to avoid float issues
      const roundedResult = Math.round(total * 100000000) / 100000000;
      
      setEquation(fullExpression + ' =');
      setDisplay(roundedResult.toString());
      setIsFinished(true);
    } catch (err) {
      setDisplay('Error');
      setEquation('');
      setIsFinished(true);
    }
  };

  return (
    <div className={`bg-white rounded-3xl shadow-lg border border-yellow-50 transition-all ${
      layoutMode === 'scroll' ? 'p-5 xs:p-6 mb-2' : 'p-3 xs:p-4'
    }`}>
      {/* Display Board */}
      <div className={`bg-yellow-50/50 rounded-2xl text-right flex flex-col justify-end border border-yellow-101/40 relative group transition-all ${
        layoutMode === 'scroll' ? 'p-4 mb-4 min-h-[110px] sm:min-h-[125px]' : 'p-3 mb-2.5 min-h-[85px]'
      }`}>
        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className={`absolute left-2.5 top-2.5 rounded-lg bg-white hover:bg-yellow-50 font-bold text-gray-400 hover:text-yellow-905 transition-all outline-none border border-yellow-101/40 flex items-center gap-1 active:scale-95 shadow-xs ${
            layoutMode === 'scroll' ? 'p-1.5 px-2.5 text-xs' : 'p-1 px-1.5 text-[10px]'
          }`}
          title="Copy current display"
        >
          {copied ? (
            <>
              <Check size={layoutMode === 'scroll' ? 12 : 11} className="text-green-600" />
              <span className={`text-green-600 font-bold ${layoutMode === 'scroll' ? 'text-xs' : 'text-[9px]'}`}>Copied!</span>
            </>
          ) : (
            <>
              <Copy size={layoutMode === 'scroll' ? 12 : 11} className="text-gray-400" />
              <span className={layoutMode === 'scroll' ? 'text-xs' : 'text-[9px]'}>Copy</span>
            </>
          )}
        </button>

        <div className={`font-mono font-bold text-yellow-700/60 break-all overflow-hidden ${
          layoutMode === 'scroll' ? 'text-sm mb-1.5 h-6' : 'text-[11px] h-4.5'
        }`}>
          {equation}
        </div>
        <div className={`font-black text-gray-800 break-all select-all focus:outline-none tracking-tight leading-none ${
          layoutMode === 'scroll' ? 'text-4xl xs:text-5xl sm:text-6xl py-1' : 'text-2xl xs:text-3xl'
        }`}>
          {display}
        </div>
      </div>

      {/* Grid of keys */}
      <div className={`grid grid-cols-4 ${
        layoutMode === 'scroll' ? 'gap-2.5' : 'gap-2'
      }`}>
        {/* Row 1 */}
        <button
          onClick={handleClear}
          className={`calc-key rounded-2xl bg-yellow-101 hover:bg-yellow-250 text-yellow-905 font-black uppercase transition-colors ${
            layoutMode === 'scroll' ? 'text-base xs:text-lg' : 'text-sm'
          }`}
        >
          AC
        </button>
        <button
          onClick={handleToggleSign}
          className={`calc-key rounded-2xl bg-yellow-101 hover:bg-yellow-250 text-yellow-905 font-bold transition-colors ${
            layoutMode === 'scroll' ? 'text-lg xs:text-xl' : 'text-base'
          }`}
        >
          ±
        </button>
        <button
          onClick={handlePercentage}
          className="calc-key rounded-2xl bg-yellow-101 hover:bg-yellow-250 text-yellow-905 font-bold flex items-center justify-center transition-colors"
        >
          <Percent size={layoutMode === 'scroll' ? 20 : 16} />
        </button>
        <button
          onClick={() => handleOperator('/')}
          className="calc-key rounded-2xl bg-yellow-400 hover:bg-yellow-500 text-white font-bold flex items-center justify-center transition-colors"
        >
          <Divide size={layoutMode === 'scroll' ? 20 : 16} />
        </button>

        {/* Row 2 */}
        <button
          onClick={() => handleNum('7')}
          className={`calc-key rounded-2xl bg-gray-50 hover:bg-yellow-50 font-bold text-gray-700 transition-colors ${
            layoutMode === 'scroll' ? 'text-xl xs:text-2xl font-black' : 'text-lg'
          }`}
        >
          7
        </button>
        <button
          onClick={() => handleNum('8')}
          className={`calc-key rounded-2xl bg-gray-50 hover:bg-yellow-50 font-bold text-gray-700 transition-colors ${
            layoutMode === 'scroll' ? 'text-xl xs:text-2xl font-black' : 'text-lg'
          }`}
        >
          8
        </button>
        <button
          onClick={() => handleNum('9')}
          className={`calc-key rounded-2xl bg-gray-50 hover:bg-yellow-50 font-bold text-gray-700 transition-colors ${
            layoutMode === 'scroll' ? 'text-xl xs:text-2xl font-black' : 'text-lg'
          }`}
        >
          9
        </button>
        <button
          onClick={() => handleOperator('*')}
          className="calc-key rounded-2xl bg-yellow-400 hover:bg-yellow-500 text-white font-bold flex items-center justify-center transition-colors"
        >
          <X size={layoutMode === 'scroll' ? 18 : 16} />
        </button>

        {/* Row 3 */}
        <button
          onClick={() => handleNum('4')}
          className={`calc-key rounded-2xl bg-gray-50 hover:bg-yellow-50 font-bold text-gray-700 transition-colors ${
            layoutMode === 'scroll' ? 'text-xl xs:text-2xl font-black' : 'text-lg'
          }`}
        >
          4
        </button>
        <button
          onClick={() => handleNum('5')}
          className={`calc-key rounded-2xl bg-gray-50 hover:bg-yellow-50 font-bold text-gray-700 transition-colors ${
            layoutMode === 'scroll' ? 'text-xl xs:text-2xl font-black' : 'text-lg'
          }`}
        >
          5
        </button>
        <button
          onClick={() => handleNum('6')}
          className={`calc-key rounded-2xl bg-gray-50 hover:bg-yellow-50 font-bold text-gray-700 transition-colors ${
            layoutMode === 'scroll' ? 'text-xl xs:text-2xl font-black' : 'text-lg'
          }`}
        >
          6
        </button>
        <button
          onClick={() => handleOperator('-')}
          className="calc-key rounded-2xl bg-yellow-400 hover:bg-yellow-500 text-white font-bold flex items-center justify-center transition-colors"
        >
          <Minus size={layoutMode === 'scroll' ? 20 : 16} />
        </button>

        {/* Row 4 */}
        <button
          onClick={() => handleNum('1')}
          className={`calc-key rounded-2xl bg-gray-50 hover:bg-yellow-50 font-bold text-gray-700 transition-colors ${
            layoutMode === 'scroll' ? 'text-xl xs:text-2xl font-black' : 'text-lg'
          }`}
        >
          1
        </button>
        <button
          onClick={() => handleNum('2')}
          className={`calc-key rounded-2xl bg-gray-50 hover:bg-yellow-50 font-bold text-gray-700 transition-colors ${
            layoutMode === 'scroll' ? 'text-xl xs:text-2xl font-black' : 'text-lg'
          }`}
        >
          2
        </button>
        <button
          onClick={() => handleNum('3')}
          className={`calc-key rounded-2xl bg-gray-50 hover:bg-yellow-50 font-bold text-gray-700 transition-colors ${
            layoutMode === 'scroll' ? 'text-xl xs:text-2xl font-black' : 'text-lg'
          }`}
        >
          3
        </button>
        <button
          onClick={() => handleOperator('+')}
          className="calc-key rounded-2xl bg-yellow-400 hover:bg-yellow-500 text-white font-bold flex items-center justify-center transition-colors"
        >
          <Plus size={layoutMode === 'scroll' ? 20 : 16} />
        </button>

        {/* Row 5 */}
        <button
          onClick={() => handleNum('0')}
          className={`calc-key rounded-2xl bg-gray-50 hover:bg-yellow-50 font-bold text-gray-700 transition-colors ${
            layoutMode === 'scroll' ? 'text-xl xs:text-2xl font-black' : 'text-lg'
          }`}
        >
          0
        </button>
        <button
          onClick={handleDecimal}
          className={`calc-key rounded-2xl bg-gray-50 hover:bg-yellow-50 font-bold text-gray-700 transition-colors ${
            layoutMode === 'scroll' ? 'text-xl xs:text-2xl font-black' : 'text-lg'
          }`}
        >
          .
        </button>
        <button
          onClick={handleDelete}
          aria-label="Delete last digit"
          className="calc-key rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 font-bold flex items-center justify-center transition-colors"
        >
          <Delete size={layoutMode === 'scroll' ? 22 : 18} />
        </button>
        <button
          onClick={handleEqual}
          className="calc-key rounded-2xl bg-yellow-500 hover:bg-yellow-600 text-white font-bold flex items-center justify-center transition-colors hover:shadow-md"
        >
          <Equal size={layoutMode === 'scroll' ? 24 : 20} className="stroke-[3]" />
        </button>
      </div>
    </div>
  );
}
