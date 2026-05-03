'use client';

import { Download, FileSpreadsheet, FileText } from 'lucide-react';

const reportRows = [
  {
    id: 'REP-001',
    reportName: 'Daily Collection Summary',
    period: 'Today',
    generatedBy: 'Admin User',
    totalAmount: 5400,
    format: 'PDF',
  },
  {
    id: 'REP-002',
    reportName: 'Weekly Payment Status',
    period: 'Current Week',
    generatedBy: 'Manager User',
    totalAmount: 19400,
    format: 'Excel',
  },
  {
    id: 'REP-003',
    reportName: 'Monthly Winner Payouts',
    period: 'Meskerem',
    generatedBy: 'Secretary User',
    totalAmount: 62000,
    format: 'PDF',
  },
  {
    id: 'REP-004',
    reportName: 'User Activity Snapshot',
    period: 'Last 30 Days',
    generatedBy: 'Admin User',
    totalAmount: 0,
    format: 'Excel',
  },
];

export default function ReportsPage() {
  const totalReportAmount = reportRows.reduce((sum, row) => sum + row.totalAmount, 0);

  return (
    <div className="p-4 md:p-8">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-950">Reports</h1>
            <p className="mt-2 text-gray-600">Export system data in PDF and Excel formats for auditing and bookkeeping.</p>
          </div>
          <div className="flex gap-3">
            <button className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition shadow-sm">
              <FileText size={18} className="text-red-500" /> Export PDF
            </button>
            <button className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-opacity-90 transition shadow-lg shadow-primary/20">
              <FileSpreadsheet size={18} /> Export Excel
            </button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-100 bg-slate-50 p-6">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Generated</p>
            <p className="text-2xl font-black text-gray-950">{reportRows.length}</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-slate-50 p-6">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Amount</p>
            <p className="text-2xl font-black text-primary">ETB {totalReportAmount.toLocaleString()}</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-slate-50 p-6">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Currency</p>
            <p className="text-2xl font-black text-gray-950">ETB</p>
          </div>
        </div>

        <div className="mt-8 overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
          <table className="w-full min-w-[860px]">
            <thead className="bg-gray-50/50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">ID</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Name</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Period</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">By</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Amount</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Format</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reportRows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-gray-500 font-mono">{row.id}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-950">{row.reportName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-medium">{row.period}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-medium">{row.generatedBy}</td>
                  <td className="px-6 py-4 text-sm font-black text-primary">ETB {row.totalAmount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      row.format === 'PDF' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                    }`}>
                      {row.format}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-200 transition">
                      <Download size={14} /> Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}