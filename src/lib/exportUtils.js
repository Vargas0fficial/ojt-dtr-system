import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export function exportToPDF(logs, filename, title) {
  const doc = new jsPDF();
  doc.text(title, 14, 15);
  const tableColumn = ["Date", "Time In", "Time Out", "Total Hours"];
  const tableRows = logs.map(log => [
    log.date,
    log.timeIn? new Date(log.timeIn).toLocaleTimeString() : '',
    log.timeOut? new Date(log.timeOut).toLocaleTimeString() : '',
    log.totalHours || ''
  ]);
  doc.autoTable({ head: [tableColumn], body: tableRows, startY: 20 });
  doc.save(`${filename}.pdf`);
}

export function exportToExcel(logs, filename) {
  const data = logs.map(log => ({
    Date: log.date,
    'Time In': log.timeIn? new Date(log.timeIn).toLocaleTimeString() : '',
    'Time Out': log.timeOut? new Date(log.timeOut).toLocaleTimeString() : '',
    'Total Hours': log.totalHours || 0
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "DTR");
  XLSX.writeFile(wb, `${filename}.xlsx`);
}