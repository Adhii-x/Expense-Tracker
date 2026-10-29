import { zipSync, strToU8 } from 'fflate';

export function formatCurrency(amount) {
  const numeric = Number(amount) || 0;

  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numeric);
  } catch (e) {
    return `₹${numeric.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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

export function downloadCsv(transactions) {
  if (!hasExportRows(transactions)) return false;
  const headers = ['ID', 'Date', 'Title', 'Type', 'Category', 'Amount (INR)', 'Notes'];
  const rows = transactions.map(transaction => [
    transaction.id,
    transaction.date,
    transaction.title,
    transaction.type?.toUpperCase(),
    transaction.category,
    Number(transaction.amount) || 0,
    transaction.notes
  ]);
  const csvContent = [headers, ...rows]
    .map(row => row.map(csvCell).join(','))
    .join('\r\n');
  triggerDownload(new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' }), 'csv');
  return true;
}

function hasExportRows(transactions) {
  if (transactions?.length) return true;
  window.alert('No transactions available to export.');
  return false;
}

function csvCell(value) {
  const text = String(value ?? '');
  const safeText = /^[\s]*[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safeText.replace(/"/g, '""')}"`;
}

function escapeXml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function triggerDownload(blob, extension) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Expense_Tracker_Export_${new Date().toISOString().slice(0, 10)}.${extension}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadExcel(transactions) {
  if (!hasExportRows(transactions)) return false;

  const headers = ['ID', 'Date', 'Title', 'Type', 'Category', 'Amount (INR)', 'Notes'];
  const rows = transactions.map(transaction => [
    transaction.id,
    transaction.date,
    transaction.title,
    transaction.type?.toUpperCase(),
    transaction.category,
    Number(transaction.amount) || 0,
    transaction.notes
  ]);
  const xmlRow = (values, rowNumber) => (
    `<row r="${rowNumber}">${values.map((value, index) => {
      const reference = `${String.fromCharCode(65 + index)}${rowNumber}`;
      if (typeof value === 'number') {
        return `<c r="${reference}"><v>${value}</v></c>`;
      }
      return `<c r="${reference}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(value)}</t></is></c>`;
    }).join('')}</row>`
  );
  const sheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheetData>${xmlRow(headers, 1)}${rows.map((row, index) => xmlRow(row, index + 2)).join('')}</sheetData>
  <autoFilter ref="A1:G${rows.length + 1}"/>
</worksheet>`;
  const files = {
    '[Content_Types].xml': strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`),
    '_rels/.rels': strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`),
    'xl/workbook.xml': strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets><sheet name="Transactions" sheetId="1" r:id="rId1"/></sheets>
</workbook>`),
    'xl/_rels/workbook.xml.rels': strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>`),
    'xl/worksheets/sheet1.xml': strToU8(sheet)
  };
  const xlsx = zipSync(files);
  triggerDownload(
    new Blob([xlsx], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
    'xlsx'
  );
  return true;
}

export async function downloadPdf(transactions) {
  if (!hasExportRows(transactions)) return false;

  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable')
  ]);
  const document = new jsPDF({ orientation: 'landscape' });
  document.setFontSize(18);
  document.setTextColor(33, 48, 77);
  document.text('Expense Tracker Transactions', 14, 17);
  document.setFontSize(9);
  document.setTextColor(105, 115, 132);
  document.text(
    `Exported ${transactions.length} transaction${transactions.length === 1 ? '' : 's'} · ${new Date().toLocaleDateString()}`,
    14,
    24
  );

  autoTable(document, {
    startY: 30,
    head: [['ID', 'Date', 'Title', 'Type', 'Category', 'Amount (INR)', 'Notes']],
    body: transactions.map(transaction => [
      transaction.id || '',
      transaction.date || '',
      transaction.title || '',
      transaction.type?.toUpperCase() || '',
      transaction.category || '',
      (Number(transaction.amount) || 0).toFixed(2),
      transaction.notes || ''
    ]),
    styles: { fontSize: 8, cellPadding: 2.5, overflow: 'linebreak' },
    headStyles: { fillColor: [34, 91, 190] },
    alternateRowStyles: { fillColor: [244, 247, 252] },
    margin: { left: 14, right: 14 }
  });

  triggerDownload(document.output('blob'), 'pdf');
  return true;
}
