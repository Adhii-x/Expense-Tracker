import { CURRENCIES } from './constants';

export function formatCurrency(amount, currencyCode = 'USD') {
  const numeric = Number(amount) || 0;
  const curr = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0];

  try {
    return new Intl.NumberFormat(currencyCode === 'INR' ? 'en-IN' : 'en-US', {
      style: 'currency',
      currency: curr.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numeric);
  } catch (e) {
    return `${curr.symbol}${numeric.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}

export function formatDate(dateString) {
  if (!dateString) return '';
  try {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
    return dateString;
  } catch (e) {
    return dateString;
  }
}

export function formatMonthYear(monthStr) {
  // expects 'YYYY-MM'
  if (!monthStr || monthStr === 'All') return 'All Months';
  try {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch (e) {
    return monthStr;
  }
}

export function downloadCsv(transactions, currencyCode = 'USD') {
  if (!transactions || transactions.length === 0) {
    alert('No transactions available to export.');
    return;
  }

  const headers = ['ID', 'Date', 'Title', 'Type', 'Category', `Amount (${currencyCode})`, 'Notes'];
  const rows = transactions.map(t => [
    t.id,
    t.date,
    `"${(t.title || '').replace(/"/g, '""')}"`,
    t.type.toUpperCase(),
    `"${(t.category || '').replace(/"/g, '""')}"`,
    Number(t.amount).toFixed(2),
    `"${(t.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Expense_Tracker_Export_${new Date().toISOString().substring(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
