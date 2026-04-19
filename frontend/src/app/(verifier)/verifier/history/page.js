"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Download, CheckCircle, AlertTriangle, XCircle, FileText, Loader2 } from "lucide-react";
import { fetchHistoryShifts } from "@/services/verifier.api";
import { exportAuditCSV } from "@/lib/exportCsv";
import toast from "react-hot-toast";

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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

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
      toast.error("Failed to load history.");
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

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const paginatedHistory = filteredHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <main className="p-8 max-w-7xl mx-auto h-full flex flex-col">
      
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reviewed Logs</h1>
          <p className="text-slate-500 text-sm mt-1">Audit trail of all shift verifications processed by you.</p>
        </div>
        
        <button 
          onClick={() => {
            try {
              exportAuditCSV(filteredHistory);
              toast.success("CSV Downloaded Successfully");
            } catch (err) {
              toast.error("Failed to download CSV");
            }
          }}
          className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-sm px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" />
          Export CSV
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
                [...Array(10)].map((_, i) => (
                  <tr key={`skeleton-${i}`} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-slate-200 rounded-full w-24"></div></td>
                  </tr>
                ))
              ) : paginatedHistory.length > 0 ? (
                paginatedHistory.map((log) => (
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
          <span>Showing {paginatedHistory.length} of {filteredHistory.length} total records</span>
          <div className="flex gap-1">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-200 disabled:opacity-50"
            >
              Prev
            </button>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-200 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
      
    </main>
  );
}