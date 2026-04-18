"use client";

import { useState, useEffect } from "react";
import { Filter, Loader2, Calendar, LayoutDashboard } from "lucide-react";
import { fetchPlatforms, fetchWorkerDashboard } from "../../../../services/earnings.api";
import AnalyticsModal from "./AnalyticsModal";

export default function HistoryPage() {
  const [platforms, setPlatforms] = useState([]);
  
  // Form State
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const loadPlatforms = async () => {
      try {
        const res = await fetchPlatforms();
        setPlatforms(Array.isArray(res?.data) ? res.data : []);
      } catch (error) {
        console.error("Failed to load platforms", error);
      }
    };
    loadPlatforms();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      alert("Start Date cannot be after End Date.");
      return;
    }

    setIsLoading(true);
    setDashboardData(null);
    try {
      const res = await fetchWorkerDashboard({
        platform: selectedPlatform || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      });
      setDashboardData(res.data || res);
      // Open modal right away once generated successfully
      setIsModalOpen(true);
    } catch (error) {
      console.error("Failed to generate analytics", error);
      alert("Failed to fetch analytics data.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900">Analytics Dashboard</h1>
        <p className="text-slate-500 mt-2">Generate and view your earnings analytics by filtering platform and date ranges.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 md:p-8">
        <form onSubmit={handleGenerate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Platform Selection */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 block">Platform</label>
              <div className="relative">
                <Filter className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <select 
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  className="w-full pl-10 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 appearance-none cursor-pointer"
                >
                  <option value="">All Platforms</option>
                  {platforms.map((p, idx) => {
                    const pName = typeof p === 'string' ? p : p.name || p.platform;
                    return (
                      <option key={idx} value={pName}>
                        {pName}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 block">Start Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input 
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 block">End Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input 
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
            </div>

          </div>

          <div className="pt-4 flex justify-end">
            <button 
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 bg-teal-600 text-white hover:bg-teal-700 font-medium px-6 py-3 rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <LayoutDashboard className="w-5 h-5" />
                  Generate Dashboard
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {isModalOpen && dashboardData && (
        <AnalyticsModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          data={dashboardData}
          platform={selectedPlatform}
          startDate={startDate}
          endDate={endDate}
        />
      )}
    </main>
  );
}