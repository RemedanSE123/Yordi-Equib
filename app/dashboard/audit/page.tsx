'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Eye, Search, ShieldAlert, X, Filter,
  History, User as UserIcon, Database,
  ArrowRight, CheckCircle2, AlertCircle,
  Trash2, Edit, Plus, Calendar, Clock,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';

interface AuditLog {
  id: string;
  createdAt?: string;
  timestamp: string;
  user: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE' | 'LOGIN_SUCCESS' | 'SESSION_START' | 'MANUAL_LOGOUT' | 'SESSION_END';
  entityType: string;
  entityId: string;
  details: string;
  old_data?: any;
  new_data?: any;
}

interface UserSessionWindow {
  id: string;
  startAt: string;
  endAt?: string;
  startLabel: string;
}

export default function AuditPage() {
  const { data: session } = useSession();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<'all' | 'INSERT' | 'UPDATE' | 'DELETE' | 'LOGIN_SUCCESS' | 'SESSION_START' | 'MANUAL_LOGOUT' | 'SESSION_END'>('all');
  const [filterTable, setFilterTable] = useState<'all' | 'payments' | 'customers' | 'users' | 'auth_sessions'>('all');
  const [selectedUser, setSelectedUser] = useState<'all' | string>('all');
  const [selectedSessionWindow, setSelectedSessionWindow] = useState<'all' | string>('all');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/audit');
      const data = await response.json();
      if (Array.isArray(data)) {
        setAuditLogs(data);
      }
    } catch (error) {
      toast.error('Failed to sync audit records');
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
      <div className="flex h-full items-center justify-center p-8 bg-gray-50 min-h-screen">
        <div className="text-center max-w-md p-8 rounded-xl border border-red-200 bg-white shadow-sm">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <ShieldAlert size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h1>
          <p className="text-gray-500">Only System Administrators can access the audit trail.</p>
        </div>
      </div>
    );
  }

  const users = Array.from(new Set(auditLogs.map(log => log.user))).sort();

  const userSessionWindows = (() => {
    if (selectedUser === 'all') return [] as UserSessionWindow[];
    const userLogs = auditLogs
      .filter(log => log.user === selectedUser)
      .slice()
      .sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());

    const windows: UserSessionWindow[] = [];
    let activeWindow: UserSessionWindow | null = null;

    for (const log of userLogs) {
      const isStart = log.action === 'LOGIN_SUCCESS' || log.action === 'SESSION_START';
      const isEnd = log.action === 'MANUAL_LOGOUT' || log.action === 'SESSION_END';
      if (isStart && !activeWindow) {
        activeWindow = {
          id: log.id,
          startAt: log.createdAt || new Date().toISOString(),
          startLabel: log.timestamp,
        };
        continue;
      }

      if (isEnd && activeWindow) {
        activeWindow.endAt = log.createdAt || new Date().toISOString();
        windows.push(activeWindow);
        activeWindow = null;
      }
    }

    if (activeWindow) windows.push(activeWindow);
    return windows.reverse();
  })();

  const selectedWindow = selectedSessionWindow === 'all'
    ? null
    : userSessionWindows.find(w => w.id === selectedSessionWindow) || null;

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    const matchesTable = filterTable === 'all' || log.entityType === filterTable;
    const matchesUser = selectedUser === 'all' || log.user === selectedUser;

    const matchesWindow = (() => {
      if (!selectedWindow || selectedUser === 'all') return true;
      if (log.user !== selectedUser || !log.createdAt) return false;
      const eventTime = new Date(log.createdAt).getTime();
      const start = new Date(selectedWindow.startAt).getTime();
      const end = selectedWindow.endAt ? new Date(selectedWindow.endAt).getTime() : Number.POSITIVE_INFINITY;
      return eventTime >= start && eventTime <= end;
    })();

    return matchesSearch && matchesAction && matchesTable && matchesUser && matchesWindow;
  });

  const getActionStyles = (action: string) => {
    switch (action) {
      case 'INSERT': return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' };
      case 'UPDATE': return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
      case 'DELETE': return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' };
      case 'LOGIN_SUCCESS': return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
      case 'SESSION_START': return { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' };
      case 'MANUAL_LOGOUT': return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' };
      case 'SESSION_END': return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
      default: return { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' };
    }
  };

  const getEntityStyles = (type: string) => {
    const styles: Record<string, { bg: string, text: string }> = {
      users: { bg: 'bg-indigo-50', text: 'text-indigo-700' },
      customers: { bg: 'bg-amber-50', text: 'text-amber-700' },
      payments: { bg: 'bg-purple-50', text: 'text-purple-700' },
      auth_sessions: { bg: 'bg-cyan-50', text: 'text-cyan-700' },
    };
    return styles[type] || { bg: 'bg-gray-50', text: 'text-gray-600' };
  };

  const DiffViewer = ({ oldData, newData, showFull = false }: { oldData: any, newData: any, showFull?: boolean }) => {
    if (!oldData && !newData) return null;

    if (!oldData && newData) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(newData).map(([key, value]) => (
            <div key={key} className="flex flex-col p-3 bg-green-50 rounded-lg border border-green-200">
              <span className="text-xs font-medium text-green-700 mb-1">{key.replace(/_/g, ' ')}</span>
              <span className="text-sm text-gray-900">{String(value ?? 'N/A')}</span>
            </div>
          ))}
        </div>
      );
    }

    if (oldData && !newData) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(oldData).map(([key, value]) => (
            <div key={key} className="flex flex-col p-3 bg-red-50 rounded-lg border border-red-200">
              <span className="text-xs font-medium text-red-700 mb-1">{key.replace(/_/g, ' ')}</span>
              <span className="text-sm text-gray-500 line-through">{String(value ?? 'N/A')}</span>
            </div>
          ))}
        </div>
      );
    }

    const allKeys = Array.from(new Set([...Object.keys(oldData), ...Object.keys(newData)]));
    const changedFields = allKeys.filter(
      key => JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])
    );

    const keysToDisplay = showFull ? allKeys : changedFields;

    return (
      <div className="space-y-3">
        {keysToDisplay.map(key => {
          const isChanged = changedFields.includes(key);
          return (
            <div key={key} className={`p-3 rounded-lg border ${isChanged ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex justify-between items-center mb-2">
                <p className={`text-xs font-medium ${isChanged ? 'text-blue-700' : 'text-gray-500'}`}>
                  {key.replace(/_/g, ' ')}
                </p>
                {isChanged && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded">Changed</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <span className="text-xs text-gray-400 block mb-1">Previous</span>
                  <span className={`text-sm ${isChanged ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
                    {String(oldData[key] ?? '—')}
                  </span>
                </div>
                {isChanged && <ArrowRight size={14} className="text-gray-400" />}
                <div className="flex-1">
                  <span className="text-xs text-gray-400 block mb-1">New</span>
                  <span className={`text-sm ${isChanged ? 'text-blue-700 font-medium' : 'text-gray-700'}`}>
                    {String(newData[key] ?? '—')}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <History size={24} className="text-gray-700" />
            <h1 className="text-2xl font-bold text-gray-900">Audit Trail</h1>
          </div>
          <p className="text-sm text-gray-500 ml-9">Security monitoring and compliance log</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-200 text-sm"
          />
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 flex flex-wrap gap-3 items-center">
        <Filter size={14} className="text-gray-400" />
        <span className="text-xs text-gray-500">Filters:</span>

        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value as any)}
          className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 outline-none focus:border-gray-300 cursor-pointer"
        >
          <option value="all">All Actions</option>
          <option value="INSERT">Create</option>
          <option value="UPDATE">Update</option>
          <option value="DELETE">Delete</option>
          <option value="LOGIN_SUCCESS">Login Success</option>
          <option value="SESSION_START">Session Start</option>
          <option value="MANUAL_LOGOUT">Manual Logout</option>
          <option value="SESSION_END">Session End</option>
        </select>

        <select
          value={filterTable}
          onChange={(e) => setFilterTable(e.target.value as any)}
          className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 outline-none focus:border-gray-300 cursor-pointer"
        >
          <option value="all">All Domains</option>
          <option value="payments">Payments</option>
          <option value="customers">Customers</option>
          <option value="users">Users</option>
          <option value="auth_sessions">Auth Sessions</option>
        </select>

        <select
          value={selectedUser}
          onChange={(e) => {
            setSelectedUser(e.target.value);
            setSelectedSessionWindow('all');
          }}
          className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 outline-none focus:border-gray-300 cursor-pointer"
        >
          <option value="all">All Users</option>
          {users.map(user => (
            <option key={user} value={user}>{user}</option>
          ))}
        </select>

        <select
          value={selectedSessionWindow}
          onChange={(e) => setSelectedSessionWindow(e.target.value)}
          disabled={selectedUser === 'all'}
          className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 outline-none focus:border-gray-300 cursor-pointer disabled:opacity-50"
        >
          <option value="all">All Sessions</option>
          {userSessionWindows.map(window => (
            <option key={window.id} value={window.id}>
              {window.endAt ? `${window.startLabel} -> ${new Date(window.endAt).toLocaleString()}` : `${window.startLabel} -> active`}
            </option>
          ))}
        </select>

        <div className="ml-auto text-xs text-gray-400">
          {filteredLogs.length} records found
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Domain</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="inline-block w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                    <p className="text-sm text-gray-500 mt-2">Loading...</p>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <Database size={32} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No audit records found</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const styles = getActionStyles(log.action);
                  const entityStyles = getEntityStyles(log.entityType);
                  return (
                    <tr key={log.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{log.timestamp}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                            {log.user.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{log.user}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${styles.bg} ${styles.text}`}>
                          {log.action === 'INSERT' && <Plus size={10} />}
                          {log.action === 'UPDATE' && <Edit size={10} />}
                          {log.action === 'DELETE' && <Trash2 size={10} />}
                          {log.action === 'LOGIN_SUCCESS' && <CheckCircle2 size={10} />}
                          {log.action === 'SESSION_START' && <Activity size={10} />}
                          {log.action === 'MANUAL_LOGOUT' && <X size={10} />}
                          {log.action === 'SESSION_END' && <Clock size={10} />}
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${entityStyles.bg} ${entityStyles.text}`}>
                          {log.entityType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-md truncate">{log.details}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${getActionStyles(selectedLog.action).bg}`}>
                  {selectedLog.action === 'INSERT' && <Plus size={16} className={getActionStyles(selectedLog.action).text} />}
                  {selectedLog.action === 'UPDATE' && <Edit size={16} className={getActionStyles(selectedLog.action).text} />}
                  {selectedLog.action === 'DELETE' && <Trash2 size={16} className={getActionStyles(selectedLog.action).text} />}
                  {selectedLog.action === 'LOGIN_SUCCESS' && <CheckCircle2 size={16} className={getActionStyles(selectedLog.action).text} />}
                  {selectedLog.action === 'SESSION_START' && <Activity size={16} className={getActionStyles(selectedLog.action).text} />}
                  {selectedLog.action === 'MANUAL_LOGOUT' && <X size={16} className={getActionStyles(selectedLog.action).text} />}
                  {selectedLog.action === 'SESSION_END' && <Clock size={16} className={getActionStyles(selectedLog.action).text} />}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Event Details</h2>
                  <p className="text-xs text-gray-500">ID: {selectedLog.id.slice(0, 8)}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Event Meta Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Date & Time</p>
                  <p className="text-sm font-medium text-gray-900">{selectedLog.timestamp}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">User</p>
                  <p className="text-sm font-medium text-gray-900">{selectedLog.user}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Domain</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">{selectedLog.entityType}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Record ID</p>
                  <p className="text-sm font-mono text-gray-600">{selectedLog.entityId.slice(0, 12)}...</p>
                </div>
              </div>

              {/* Summary */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Operation Summary</p>
                <p className="text-sm text-gray-900">
                  {selectedLog.action} operation performed on {selectedLog.entityType} record
                </p>
              </div>

              {/* Data Changes */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Data Changes</h3>
                <DiffViewer oldData={selectedLog.old_data} newData={selectedLog.new_data} showFull={false} />
              </div>

              {/* Full Data (for updates) */}
              {selectedLog.action === 'UPDATE' && (selectedLog.old_data || selectedLog.new_data) && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Full Record Comparison</h3>
                  <DiffViewer oldData={selectedLog.old_data} newData={selectedLog.new_data} showFull={true} />
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <CheckCircle2 size={14} className="text-gray-400" />
                <p className="text-xs text-gray-500">
                  Record ID: <span className="font-mono text-gray-600">{selectedLog.entityId}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}