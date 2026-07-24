import React, { useState, useEffect } from 'react';
import { Delete, Percent, Divide, X, Minus, Plus, Equal, Copy, Check, Info } from 'lucide-react';
import { SharedHistoryProps } from '../types';

interface ComponentProps extends SharedHistoryProps {
  layoutMode?: 'scroll' | 'fit';
}

/**
 * Robust, client-side mathematical expression interpreter.
 * Uses Shunting-yard algorithm to generate Reverse Polish Notation (RPN) and evaluate safe mathematical formulas.
 * Supports parenthesis nesting, trigonometric operators, power indices, percent, and factorial operations.
 */
function evaluateExpression(expression: string, angleMode: 'DEG' | 'RAD' = 'DEG'): number {
  if (!expression.trim()) return 0;
  
  // 1. Sanitize & normalize typical display operators
  let cleanExpr = expression
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/π/g, 'pi')
    .replace(/e/g, 'e')
    // Auto-insert implicit multiplication, e.g. 5(2) -> 5*(2), 5pi -> 5*pi, 5sin(30) -> 5*sin(30)
    .replace(/(\d)\s*\(/g, '$1 * (')
    .replace(/(\d)\s*pi/g, '$1 * pi')
    .replace(/(\d)\s*e/g, '$1 * e')
    .replace(/pi\s*(\d)/g, 'pi * $1')
    .replace(/e\s*(\d)/g, 'e * $1')
    .replace(/(\d)\s*(sin|cos|tan|sqrt|log|ln)/g, '$1 * $2')
    .replace(/\)\s*\(/g, ') * (')
    .replace(/\)\s*(\d)/g, ') * $1')
    .replace(/pi\s*pi/g, 'pi * pi')
    .replace(/e\s*e/g, 'e * e');

  // 2. Tokenize string sequence
  const tokens: string[] = [];
  let i = 0;
  while (i < cleanExpr.length) {
    const char = cleanExpr[i];
    
    if (/\s/.test(char)) {
      i++;
      continue;
    }
    
    // Scan numeric literal (integers & decimals)
    if (/[0-9.]/.test(char)) {
      let numStr = '';
      while (i < cleanExpr.length && /[0-9.]/.test(cleanExpr[i])) {
        numStr += cleanExpr[i];
        i++;
      }
      tokens.push(numStr);
      continue;
    }
    
    // Scan alphabetic words (operators & constants)
    if (/[a-zA-Z]/.test(char)) {
      let word = '';
      while (i < cleanExpr.length && /[a-zA-Z0-9]/.test(cleanExpr[i])) {
        word += cleanExpr[i];
        i++;
      }
      tokens.push(word);
      continue;
    }
    
    // Capture single math symbols
    if (['+', '-', '*', '/', '^', '!', '(', ')', '%'].includes(char)) {
      tokens.push(char);
      i++;
      continue;
    }
    
    // Unmapped fallback
    i++;
  }
  
  // 3. Mark unary minuses vs standard binary subtraction ops, and swap constants
  const processedTokens: string[] = [];
  for (let idx = 0; idx < tokens.length; idx++) {
    const token = tokens[idx];
    const prev = idx > 0 ? processedTokens[idx - 1] : null;
    
    if (token === '-' && (prev === null || prev === '(' || ['+', '-', '*', '/', '^', '%'].includes(prev))) {
      processedTokens.push('unary_minus_op');
    } else if (token === 'pi') {
      processedTokens.push(Math.PI.toString());
    } else if (token === 'e') {
      processedTokens.push(Math.E.toString());
    } else {
      processedTokens.push(token);
    }
  }
  
  // 4. Shunting-Yard parser setup
  const outputQueue: string[] = [];
  const operatorStack: string[] = [];
  
  const precedence: Record<string, number> = {
    '+': 1,
    '-': 1,
    '*': 2,
    '/': 2,
    '%': 2,
    '^': 3,
    'unary_minus_op': 4
  };
  
  const associativity: Record<string, 'L' | 'R'> = {
    '+': 'L',
    '-': 'L',
    '*': 'L',
    '/': 'L',
    '%': 'L',
    '^': 'R',
    'unary_minus_op': 'R'
  };
  
  const isFunction = (t: string) => ['sin', 'cos', 'tan', 'sqrt', 'log', 'ln'].includes(t);
  const isOperator = (t: string) => ['+', '-', '*', '/', '%', '^', 'unary_minus_op'].includes(t);
  
  for (const token of processedTokens) {
    if (!isNaN(parseFloat(token))) {
      outputQueue.push(token);
    } else if (isFunction(token)) {
      operatorStack.push(token);
    } else if (token === '!') {
      // Postfix Factorial - process with extreme high priority
      outputQueue.push('!');
    } else if (isOperator(token)) {
      while (operatorStack.length > 0) {
        const top = operatorStack[operatorStack.length - 1];
        if (isOperator(top)) {
          const pToken = precedence[token];
          const pTop = precedence[top];
          const assoc = associativity[token];
          
          if ((assoc === 'L' && pToken <= pTop) || (assoc === 'R' && pToken < pTop)) {
            outputQueue.push(operatorStack.pop()!);
          } else {
            break;
          }
        } else if (isFunction(top)) {
          outputQueue.push(operatorStack.pop()!);
        } else {
          break;
        }
      }
      operatorStack.push(token);
    } else if (token === '(') {
      operatorStack.push(token);
    } else if (token === ')') {
      let matched = false;
      while (operatorStack.length > 0) {
        const top = operatorStack[operatorStack.length - 1];
        if (top === '(') {
          operatorStack.pop();
          matched = true;
          break;
        } else {
          outputQueue.push(operatorStack.pop()!);
        }
      }
      if (operatorStack.length > 0 && isFunction(operatorStack[operatorStack.length - 1])) {
        outputQueue.push(operatorStack.pop()!);
      }
    }
  }
  
  while (operatorStack.length > 0) {
    const top = operatorStack.pop()!;
    if (top === '(' || top === ')') {
      throw new Error('Mismatched Parentheses');
    }
    outputQueue.push(top);
  }
  
  // 5. Evaluate RPN Output Stack
  const evalStack: number[] = [];
  
  const calcFactorial = (n: number): number => {
    if (n < 0 || isNaN(n)) return NaN;
    if (n === 0 || n === 1) return 1;
    let res = 1;
    const capped = Math.min(Math.floor(n), 100); // Guard stack limit
    for (let k = 2; k <= capped; k++) res *= k;
    return res;
  };
  
  for (const token of outputQueue) {
    if (!isNaN(parseFloat(token))) {
      evalStack.push(parseFloat(token));
    } else if (token === '!') {
      const v = evalStack.pop();
      if (v === undefined) throw new Error('Stack Underflow');
      evalStack.push(calcFactorial(v));
    } else if (token === 'unary_minus_op') {
      const v = evalStack.pop();
      if (v === undefined) throw new Error('Stack Underflow');
      evalStack.push(-v);
    } else if (isFunction(token)) {
      const arg = evalStack.pop();
      if (arg === undefined) throw new Error('Stack Underflow');
      
      let res = 0;
      switch (token) {
        case 'sin':
          const sinAngle = angleMode === 'DEG' ? (arg * Math.PI) / 180 : arg;
          res = Math.sin(sinAngle);
          if (Math.abs(res) < 1e-14) res = 0;
          break;
        case 'cos':
          const cosAngle = angleMode === 'DEG' ? (arg * Math.PI) / 180 : arg;
          res = Math.cos(cosAngle);
          if (Math.abs(res) < 1e-14) res = 0;
          break;
        case 'tan':
          const tanAngle = angleMode === 'DEG' ? (arg * Math.PI) / 180 : arg;
          res = Math.tan(tanAngle);
          if (Math.abs(res) < 1e-14) res = 0;
          break;
        case 'sqrt':
          if (arg < 0) throw new Error('Root domain error');
          res = Math.sqrt(arg);
          break;
        case 'log':
          if (arg <= 0) throw new Error('Log domain error');
          res = Math.log10(arg);
          break;
        case 'ln':
          if (arg <= 0) throw new Error('Ln domain error');
          res = Math.log(arg);
          break;
      }
      evalStack.push(res);
    } else {
      // Binary calculation
      const bVal = evalStack.pop();
      const aVal = evalStack.pop();
      if (aVal === undefined || bVal === undefined) throw new Error('Stack Underflow');
      
      let res = 0;
      switch (token) {
        case '+': res = aVal + bVal; break;
        case '-': res = aVal - bVal; break;
        case '*': res = aVal * bVal; break;
        case '/':
          if (bVal === 0) throw new Error('Division by zero');
          res = aVal / bVal;
          break;
        case '%': res = aVal % bVal; break;
        case '^': res = Math.pow(aVal, bVal); break;
      }
      evalStack.push(res);
    }
  }
  
  if (evalStack.length !== 1) {
    throw new Error('Malformed parsing');
  }
  
  // Standardize float decimals down to safe precision
  return Math.round(evalStack[0] * 100000000) / 100000000;
}

