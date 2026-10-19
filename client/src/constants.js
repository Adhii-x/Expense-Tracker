export const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Housing & Rent',
  'Groceries',
  'Transportation',
  'Education & Books',
  'Entertainment',
  'Utilities & Bills',
  'Healthcare',
  'Shopping',
  'Personal Care',
  'Other Expense'
];

export const INCOME_CATEGORIES = [
  'Salary',
  'Part-Time Job',
  'Freelance / Tutoring',
  'Scholarship / Grant',
  'Allowance',
  'Investment / Dividends',
  'Gifts',
  'Other Income'
];

export const INITIAL_TRANSACTIONS = [
  {
    id: 'tx-1',
    title: 'Semester Textbooks & Supplies',
    amount: 145.50,
    type: 'expense',
    category: 'Education & Books',
    date: '2026-10-02',
    notes: 'CS Algorithms & UI Design books'
  },
  {
    id: 'tx-2',
    title: 'University Scholarship / Grant',
    amount: 1200.00,
    type: 'income',
    category: 'Scholarship / Grant',
    date: '2026-10-01',
    notes: 'Fall semester merit award'
  },
  {
    id: 'tx-3',
    title: 'Weekly Grocery Shopping',
    amount: 86.20,
    type: 'expense',
    category: 'Groceries',
    date: '2026-10-05',
    notes: 'Produce, dairy and snacks'
  },
  {
    id: 'tx-4',
    title: 'Web Dev Tutoring - 4 Sessions',
    amount: 450.00,
    type: 'income',
    category: 'Freelance / Tutoring',
    date: '2026-10-08',
    notes: 'React & JS tutoring for sophomores'
  },
  {
    id: 'tx-5',
    title: 'Student Apartment Rent & WiFi',
    amount: 650.00,
    type: 'expense',
    category: 'Housing & Rent',
    date: '2026-10-01',
    notes: 'Shared rent split'
  },
  {
    id: 'tx-6',
    title: 'City Transit Monthly Pass',
    amount: 60.00,
    type: 'expense',
    category: 'Transportation',
    date: '2026-10-03',
    notes: 'Metro and bus pass'
  },
  {
    id: 'tx-7',
    title: 'GitHub & Streaming Services',
    amount: 24.99,
    type: 'expense',
    category: 'Entertainment',
    date: '2026-10-10',
    notes: 'Developer subscriptions'
  },
  {
    id: 'tx-8',
    title: 'Campus Cafe & Latte',
    amount: 28.50,
    type: 'expense',
    category: 'Food & Dining',
    date: '2026-10-12',
    notes: 'Coffee before morning lectures'
  },
  {
    id: 'tx-9',
    title: 'Software Internship Stipend',
    amount: 1800.00,
    type: 'income',
    category: 'Salary',
    date: '2026-09-28',
    notes: 'Monthly stipend'
  },
  {
    id: 'tx-10',
    title: 'Tech Accessories & Cable',
    amount: 75.00,
    type: 'expense',
    category: 'Shopping',
    date: '2026-09-15',
    notes: 'Monitor cable & wireless mouse'
  }
];

export const CATEGORY_COLORS = {
  'Food & Dining': '#F59E0B',
  'Housing & Rent': '#6366F1',
  'Groceries': '#10B981',
  'Transportation': '#3B82F6',
  'Education & Books': '#8B5CF6',
  'Entertainment': '#EC4899',
  'Utilities & Bills': '#14B8A6',
  'Healthcare': '#EF4444',
  'Shopping': '#F97316',
  'Personal Care': '#06B6D4',
  'Other Expense': '#6B7280',
  'Salary': '#10B981',
  'Part-Time Job': '#059669',
  'Freelance / Tutoring': '#0D9488',
  'Scholarship / Grant': '#2563EB',
  'Allowance': '#7C3AED',
  'Investment / Dividends': '#0284C7',
  'Gifts': '#DB2777',
  'Other Income': '#4B5563'
};
