"use client";

import { useState, useEffect } from "react";
import {
  DollarSign, TrendingUp, Layers, FileText, Loader2,
  Upload, CheckCircle, Clock, AlertTriangle, Plus,
  Bell, Briefcase, ImageIcon, X
} from "lucide-react";

import LogShiftModal from "./LogShiftModal";
import { fetchHistory } from "@/services/earnings.api";

// ── Mock Data ────────────────────────────────────────────────
// The mock data has been removed to prepare for API integration.

// ── Sub-components ───────────────────────────────────────────
const statusStyles = {
  Confirmed: "bg-teal-50 text-teal-700 border border-teal-200",
  Pending:   "bg-amber-50 text-amber-700 border border-amber-200",
  Flagged:   "bg-red-50 text-red-700 border border-red-200",
};

const StatusIcon = ({ status }) => {
  if (status === "Confirmed") return <CheckCircle className="w-3 h-3" />;
  if (status === "Pending") return <Clock className="w-3 h-3" />;
  return <AlertTriangle className="w-3 h-3" />;
};

function StatCard({ label, value, sub, Icon, iconBg, iconColor }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 mb-2">{label}</p>
          <p className="text-2xl font-bold text-slate-900 mb-1">{value}</p>
          <p className={`text-xs font-medium ${iconColor}`}>{sub}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
}

function Header({ certLoading, onCertClick }) {
  return (
    <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Matched your login page logo style */}
        <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center shadow-sm">
          <Briefcase className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-slate-900 text-xl tracking-tight">FairGig</span>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={onCertClick}
          disabled={certLoading}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          {certLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
          {certLoading ? "Processing..." : "Generate Income Certificate"}
        </button>
        <button className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-sm border border-slate-200 cursor-pointer">
          AH
        </div>
      </div>
    </header>
  );
}

// ── Page ─────────────────────────────────────────────────────
export default function WorkerDashboard() {
  const [certLoading, setCertLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [weeklyEarnings, setWeeklyEarnings] = useState([]);
  const [shiftLogs, setShiftLogs] = useState([]);
  const [isLogsLoading, setIsLogsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    // Fetch History Data
    const loadData = async () => {
      setIsLogsLoading(true);
      try {
        const res = await fetchHistory();
        if (res && res.items) {
          setShiftLogs(res.items);
        } else if (Array.isArray(res)) {
          setShiftLogs(res);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setIsLogsLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleShiftAdded = (newShift) => {
    // Add the new shift at the top of the table locally
    setShiftLogs((prev) => [newShift, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header certLoading={certLoading} onCertClick={() => { setCertLoading(true); setTimeout(() => setCertLoading(false), 2000); }} />

      <main className="max-w-7xl mx-auto px-8 py-8">
        
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Good morning, Ali 👋</h1>
          <p className="text-sm text-slate-500">Here is your earnings overview for this week.</p>
        </div>

        <LogShiftModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onShiftAdded={handleShiftAdded}
        />

        

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
          
          {/* Action Card triggering Log Shift Modal */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-center items-center text-center">
            <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mb-4">
              <Upload className="w-8 h-8 text-teal-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Record Your Earnings</h2>
            <p className="text-sm text-slate-500 mb-6">Log your completed shifts to track income and view analytics.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" /> Log New Shift
            </button>
          </div>

        
        </div>

        {/* Shift Logs Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Recent Shift Logs</h2>
            <span className="text-xs bg-slate-100 text-slate-600 font-medium px-3 py-1 rounded-full">
              {shiftLogs.length} entries
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {["Date", "Platform", "Hours", "Gross", "Deductions", "Net Earned", "Status", "Proof"].map((h) => (
                    <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLogsLoading ? (
                  Array.from({ length: 3 }).map((_, idx) => (
                    <tr key={`skeleton-${idx}`} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-12"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                      <td className="px-6 py-4"><div className="h-6 w-6 bg-slate-200 rounded"></div></td>
                    </tr>
                  ))
                ) : shiftLogs.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center text-sm text-slate-500">
                      No shift records found. Submit your first shift log using the button above.
                    </td>
                  </tr>
                ) : (
                  shiftLogs.slice(0, 5).map((log) => (
                  <tr key={log._id || log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-600">{log.date}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{log.platform}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{log.hours_worked || log.hours}h</td>
                    <td className="px-6 py-4 text-sm text-slate-600">PKR {(log.gross_earned || log.gross || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">PKR {(log.deduction || log.deductions || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">PKR {(log.net_received || log.net || 0).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                        log.status === 'verified' || log.status === 'Confirmed' ? statusStyles.Confirmed :
                        log.status === 'pending' || log.status === 'Pending' ? statusStyles.Pending : statusStyles.Flagged
                      }`}>
                        <StatusIcon status={log.status === 'verified' ? 'Confirmed' : log.status === 'pending' ? 'Pending' : 'Flagged'} />
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {log.screenshot_url ? (
                        <button
                          onClick={() => setSelectedImage(log.screenshot_url)}
                          className="relative block w-10 h-10 rounded-md overflow-hidden border border-slate-200 hover:ring-2 hover:ring-teal-500 transition-all group shrink-0"
                          title="View Screenshot"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={log.screenshot_url} 
                            alt="Proof copy" 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <ImageIcon className="w-4 h-4 text-white" />
                          </div>
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No proof</span>
                      )}
                    </td>
                  </tr>
                ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Full Image Lightbox Modal */}
        {selectedImage && (
          <div 
            className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex justify-center items-center p-4 cursor-zoom-out animate-in fade-in"
            onClick={() => setSelectedImage(null)}
          >
            <div 
              className="relative max-w-4xl w-full max-h-[90vh] bg-white rounded-xl shadow-2xl flex flex-col cursor-auto animate-in zoom-in-95"
              onClick={(e) => e.stopPropagation()} // Prevent clicking the image card from closing the modal
            >
              <div className="absolute -top-4 -right-4 z-10">
                <button 
                  onClick={() => setSelectedImage(null)}
                  className="bg-white text-slate-500 hover:text-slate-900 border border-slate-200 p-2 rounded-full shadow-md transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-2 overflow-auto bg-slate-100 rounded-xl flex items-center justify-center min-h-[40vh]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={selectedImage} 
                  alt="Shift Proof Screenshot" 
                  className="object-contain max-h-[85vh] rounded-lg shadow-sm"
                />
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}