export default function NormalCalculator({ layoutMode = 'scroll', onAddHistory }: ComponentProps) {
  const [activeCalType, setActiveCalType] = useState<'basic' | 'scientific'>('basic');
  const [copied, setCopied] = useState<boolean>(false);

  // --- STATE FOR BASIC MODE (Traditional Sequential memory calculator style) ---
  const [basicDisplay, setBasicDisplay] = useState<string>('0');
  const [basicEquation, setBasicEquation] = useState<string>('');
  const [basicIsFinished, setBasicIsFinished] = useState<boolean>(false);
  const [memory, setMemory] = useState<number>(0);
  const [hasMemory, setHasMemory] = useState<boolean>(false);

  // --- STATE FOR SCIENTIFIC MODE (Modern Casio formula-based parser) ---
  const [sciExpr, setSciExpr] = useState<string>('');
  const [sciDisplay, setSciDisplay] = useState<string>('0');
  const [sciIsEvaluated, setSciIsEvaluated] = useState<boolean>(false);
  const [sciLiveResult, setSciLiveResult] = useState<string>('');
  const [angleMode, setAngleMode] = useState<'DEG' | 'RAD'>('DEG');

  // --- SCIENTIFIC LIVE PREVIEW COMPILER EFFECT ---
  useEffect(() => {
    if (!sciExpr.trim()) {
      setSciLiveResult('');
      return;
    }
    try {
      // Intelligently auto-close active parentheses to compute beautiful live estimates
      let testExpr = sciExpr;
      const openBrackets = (testExpr.match(/\(/g) || []).length;
      const closeBrackets = (testExpr.match(/\)/g) || []).length;
      if (openBrackets > closeBrackets) {
        testExpr += ')'.repeat(openBrackets - closeBrackets);
      }
      
      const computed = evaluateExpression(testExpr, angleMode);
      if (!isNaN(computed) && isFinite(computed)) {
        setSciLiveResult(computed.toString());
      } else {
        setSciLiveResult('');
      }
    } catch {
      setSciLiveResult('');
    }
  }, [sciExpr, angleMode]);

  // --- HANDLERS FOR BASIC MODE ---
  const handleBasicClear = () => {
    setBasicDisplay('0');
    setBasicEquation('');
    setBasicIsFinished(false);
  };

  const handleMemoryStore = () => {
    const val = parseFloat(basicDisplay);
    if (!isNaN(val)) {
      setMemory(val);
      setHasMemory(true);
      setBasicIsFinished(true);
    }
  };

  const handleMemoryRecall = () => {
    if (hasMemory) {
      setBasicDisplay(memory.toString());
      setBasicIsFinished(true);
    }
  };

  const handleMemoryClear = () => {
    setMemory(0);
    setHasMemory(false);
  };

  const handleMemoryPlus = () => {
    const val = parseFloat(basicDisplay);
    if (!isNaN(val)) {
      const result = memory + val;
      setMemory(Math.round(result * 10000000) / 10000000);
      setHasMemory(true);
      setBasicIsFinished(true);
    }
  };

  const handleBasicNum = (num: string) => {
    if (basicDisplay === '0' || basicIsFinished) {
      setBasicDisplay(num);
      setBasicIsFinished(false);
    } else {
      setBasicDisplay(basicDisplay + num);
    }
  };

  const handleBasicDecimal = () => {
    if (basicIsFinished) {
      setBasicDisplay('0.');
      setBasicIsFinished(false);
      return;
    }
    if (!basicDisplay.includes('.')) {
      setBasicDisplay(basicDisplay + '.');
    }
  };

  const handleBasicOperator = (op: string) => {
    setBasicIsFinished(false);
    let curEq = basicEquation;
    if (basicIsFinished) {
      curEq = '';
    }
    const last = curEq.trim().slice(-1);
    const opDisplay = op === '*' ? '×' : op === '/' ? '÷' : op;
    
    if (['+', '-', '×', '÷'].includes(last) && basicDisplay === '0') {
      setBasicEquation(curEq.trim().slice(0, -1) + ' ' + opDisplay + ' ');
    } else {
      const basicDisplayWithMulDivSymbols = basicDisplay;
      setBasicEquation((curEq ? curEq + ' ' : '') + basicDisplayWithMulDivSymbols + ' ' + opDisplay + ' ');
      setBasicDisplay('0');
    }
  };

  const handleBasicDelete = () => {
    if (basicIsFinished) {
      handleBasicClear();
      return;
    }
    if (basicDisplay.length > 1) {
      setBasicDisplay(basicDisplay.slice(0, -1));
    } else {
      setBasicDisplay('0');
    }
  };

  const handleBasicToggleSign = () => {
    if (basicDisplay !== '0') {
      if (basicDisplay.startsWith('-')) {
        setBasicDisplay(basicDisplay.slice(1));
      } else {
        setBasicDisplay('-' + basicDisplay);
      }
    }
  };

  const handleBasicPercentage = () => {
    const val = parseFloat(basicDisplay);
    if (!isNaN(val)) {
      setBasicDisplay((val / 100).toString());
    }
  };

  const handleBasicEqual = () => {
    if (!basicEquation) return;
    const preppedEquation = basicEquation
      .replace(/×/g, '*')
      .replace(/÷/g, '/');
    const fullExpr = preppedEquation + basicDisplay;

    try {
      const res = evaluateExpression(fullExpr, 'DEG');
      const originalEquation = basicEquation + ' ' + basicDisplay;
      setBasicEquation(basicEquation + ' ' + basicDisplay + ' =');
      setBasicDisplay(res.toString());
      setBasicIsFinished(true);
      onAddHistory?.('NORMAL_CALC', 'Basic Calculator', originalEquation, res.toString());
    } catch {
      setBasicDisplay('Error');
      setBasicEquation('');
      setBasicIsFinished(true);
    }
  };

  // --- HANDLERS FOR SCIENTIFIC MODE ---
  const handleSciClear = () => {
    setSciExpr('');
    setSciDisplay('0');
    setSciIsEvaluated(false);
    setSciLiveResult('');
  };

  const handleSciDelete = () => {
    if (sciIsEvaluated) {
      handleSciClear();
      return;
    }
    setSciExpr((prev) => {
      if (!prev) return '';
      // Delete functions as single blocks for intuitive writing experience
      if (prev.endsWith('sqrt(')) return prev.slice(0, -5);
      if (prev.endsWith('sin(')) return prev.slice(0, -4);
      if (prev.endsWith('cos(')) return prev.slice(0, -4);
      if (prev.endsWith('tan(')) return prev.slice(0, -4);
      if (prev.endsWith('log(')) return prev.slice(0, -4);
      if (prev.endsWith('ln(')) return prev.slice(0, -3);
      // Remove trailing space after operators
      if (prev.endsWith(' ')) return prev.slice(0, -1).trim();
      return prev.slice(0, -1);
    });
  };

  const handleSciNumOrConstant = (val: string) => {
    if (sciIsEvaluated) {
      setSciExpr(val);
      setSciIsEvaluated(false);
    } else {
      setSciExpr((prev) => prev + val);
    }
  };

  const handleSciOperator = (op: string) => {
    const opVal = op === '*' ? '×' : op === '/' ? '÷' : op;
    if (sciIsEvaluated) {
      // Continue chaining with past result
      setSciExpr(sciDisplay + ' ' + opVal + ' ');
      setSciIsEvaluated(false);
    } else {
      setSciExpr((prev) => prev + ' ' + opVal + ' ');
    }
  };

  const handleSciFunction = (fn: string) => {
    if (sciIsEvaluated) {
      setSciExpr(fn + '(');
      setSciIsEvaluated(false);
    } else {
      setSciExpr((prev) => prev + fn + '(');
    }
  };

  const handleSciPercentAndFactorial = (symbol: string) => {
    // Appends to target
    if (sciIsEvaluated) {
      setSciExpr(sciDisplay + symbol);
      setSciIsEvaluated(false);
    } else {
      setSciExpr((prev) => prev + symbol);
    }
  };

  const handleSciEqual = () => {
    if (!sciExpr.trim()) return;
    try {
      // Intelligently patch open brackets
      let actualExpr = sciExpr;
      const openCount = (actualExpr.match(/\(/g) || []).length;
      const closeCount = (actualExpr.match(/\)/g) || []).length;
      if (openCount > closeCount) {
        actualExpr += ')'.repeat(openCount - closeCount);
        setSciExpr(actualExpr);
      }

      const res = evaluateExpression(actualExpr, angleMode);
      if (isNaN(res)) {
        setSciDisplay('Error');
      } else {
        setSciDisplay(res.toString());
        setSciIsEvaluated(true);
        onAddHistory?.('NORMAL_CALC', `Scientific Calc (${angleMode})`, actualExpr, res.toString());
      }
    } catch {
      setSciDisplay('Error');
    }
  };

  // --- GENERAL FUNCTIONS ---
  const activeDisplay = activeCalType === 'basic' ? basicDisplay : sciIsEvaluated ? sciDisplay : sciExpr || '0';
  const activeEquation = activeCalType === 'basic' ? basicEquation : sciIsEvaluated ? sciExpr + ' =' : '';

  const handleCopy = () => {
    const textToCopy = activeCalType === 'basic' ? basicDisplay : sciDisplay;
    if (textToCopy === 'Error') return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className={`bg-white dark:bg-stone-900 rounded-3xl shadow-lg border border-gray-250/90 dark:border-stone-800 transition-all ${
      layoutMode === 'scroll' ? 'p-5 xs:p-6 mb-2 space-y-4' : 'p-3.5 xs:p-4 space-y-3'
    }`}>
      
      {/* 1. DUAL MODE COMPONENT PILL SWITCH (Strict separation design) */}
      <div className="flex bg-gray-50 dark:bg-stone-950 p-1 rounded-xl border border-gray-100 dark:border-stone-850 shadow-inner">
        <button
          onClick={() => setActiveCalType('basic')}
          className={`flex-1 py-1.5 text-[10px] font-black rounded-lg flex items-center justify-center gap-1.5 transition-all outline-none ${
            activeCalType === 'basic'
              ? 'bg-yellow-400 text-white shadow-xs'
              : 'text-gray-400 dark:text-stone-450 hover:text-yellow-950 dark:hover:text-yellow-400 bg-transparent'
          }`}
        >
          <span>BASIC CALC</span>
        </button>
        <button
          onClick={() => setActiveCalType('scientific')}
          className={`flex-1 py-1.5 text-[10px] font-black rounded-lg flex items-center justify-center gap-1.5 transition-all outline-none ${
            activeCalType === 'scientific'
              ? 'bg-yellow-400 text-white shadow-xs'
              : 'text-gray-400 dark:text-stone-450 hover:text-yellow-955 dark:hover:text-yellow-400 bg-transparent'
          }`}
        >
          <span>SCIENTIFIC CALC</span>
        </button>
      </div>

      {/* 2. PREMIUM DIGITAL LCD DISPLAY BOARD */}
      <div className={`bg-yellow-50/40 dark:bg-stone-950/40 rounded-2xl text-right flex flex-col justify-end border border-yellow-101/30 dark:border-stone-850 relative group transition-all ${
        layoutMode === 'scroll' ? 'p-4 mb-2.5 min-h-[110px] sm:min-h-[125px]' : 'p-3.5 mb-2 min-h-[92px]'
      }`}>
        {/* Copy Trigger */}
        <button
          onClick={handleCopy}
          className={`absolute left-2.5 top-2.5 rounded-lg bg-white dark:bg-stone-850 hover:bg-yellow-50 dark:hover:bg-stone-800 font-bold text-gray-400 dark:text-stone-400 transition-all outline-none border border-yellow-101/20 dark:border-stone-800 flex items-center gap-1 active:scale-95 shadow-2xs ${
            layoutMode === 'scroll' ? 'p-1.5 px-2.5 text-xs' : 'p-1 px-1.5 text-[9px]'
          }`}
          title="Copy displayed output"
        >
          {copied ? (
            <>
              <Check size={layoutMode === 'scroll' ? 12 : 11} className="text-green-600 dark:text-green-450" />
              <span className={`text-green-600 dark:text-green-450 font-bold ${layoutMode === 'scroll' ? 'text-xs' : 'text-[9px]'}`}>Copied!</span>
            </>
          ) : (
            <>
              <Copy size={layoutMode === 'scroll' ? 12 : 11} className="text-gray-400 dark:text-stone-400" />
              <span className={layoutMode === 'scroll' ? 'text-xs' : 'text-[9px]'}>Copy</span>
            </>
          )}
        </button>

        {/* Live preview and Angle state notifications top-right */}
        {activeCalType === 'scientific' && (
          <div className="absolute right-3 top-2 flex items-center gap-2 font-mono text-[9px] font-black uppercase text-amber-600 dark:text-amber-500">
            {sciLiveResult && !sciIsEvaluated && (
              <span className="opacity-70 animate-pulse">Live: = {sciLiveResult}</span>
            )}
            <span className="bg-amber-100 dark:bg-amber-950/50 px-1.5 py-0.5 rounded text-amber-700 dark:text-amber-400 select-none">
              {angleMode}
            </span>
          </div>
        )}

        {/* Memory Indicator Top-Right for Basic Mode */}
        {activeCalType === 'basic' && hasMemory && (
          <div className="absolute right-3 top-2.5 flex items-center gap-1.5 font-mono text-[9px] xs:text-[10px] font-black uppercase text-amber-700 dark:text-amber-400 bg-amber-100/60 dark:bg-amber-950/40 px-1.5 py-0.5 rounded-md select-none animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
            <span>M = {memory}</span>
          </div>
        )}

        {/* History / Step equation display */}
        <div className={`font-mono font-bold text-yellow-700/60 dark:text-yellow-600/40 break-all overflow-hidden ${
          layoutMode === 'scroll' ? 'text-sm mb-1.5 h-6' : 'text-[11px] h-4.5'
        }`}>
          {activeEquation}
        </div>

        {/* Primary LCD screen value (scrolling container to assist massive equations values) */}
        <div className="truncate-container overflow-x-auto scrollbar-none scroll-smooth">
          <div className={`font-black tracking-tight text-gray-800 dark:text-stone-100 break-all select-all focus:outline-none leading-none select-none ${
            activeCalType === 'scientific' && !sciIsEvaluated
              ? 'font-mono text-xl xs:text-2xl sm:text-3xl font-bold py-1 overflow-x-auto text-yellow-905 dark:text-yellow-405'
              : layoutMode === 'scroll' ? 'text-4xl xs:text-5xl py-1' : 'text-2xl xs:text-3xl'
          }`}>
            {activeCalType === 'scientific' && sciIsEvaluated ? sciDisplay : activeDisplay}
          </div>
        </div>
      </div>

      {/* 3. KEYBOARD MATRIX PANEL */}
      {activeCalType === 'basic' ? (
        // --- TRADITIONAL BASIC KEYPAD ---
        <div className={`grid grid-cols-4 ${layoutMode === 'scroll' ? 'gap-2.5' : 'gap-2'}`}>
          {/* Memory Keys Row */}
          <button
            onClick={handleMemoryClear}
            className={`h-9 xs:h-10 text-xs font-extrabold rounded-xl border transition-all active:scale-95 cursor-pointer ${
              hasMemory 
                ? 'bg-amber-500/10 hover:bg-amber-100/50 text-amber-700 dark:text-amber-400 border-amber-200/40 dark:border-stone-800' 
                : 'bg-gray-50/50 dark:bg-stone-900/40 text-gray-400 dark:text-stone-600 border-gray-150/40 dark:border-stone-850'
            }`}
            title="Memory Clear"
          >
            MC
          </button>
          <button
            onClick={handleMemoryRecall}
            className={`h-9 xs:h-10 text-xs font-extrabold rounded-xl border transition-all active:scale-95 cursor-pointer ${
              hasMemory 
                ? 'bg-amber-500/10 hover:bg-amber-100/50 text-amber-700 dark:text-amber-400 border-amber-200/40 dark:border-stone-800 font-black' 
                : 'bg-gray-50/50 dark:bg-stone-900/40 text-gray-400 dark:text-stone-600 border-gray-150/40 dark:border-stone-850'
            }`}
            title="Memory Recall"
          >
            MR
          </button>
          <button
            onClick={handleMemoryPlus}
            className="h-9 xs:h-10 text-xs font-extrabold bg-amber-500/10 hover:bg-amber-100/50 text-amber-700 dark:text-amber-400 border border-amber-200/40 dark:border-stone-800 rounded-xl transition-all active:scale-95 cursor-pointer"
            title="Memory Plus (Add to memory)"
          >
            M+
          </button>
          <button
            onClick={handleMemoryStore}
            className="h-9 xs:h-10 text-xs font-extrabold bg-amber-500/10 hover:bg-amber-100/50 text-amber-700 dark:text-amber-400 border border-amber-200/40 dark:border-stone-800 rounded-xl transition-all active:scale-95 cursor-pointer"
            title="Memory Store"
          >
            MS
          </button>

          {/* Row 1 */}
          <button
            onClick={handleBasicClear}
            className="h-11 xs:h-12 text-xs font-black uppercase bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-450 hover:bg-red-100 rounded-xl transition-colors active:scale-95"
          >
            AC
          </button>
          <button
            onClick={handleBasicToggleSign}
            className="h-11 xs:h-12 text-sm font-black bg-gray-50 dark:bg-stone-850 text-gray-700 dark:text-stone-300 hover:bg-yellow-50 dark:hover:bg-stone-800 rounded-xl transition-colors active:scale-95"
          >
            ±
          </button>
          <button
            onClick={handleBasicPercentage}
            className="h-11 xs:h-12 text-sm font-black bg-gray-50 dark:bg-stone-850 text-gray-700 dark:text-stone-300 hover:bg-yellow-50 dark:hover:bg-stone-800 rounded-xl transition-colors active:scale-95"
          >
            <Percent size={14} className="mx-auto" />
          </button>
          <button
            onClick={() => handleBasicOperator('/')}
            className="h-11 xs:h-12 text-white bg-yellow-400 hover:bg-yellow-500 rounded-xl transition-colors active:scale-95 flex items-center justify-center"
          >
            <Divide size={16} />
          </button>

          {/* Row 2 */}
          <button
            onClick={() => handleBasicNum('7')}
            className="h-11 xs:h-12 text-base font-black bg-gray-100/50 dark:bg-stone-850/50 text-gray-700 dark:text-stone-300 hover:bg-yellow-50 dark:hover:bg-stone-800 rounded-xl transition-all active:scale-95"
          >
            7
          </button>
          <button
            onClick={() => handleBasicNum('8')}
            className="h-11 xs:h-12 text-base font-black bg-gray-100/50 dark:bg-stone-850/50 text-gray-700 dark:text-stone-300 hover:bg-yellow-50 dark:hover:bg-stone-800 rounded-xl transition-all active:scale-95"
          >
            8
          </button>
          <button
            onClick={() => handleBasicNum('9')}
            className="h-11 xs:h-12 text-base font-black bg-gray-100/50 dark:bg-stone-850/50 text-gray-700 dark:text-stone-300 hover:bg-yellow-50 dark:hover:bg-stone-800 rounded-xl transition-all active:scale-95"
          >
            9
          </button>
          <button
            onClick={() => handleBasicOperator('*')}
            className="h-11 xs:h-12 text-white bg-yellow-400 hover:bg-yellow-500 rounded-xl transition-colors active:scale-95 flex items-center justify-center"
          >
            <X size={15} />
          </button>

          {/* Row 3 */}
          <button
            onClick={() => handleBasicNum('4')}
            className="h-11 xs:h-12 text-base font-black bg-gray-100/50 dark:bg-stone-850/50 text-gray-700 dark:text-stone-300 hover:bg-yellow-50 dark:hover:bg-stone-800 rounded-xl transition-all active:scale-95"
          >
            4
          </button>
          <button
            onClick={() => handleBasicNum('5')}
            className="h-11 xs:h-12 text-base font-black bg-gray-100/50 dark:bg-stone-850/50 text-gray-700 dark:text-stone-300 hover:bg-yellow-50 dark:hover:bg-stone-800 rounded-xl transition-all active:scale-95"
          >
            5
          </button>
          <button
            onClick={() => handleBasicNum('6')}
            className="h-11 xs:h-12 text-base font-black bg-gray-100/50 dark:bg-stone-850/50 text-gray-700 dark:text-stone-300 hover:bg-yellow-50 dark:hover:bg-stone-800 rounded-xl transition-all active:scale-95"
          >
            6
          </button>
          <button
            onClick={() => handleBasicOperator('-')}
            className="h-11 xs:h-12 text-white bg-yellow-400 hover:bg-yellow-500 rounded-xl transition-colors active:scale-95 flex items-center justify-center"
          >
            <Minus size={16} />
          </button>

          {/* Row 4 */}
          <button
            onClick={() => handleBasicNum('1')}
            className="h-11 xs:h-12 text-base font-black bg-gray-100/50 dark:bg-stone-850/50 text-gray-700 dark:text-stone-300 hover:bg-yellow-50 dark:hover:bg-stone-800 rounded-xl transition-all active:scale-95"
          >
            1
          </button>
          <button
            onClick={() => handleBasicNum('2')}
            className="h-11 xs:h-12 text-base font-black bg-gray-100/50 dark:bg-stone-850/50 text-gray-700 dark:text-stone-300 hover:bg-yellow-50 dark:hover:bg-stone-800 rounded-xl transition-all active:scale-95"
          >
            2
          </button>
          <button
            onClick={() => handleBasicNum('3')}
            className="h-11 xs:h-12 text-base font-black bg-gray-100/50 dark:bg-stone-850/50 text-gray-700 dark:text-stone-300 hover:bg-yellow-50 dark:hover:bg-stone-800 rounded-xl transition-all active:scale-95"
          >
            3
          </button>
          <button
            onClick={() => handleBasicOperator('+')}
            className="h-11 xs:h-12 text-white bg-yellow-400 hover:bg-yellow-500 rounded-xl transition-colors active:scale-95 flex items-center justify-center"
          >
            <Plus size={16} />
          </button>

          {/* Row 5 */}
          <button
            onClick={() => handleBasicNum('0')}
            className="h-11 xs:h-12 text-base font-black bg-gray-100/50 dark:bg-stone-850/50 text-gray-700 dark:text-stone-300 hover:bg-yellow-50 dark:hover:bg-stone-800 rounded-xl transition-all active:scale-95"
          >
            0
          </button>
          <button
            onClick={handleBasicDecimal}
            className="h-11 xs:h-12 text-lg font-black bg-gray-105 dark:bg-stone-850 text-gray-700 dark:text-stone-300 hover:bg-yellow-50 dark:hover:bg-stone-800 rounded-xl transition-colors active:scale-95"
          >
            .
          </button>
          <button
            onClick={handleBasicDelete}
            title="Delete character"
            className="h-11 xs:h-12 text-gray-655 dark:text-stone-400 bg-gray-100/80 dark:bg-stone-850/80 hover:bg-gray-150 rounded-xl transition-colors active:scale-95 flex items-center justify-center"
          >
            <Delete size={18} />
          </button>
          <button
            onClick={handleBasicEqual}
            className="h-11 xs:h-12 text-white bg-yellow-500 hover:bg-yellow-600 rounded-xl transition-shadow shadow-xs hover:shadow-md flex items-center justify-center"
          >
            <span className="text-xl font-black font-sans leading-none">=</span>
          </button>
        </div>
      ) : (
        // --- ADVANCED SCIENTIFIC KEYPAD (Genuinely practical, 5-column aligned grids) ---
        <div className="space-y-3">
          {/* Angle settings strip */}
          <div className="flex justify-between items-center bg-gray-50 dark:bg-stone-950 p-1.5 rounded-xl border border-gray-100 dark:border-stone-850">
            <span className="text-[9px] font-black text-gray-400 dark:text-stone-500 uppercase tracking-wider block ml-1.5">
              TRIGONOMETRY ANGLE MODE:
            </span>
            <div className="flex bg-white dark:bg-stone-850 rounded-lg p-0.5 border border-gray-100 dark:border-stone-800">
              <button
                onClick={() => setAngleMode('DEG')}
                className={`px-2 py-0.5 text-[8.5px] font-black rounded transition-all outline-none ${
                  angleMode === 'DEG'
                    ? 'bg-yellow-400 text-white shadow-xs'
                    : 'text-gray-400 dark:text-stone-450 hover:text-gray-600'
                }`}
              >
                DEGREES (°)
              </button>
              <button
                onClick={() => setAngleMode('RAD')}
                className={`px-2 py-0.5 text-[8.5px] font-black rounded transition-all outline-none ${
                  angleMode === 'RAD'
                    ? 'bg-yellow-400 text-white shadow-xs'
                    : 'text-gray-400 dark:text-stone-450 hover:text-gray-600'
                }`}
              >
                RADIANS
              </button>
            </div>
          </div>

          <div className={`grid grid-cols-5 ${layoutMode === 'scroll' ? 'gap-2' : 'gap-1.5'}`}>
            {/* ROW 1 (SPECIAL FUNCTIONS) */}
            <button
              onClick={() => handleSciFunction('sin')}
              className="h-9 font-mono text-[10px] font-black bg-amber-500/10 dark:bg-amber-400/5 text-amber-700 dark:text-amber-400 border border-amber-200/40 rounded-lg hover:bg-amber-100/50 active:scale-95 transition-all text-center"
            >
              sin
            </button>
            <button
              onClick={() => handleSciFunction('cos')}
              className="h-9 font-mono text-[10px] font-black bg-amber-500/10 dark:bg-amber-400/5 text-amber-700 dark:text-amber-400 border border-amber-200/40 rounded-lg hover:bg-amber-100/50 active:scale-95 transition-all text-center"
            >
              cos
            </button>
            <button
              onClick={() => handleSciFunction('tan')}
              className="h-9 font-mono text-[10px] font-black bg-amber-500/10 dark:bg-amber-400/5 text-amber-700 dark:text-amber-400 border border-amber-200/40 rounded-lg hover:bg-amber-100/50 active:scale-95 transition-all text-center"
            >
              tan
            </button>
            <button
              onClick={() => handleSciOperator('^')}
              className="h-9 font-mono text-xs font-black bg-amber-500/10 dark:bg-amber-400/5 text-amber-700 dark:text-amber-400 border border-amber-200/40 rounded-lg hover:bg-amber-100/50 active:scale-95 transition-all text-center"
              title="Power x^y"
            >
              x^y
            </button>
            <button
              onClick={() => handleSciPercentAndFactorial('!')}
              className="h-9 font-mono text-xs font-black bg-amber-500/10 dark:bg-amber-400/5 text-amber-700 dark:text-amber-400 border border-amber-200/40 rounded-lg hover:bg-amber-100/50 active:scale-95 transition-all text-center"
              title="Factorial"
            >
              x!
            </button>

            {/* ROW 2 (SPECIAL FUNCTIONS) */}
            <button
              onClick={() => handleSciFunction('sqrt')}
              className="h-9 font-mono text-[11px] font-black bg-amber-500/10 dark:bg-amber-400/5 text-amber-700 dark:text-amber-400 border border-amber-200/40 rounded-lg hover:bg-amber-100/50 active:scale-95 transition-all text-center"
              title="Square Root"
            >
              √x
            </button>
            <button
              onClick={() => handleSciFunction('log')}
              className="h-9 font-mono text-[10px] font-black bg-amber-500/10 dark:bg-amber-400/5 text-amber-700 dark:text-amber-400 border border-amber-200/40 rounded-lg hover:bg-amber-100/50 active:scale-95 transition-all text-center"
              title="Log base 10"
            >
              log₁₀
            </button>
            <button
              onClick={() => handleSciNumOrConstant('(')}
              className="h-9 font-mono text-xs font-black bg-gray-50 dark:bg-stone-850 text-gray-600 dark:text-stone-400 border border-gray-200/50 dark:border-stone-800 rounded-lg hover:bg-gray-100 active:scale-95 transition-all text-center"
            >
              (
            </button>
            <button
              onClick={() => handleSciNumOrConstant(')')}
              className="h-9 font-mono text-xs font-black bg-gray-50 dark:bg-stone-850 text-gray-600 dark:text-stone-400 border border-gray-200/50 dark:border-stone-800 rounded-lg hover:bg-gray-100 active:scale-95 transition-all text-center"
            >
              )
            </button>
            <button
              onClick={() => handleSciNumOrConstant('π')}
              className="h-9 font-mono text-xs font-black bg-gray-50 dark:bg-stone-850 text-gray-600 dark:text-stone-400 border border-gray-200/50 dark:border-stone-800 rounded-lg hover:bg-gray-100 active:scale-95 transition-all text-center"
              title="Pi constant"
            >
              π
            </button>

            {/* ROW 3 */}
            <button
              onClick={() => handleSciNumOrConstant('7')}
              className="h-10 xs:h-11 text-sm font-black bg-gray-100/50 dark:bg-stone-850/50 text-gray-700 dark:text-stone-300 hover:bg-yellow-50 dark:hover:bg-stone-800 rounded-xl transition-all active:scale-95"
            >
              7
            </button>
            <button
              onClick={() => handleSciNumOrConstant('8')}
              className="h-10 xs:h-11 text-sm font-black bg-gray-100/50 dark:bg-stone-850/50 text-gray-700 dark:text-stone-300 hover:bg-yellow-50 dark:hover:bg-stone-800 rounded-xl transition-all active:scale-95"
            >
              8
            </button>
            <button
              onClick={() => handleSciNumOrConstant('9')}
              className="h-10 xs:h-11 text-sm font-black bg-gray-100/50 dark:bg-stone-850/50 text-gray-700 dark:text-stone-300 hover:bg-yellow-50 dark:hover:bg-stone-800 rounded-xl transition-all active:scale-95"
            >
              9
            </button>
            <button
              onClick={() => handleSciOperator('/')}
              className="h-10 xs:h-11 text-white bg-yellow-400 hover:bg-yellow-500 rounded-xl transition-colors active:scale-95 flex items-center justify-center font-black"
            >
              ÷
            </button>
            <button
              onClick={handleSciClear}
              className="h-10 xs:h-11 text-xs font-black bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200/20 rounded-xl hover:bg-red-100 transition-colors active:scale-95 uppercase flex items-center justify-center"
            >
              AC
            </button>

            {/* ROW 4 */}
            <button
              onClick={() => handleSciNumOrConstant('4')}
              className="h-10 xs:h-11 text-sm font-black bg-gray-100/50 dark:bg-stone-850/50 text-gray-700 dark:text-stone-300 hover:bg-yellow-50 dark:hover:bg-stone-800 rounded-xl transition-all active:scale-95"
            >
              4
            </button>
            <button
              onClick={() => handleSciNumOrConstant('5')}
              className="h-10 xs:h-11 text-sm font-black bg-gray-100/50 dark:bg-stone-850/50 text-gray-700 dark:text-stone-300 hover:bg-yellow-50 dark:hover:bg-stone-800 rounded-xl transition-all active:scale-95"
            >
              5
            </button>
            <button
              onClick={() => handleSciNumOrConstant('6')}
              className="h-10 xs:h-11 text-sm font-black bg-gray-100/50 dark:bg-stone-850/50 text-gray-700 dark:text-stone-300 hover:bg-yellow-50 dark:hover:bg-stone-800 rounded-xl transition-all active:scale-95"
            >
              6
            </button>
            <button
              onClick={() => handleSciOperator('*')}
              className="h-10 xs:h-11 text-white bg-yellow-400 hover:bg-yellow-500 rounded-xl transition-colors active:scale-95 flex items-center justify-center font-black"
            >
              ×
            </button>
            <button
              onClick={handleSciDelete}
              className="h-10 xs:h-11 text-gray-655 dark:text-stone-400 bg-gray-100/80 dark:bg-stone-850/80 border border-gray-205/30 rounded-xl hover:bg-gray-150 transition-colors active:scale-95 flex items-center justify-center"
              title="Backspace character"
            >
              <Delete size={16} />
            </button>

            {/* ROW 5 */}
            <button
              onClick={() => handleSciNumOrConstant('1')}
              className="h-10 xs:h-11 text-sm font-black bg-gray-100/50 dark:bg-stone-850/50 text-gray-700 dark:text-stone-300 hover:bg-yellow-50 dark:hover:bg-stone-800 rounded-xl transition-all active:scale-95"
            >
              1
            </button>
            <button
              onClick={() => handleSciNumOrConstant('2')}
              className="h-10 xs:h-11 text-sm font-black bg-gray-100/50 dark:bg-stone-850/50 text-gray-700 dark:text-stone-300 hover:bg-yellow-50 dark:hover:bg-stone-800 rounded-xl transition-all active:scale-95"
            >
              2
            </button>
            <button
              onClick={() => handleSciNumOrConstant('3')}
              className="h-10 xs:h-11 text-sm font-black bg-gray-100/50 dark:bg-stone-850/50 text-gray-700 dark:text-stone-300 hover:bg-yellow-50 dark:hover:bg-stone-800 rounded-xl transition-all active:scale-95"
            >
              3
            </button>
            <button
              onClick={() => handleSciOperator('-')}
              className="h-10 xs:h-11 text-white bg-yellow-400 hover:bg-yellow-500 rounded-xl transition-colors active:scale-95 flex items-center justify-center font-black"
            >
              −
            </button>
            <button
              onClick={() => handleSciPercentAndFactorial('%')}
              className="h-10 xs:h-11 text-sm font-black bg-gray-50 dark:bg-stone-850 text-gray-700 dark:text-stone-300 hover:bg-yellow-50 dark:hover:bg-stone-800 rounded-xl transition-all active:scale-95 font-mono"
              title="Modulo percent"
            >
              %
            </button>

            {/* ROW 6 */}
            <button
              onClick={() => handleSciNumOrConstant('0')}
              className="h-10 xs:h-11 text-sm font-black bg-gray-100/50 dark:bg-stone-850/50 text-gray-700 dark:text-stone-300 hover:bg-yellow-50 dark:hover:bg-stone-800 rounded-xl transition-all active:scale-95"
            >
              0
            </button>
            <button
              onClick={() => handleSciNumOrConstant('.')}
              className="h-10 xs:h-11 text-sm font-black bg-gray-100/50 dark:bg-stone-850/50 text-gray-700 dark:text-stone-300 hover:bg-yellow-50 dark:hover:bg-stone-800 rounded-xl transition-all active:scale-95"
            >
              .
            </button>
            <button
              onClick={() => handleSciNumOrConstant('e')}
              className="h-10 xs:h-11 text-xs font-black bg-gray-50 dark:bg-stone-850 text-gray-700 dark:text-stone-300 hover:bg-yellow-50 dark:hover:bg-stone-800 rounded-xl transition-all active:scale-95 font-mono"
              title="Euler's Constant e (≈2.718)"
            >
              e
            </button>
            <button
              onClick={() => handleSciOperator('+')}
              className="h-10 xs:h-11 text-white bg-yellow-400 hover:bg-yellow-500 rounded-xl transition-colors active:scale-95 flex items-center justify-center font-black"
            >
              +
            </button>
            <button
              onClick={handleSciEqual}
              className="h-10 xs:h-11 text-white bg-yellow-500 hover:bg-yellow-600 rounded-xl transition-shadow shadow-xs hover:shadow-md flex items-center justify-center font-black"
            >
              <span className="text-xl font-black font-sans leading-none">=</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
