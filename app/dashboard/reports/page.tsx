import { FileSpreadsheet, FileText } from 'lucide-react';

export default function ReportsPage() {
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
            <button className="inline-flex items-center gap-2 rounded-2xl bg-[#016cc4] px-5 py-3 text-sm font-bold text-white hover:bg-opacity-90 transition shadow-lg shadow-primary/20">
              <FileSpreadsheet size={18} /> Export Excel
            </button>
          </div>
        </div>

        <div className="mt-12 text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 border border-gray-100">
            <FileText size={32} className="text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">No reports generated yet</h3>
          <p className="text-gray-500 max-w-sm mx-auto mt-2">Generate your first report by selecting an export format above.</p>
        </div>
      </div>
    </div>
  );
}