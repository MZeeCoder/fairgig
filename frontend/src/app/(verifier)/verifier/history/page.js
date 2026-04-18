"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Download, CheckCircle, AlertTriangle, XCircle, FileText, Loader2 } from "lucide-react";
import { fetchHistoryShifts } from "@/services/verifier.api";
import { exportAuditCSV } from "@/lib/exportCsv";

const StatusBadge = ({ status }) => {
  if (status === "Confirmed") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle className="w-3.5 h-3.5" /> Confirmed
      </span>
    );
  }
  if (status === "Flagged") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <AlertTriangle className="w-3.5 h-3.5" /> Flagged
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
      <XCircle className="w-3.5 h-3.5" /> Rejected
    </span>
  );
};

export default function VerifierHistoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [reviewedHistory, setReviewedHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const res = await fetchHistoryShifts();
      if (res.success) {
        setReviewedHistory(res.data);
      }
    } catch (err) {
      console.error("Failed to load history");
    } finally {
      setIsLoading(false);
    }
  };

  // Simple client-side filtering for the hackathon
  const filteredHistory = reviewedHistory.filter(log => {
    const matchesSearch = log.platform.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (log._id && log._id.toString().includes(searchTerm));
    const matchesStatus = statusFilter === "All" || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <main className="p-8 max-w-7xl mx-auto h-full flex flex-col">
      
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reviewed Logs</h1>
          <p className="text-sm text-slate-500 mt-1">Audit trail of all shift verifications processed by you.</p>
        </div>
        
        <button 
          onClick={() => exportAuditCSV(filteredHistory)}
          className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-sm px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" />
          Export Audit CSV
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-t-xl border border-slate-200 border-b-0 flex items-center justify-between shrink-0">
        <div className="relative w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by platform or log ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-slate-700 bg-white border border-slate-200 rounded-lg text-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
          >
            <option value="All" className="text-slate-700">All Statuses</option>
            <option value="Confirmed" className="text-slate-700">Confirmed Only</option>
            <option value="Flagged" className="text-slate-700">Flagged Only</option>
            <option value="Unverifiable" className="text-slate-700">Rejected Only</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-slate-200 rounded-b-xl shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">Shift Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">Platform</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">Hours Logged</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">Gross Earned</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">Deduction</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">Net Received</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto" />
                  </td>
                </tr>
              ) : filteredHistory.length > 0 ? (
                filteredHistory.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{log.date}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-700">{log.platform}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{log.hours_worked} h</td>
                    <td className="px-6 py-4 text-sm text-slate-600">PKR {log.gross_earned?.toLocaleString() ?? 0}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">PKR {log.deduction?.toLocaleString() ?? 0}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">PKR {log.net_received?.toLocaleString() ?? 0}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={log.status} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                    No reviewed logs match your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center shrink-0">
          <span>Showing {filteredHistory.length} of {reviewedHistory.length} total records</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-200 disabled:opacity-50" disabled>Prev</button>
            <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-200 disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      </div>
      
    </main>
  );
}