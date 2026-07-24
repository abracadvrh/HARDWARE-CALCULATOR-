export type HistoryCategory = 'NORMAL_CALC' | 'VAT' | '2307' | 'LUMBER' | 'CONVERSION' | 'TRUCK_CUBIC' | 'CASH_BREAKDOWN';

export interface HistoryItem {
  id: string;
  category: HistoryCategory;
  calculatorName: string;
  formula: string;
  result: string;
  timestamp: string;      // e.g., "12:35 PM" or "12:35:01 PM"
  rawTimestamp: number;   // Date.now()
  isPinned?: boolean;     // For pinned calculations
}

export interface SharedHistoryProps {
  onAddHistory?: (category: HistoryCategory, calculatorName: string, formula: string, result: string) => void;
}
