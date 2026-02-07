export interface Transaction {
  date: string;
  description: string;
  amount: number;
  type: "debit" | "credit";
  category?: string;
  category_name?: string;
  confidence?: number;
}

export interface TransactionSummary {
  total_transactions: number;
  total_debits: number;
  total_credits: number;
  net_amount: number;
  date_range?: {
    start: string;
    end: string;
  };
}

export interface CategoryBreakdown {
  category: string;
  category_name: string;
  total_amount: number;
  transaction_count: number;
  percentage: number;
  icon: string;
}

export interface SpendingTimeline {
  timeline: Array<{
    month: string;
    total: number;
  }>;
  total_months: number;
}

export interface Analysis {
  category_breakdown: CategoryBreakdown[];
  top_expenses: Transaction[];
  spending_timeline: SpendingTimeline;
  daily_average: number;
  insights: string[];
  total_transactions: number;
  total_categories: number;
}

export interface UploadResponse {
  message: string;
  filename: string;
  file_size: number;
  summary: TransactionSummary;
  analysis: Analysis;
  preview_transactions: Transaction[];
  total_transactions: number;
}