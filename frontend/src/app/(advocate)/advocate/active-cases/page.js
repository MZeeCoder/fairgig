"use client";

import { useState, useEffect } from "react";
import { Loader2, ShieldAlert, MessageSquare, CheckCircle, Clock, TrendingUp, MapPin } from "lucide-react";
import toast from "react-hot-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { fetchGrievances, resolveGrievance, fetchCommissionTrend, fetchVolatility, getComplaintById } from "@/services/advocate.api";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-md border border-slate-100 flex flex-col gap-1">
        <p className="text-slate-500 font-medium text-xs">{label}</p>
        <p className="font-bold text-slate-800 text-sm">
          PKR {payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export default function AdvocateDashboard() {
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [advocateNotes, setAdvocateNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [platformConfig, setPlatformConfig] = useState("Uber");
  const [cityConfig, setCityConfig] = useState("Lahore");
  const [trendData, setTrendData] = useState([]);
  const [cityData, setCityData] = useState([]);

  useEffect(() => {
    loadCases();
   
  }, []);

 

  const loadCases = async () => {
    setIsLoading(true);
    const res = await fetchGrievances();
    if (res.success) {
      setCases(res.data);
      if (res.data.length > 0) {
        setSelectedCase(res.data[0]);
        setAdvocateNotes(res.data[0].notes);
      }
    }
    setIsLoading(false);
  };

  const handleSelectCase = async (c) => {
    setSelectedCase(c);
    setAdvocateNotes(c.notes || "");
    
    // Fetch fresh full details directly from backend
    const detailedRes = await getComplaintById(c.id);
    if (detailedRes?.success && detailedRes.data) {
      setSelectedCase(detailedRes.data);
      setAdvocateNotes(detailedRes.data.notes || "");
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedCase) return;
    setIsSaving(true);
    const toastId = toast.loading("Updating case status...");
    
    try {
      await resolveGrievance(selectedCase.id, newStatus, advocateNotes);
      
      // Update local state
      const updatedCases = cases.map(c => 
        c.id === selectedCase.id ? { ...c, status: newStatus, notes: advocateNotes } : c
      );
      setCases(updatedCases);
      setSelectedCase({ ...selectedCase, status: newStatus, notes: advocateNotes });
      toast.success("Case status updated dynamically!", { id: toastId });
    } catch (error) {
      toast.error("Failed to update case status.", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-full">
      
      {/* Left Column: Case Inbox */}
      <div className="w-[380px] bg-white border-r border-slate-200 flex flex-col h-full shrink-0">
        <div className="p-5 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">Case Inbox</h2>
          <p className="text-xs text-slate-500 mt-1">Review and resolve worker grievances</p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="p-4 rounded-xl border border-slate-200 bg-white animate-pulse">
                  <div className="flex justify-between items-start mb-3">
                    <div className="h-4 bg-slate-200 rounded w-16"></div>
                    <div className="h-5 bg-slate-200 rounded-full w-20"></div>
                  </div>
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2 mt-1"></div>
                </div>
              ))}
            </div>
          ) : cases.map((c) => (
            <div 
              key={c.id}
              onClick={() => handleSelectCase(c)}
              className={`p-4 rounded-xl cursor-pointer border transition-all ${
                selectedCase?.id === c.id 
                  ? "bg-teal-50 border-teal-200 shadow-sm" 
                  : "bg-white border-slate-200 hover:border-teal-300"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-slate-900 text-sm">{c.id.slice(-8).toUpperCase()}</span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                  c.status === 'open' ? 'bg-red-100 text-red-700' : 
                  c.status === 'investigating' ? 'bg-amber-100 text-amber-700' : 
                  'bg-emerald-100 text-emerald-700'
                }`}>
                  {c.status}
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-700 truncate">{c.category}</p>
              <p className="text-xs text-slate-500 mt-1">{c.worker?.name || 'Unknown Worker'} • {c.platform}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Case Workspace */}
      <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
        {selectedCase && (
          <div className="max-w-3xl mx-auto space-y-6">
            
            {/* Header */}
            <div className="flex items-center justify-between bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{selectedCase.id}: {selectedCase.category}</h1>
                <p className="text-sm text-slate-500 mt-1">Submitted on {selectedCase.date}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 mb-1">Worker / Platform</p>
                <p className="font-bold text-slate-900">{selectedCase.worker?.name || 'Unknown Worker'} <span className="text-slate-400 font-normal">({selectedCase.platform})</span></p>
              </div>
            </div>

            {/* Complaint Details */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-500" /> Worker Complaint
              </h3>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm text-slate-700 leading-relaxed">
                {selectedCase.description}
              </div>
            </div>

            {/* Advocate Action Area */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-teal-500" /> Investigation Notes
              </h3>
              
              <textarea 
                rows="4"
                value={advocateNotes}
                onChange={(e) => setAdvocateNotes(e.target.value)}
                placeholder="Log your communication with the platform and steps taken..."
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none mb-4"
              ></textarea>

              <div className="flex items-end gap-3">
               
                
                <button 
                  onClick={() => handleUpdateStatus('Resolved')}
                  disabled={isSaving || selectedCase.status === 'Resolved'}
                  className="flex-1 flex items-center justify-center gap-2 bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50 font-bold py-2.5 rounded-lg transition-colors"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Resolve Case
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}