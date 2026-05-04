'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Eye, Search, ShieldAlert, X } from 'lucide-react';

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  old_data?: any;
  new_data?: any;
}

export default function AuditPage() {
  const { data: session } = useSession();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<'all' | 'INSERT' | 'UPDATE' | 'DELETE'>('all');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/audit');
      const data = await response.json();
      if (Array.isArray(data)) {
        setAuditLogs(data);
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const userRole = (session?.user as any)?.role;

  if (userRole !== 'ADMIN') {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center max-w-md p-8 rounded-3xl border border-red-100 bg-red-50/50 backdrop-blur">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldAlert size={32} />
          </div>
          <h1 className="text-2xl font-black text-gray-950 mb-2">Access Denied</h1>
          <p className="text-gray-600">Only administrators can view audit logs. Please contact your manager if you believe this is an error.</p>
        </div>
      </div>
    );
  }

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    return matchesSearch && matchesAction;
  });

  const getActionColor = (action: string) => {
    switch (action) {
      case 'INSERT': return 'bg-green-100 text-green-700';
      case 'UPDATE': return 'bg-blue-100 text-blue-700';
      case 'DELETE': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getEntityColor = (entityType: string) => {
    const colors: Record<string, string> = {
      users: 'bg-indigo-100 text-indigo-700',
      customers: 'bg-blue-100 text-blue-700',
      payments: 'bg-green-100 text-green-700',
    };
    return colors[entityType] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-gray-950">Audit Logs</h1>
        <p className="text-gray-600 mt-2">Monitor all system activity and security events</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-3xl border border-gray-200 p-4 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by user, entity, or action..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
              />
            </div>
          </div>
          <div>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value as any)}
              className="w-full md:w-auto px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
            >
              <option value="all">All Actions</option>
              <option value="INSERT">Insert</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Table</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Details</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">Loading audit logs...</td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">No activity logs found</td>
                </tr>
              ) : filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-500 font-mono font-medium">{log.timestamp}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-950">{log.user}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getEntityColor(log.entityType)}`}>
                      {log.entityType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-medium truncate max-w-[200px]">{log.details}</td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="p-2 text-primary hover:bg-primary/5 rounded-xl transition"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-gray-100">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-black text-gray-950 uppercase tracking-tight">Log Details</h2>
              <button onClick={() => setSelectedLog(null)} className="p-2 hover:bg-gray-200 rounded-full transition">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Timestamp</p>
                  <p className="text-sm text-gray-950 font-mono font-bold">{selectedLog.timestamp}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">User</p>
                  <p className="text-sm text-gray-950 font-bold">{selectedLog.user}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Action</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getActionColor(selectedLog.action)}`}>
                    {selectedLog.action}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Table</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getEntityColor(selectedLog.entityType)}`}>
                    {selectedLog.entityType}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Record ID</p>
                  <p className="text-xs text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded-lg inline-block font-bold">
                    {selectedLog.entityId}
                  </p>
                </div>
              </div>

              {selectedLog.old_data && (
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Old Data</p>
                  <pre className="bg-gray-50 text-gray-700 p-4 rounded-2xl text-[10px] overflow-x-auto font-mono border border-gray-100 shadow-inner">
                    {JSON.stringify(selectedLog.old_data, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.new_data && (
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">New Data</p>
                  <pre className="bg-gray-950 text-green-400 p-6 rounded-2xl text-[10px] overflow-x-auto font-mono shadow-inner leading-relaxed">
                    {JSON.stringify(selectedLog.new_data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
