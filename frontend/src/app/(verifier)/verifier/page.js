"use client";

import { useState, useEffect } from "react";
import { Loader2, CheckCircle, AlertTriangle, XCircle, Search, Calendar, Clock, DollarSign, ShieldCheck } from "lucide-react";
import { fetchPendingShifts, updateShiftStatus } from "@/services/verifier.api";

export default function VerifierQueuePage() {
  const [queue, setQueue] = useState([]);
  const [selectedShift, setSelectedShift] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // 'Confirmed', 'Flagged', 'Unverifiable'

  // Fetch Data on Load
  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = async () => {
    setIsLoading(true);
    try {
      const res = await fetchPendingShifts();
      if (res.success) {
        setQueue(res.data);
        if (res.data.length > 0) setSelectedShift(res.data[0]); // Auto-select first item
      }
    } catch (err) {
      console.error("Failed to load queue");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (status) => {
    if (!selectedShift) return;
    setActionLoading(status);

    try {
      await updateShiftStatus(selectedShift.id, status);
      
      // Artificial delay to let user see the loading state
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Remove from queue and select the next one
      const updatedQueue = queue.filter(s => s.id !== selectedShift.id);
      setQueue(updatedQueue);
      setSelectedShift(updatedQueue.length > 0 ? updatedQueue[0] : null);

    } catch (err) {
      alert("Action failed. Try again.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="flex h-full bg-slate-50">
      
      {/* Left Column: The Queue */}
      <div className="w-[350px] bg-white border-r border-slate-200 flex flex-col h-full shrink-0">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h3 className="text-sm font-bold text-slate-900 flex justify-between items-center">
            Pending Reviews
            <span className="bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full text-xs">{queue.length}</span>
          </h3>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search platform..." 
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {isLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-teal-600" /></div>
          ) : queue.length === 0 ? (
            <div className="text-center p-8 text-slate-500 text-sm">Queue is empty! Great job.</div>
          ) : (
            queue.map((shift) => (
              <div 
                key={shift.id}
                onClick={() => setSelectedShift(shift)}
                className={`p-4 rounded-xl cursor-pointer border transition-all ${
                  selectedShift?.id === shift.id 
                    ? "bg-teal-50 border-teal-200 shadow-sm" 
                    : "bg-white border-slate-200 hover:border-teal-300"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-slate-900 text-sm">Shift Records</span>
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{shift.platform}</span>
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                  <Calendar className="w-3.5 h-3.5" /> {shift.date}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Column: Review Panel */}
      <div className="flex-1 overflow-y-auto p-8">
        {!selectedShift ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <ShieldCheck className="w-16 h-16 mb-4 opacity-20" />
            <p>Select a shift from the queue to begin verification.</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Review Submission</h2>

            <div className="grid grid-cols-2 gap-8">
              
              {/* Data Details Card */}
              <div className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Shift Claim Details</h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">Platform</p>
                        <p className="font-bold text-slate-900">{selectedShift.platform}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Calendar className="w-3 h-3"/> Date</p>
                        <p className="font-semibold text-slate-700">{selectedShift.date}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                      <div>
                        <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Clock className="w-3 h-3"/> Hours Logged</p>
                        <p className="font-semibold text-slate-700">{selectedShift.hours} h</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><DollarSign className="w-3 h-3"/> Gross Earned</p>
                        <p className="font-semibold text-slate-700">PKR {selectedShift.gross?.toLocaleString() ?? 0}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                      <div>
                        <p className="text-xs text-slate-500 mb-1 flex items-center gap-1 text-red-500"><AlertTriangle className="w-3 h-3"/> Deduction</p>
                        <p className="font-semibold text-red-600">PKR {selectedShift.deduction?.toLocaleString() ?? 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><DollarSign className="w-full text-teal-600 h-3"/> Net Claimed</p>
                        <p className="text-2xl font-bold text-teal-600">PKR {selectedShift.net?.toLocaleString() ?? 0}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Verification Actions</h3>
                  
                  <div className="space-y-3">
                    <button 
                      onClick={() => handleAction("Confirmed")}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-colors"
                    >
                      {actionLoading === "Confirmed" ? <Loader2 className="w-5 h-5 animate-spin"/> : <CheckCircle className="w-5 h-5" />}
                      Approve & Confirm
                    </button>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => handleAction("Flagged")}
                        disabled={actionLoading}
                        className="flex items-center justify-center gap-2 bg-white border-2 border-amber-500 text-amber-600 hover:bg-amber-50 disabled:opacity-50 font-bold py-2.5 rounded-lg transition-colors"
                      >
                        {actionLoading === "Flagged" ? <Loader2 className="w-4 h-4 animate-spin"/> : <AlertTriangle className="w-4 h-4" />}
                        Flag Issue
                      </button>
                      <button 
                        onClick={() => handleAction("Unverifiable")}
                        disabled={actionLoading}
                        className="flex items-center justify-center gap-2 bg-white border-2 border-red-500 text-red-600 hover:bg-red-50 disabled:opacity-50 font-bold py-2.5 rounded-lg transition-colors"
                      >
                        {actionLoading === "Unverifiable" ? <Loader2 className="w-4 h-4 animate-spin"/> : <XCircle className="w-4 h-4" />}
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Image Proof Column */}
              <div>
                <div className="bg-slate-200 rounded-xl border border-slate-300 h-[600px] flex items-center justify-center overflow-hidden shadow-inner">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={selectedShift.screenshot} 
                    alt="Proof" 
                    className="w-full h-full object-contain bg-black"
                  />
                </div>
                <p className="text-center text-xs text-slate-500 mt-3">Screenshot uploaded by worker</p>
              </div>

            </div>
          </div>
        )}
      </div>

    </div>
  );
}